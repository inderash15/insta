import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Story } from '../src/models/Story.js';
import { Note } from '../src/models/Note.js';
import { Follow } from '../src/models/Follow.js';
import { Conversation } from '../src/models/Conversation.js';
import { Message } from '../src/models/Message.js';
import { Highlight } from '../src/models/Highlight.js';

describe('Project Aurora — Stories & Notes Lifecycle Integration Tests', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Story.deleteMany({});
    await Note.deleteMany({});
    await Follow.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Highlight.deleteMany({});
  });

  const registerHelper = async (userData) => {
    const res = await request(app).post('/api/auth/register').send(userData);
    return {
      user: res.body.user,
      cookie: res.headers['set-cookie']
    };
  };

  it('1. Stories: Enforces close_friends audience privacy', async () => {
    const alice = await registerHelper({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      fullName: 'Alice Walker'
    });

    const bob = await registerHelper({
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123',
      fullName: 'Bob Smith'
    });

    const charlie = await registerHelper({
      username: 'charlie',
      email: 'charlie@example.com',
      password: 'password123',
      fullName: 'Charlie Brown'
    });

    // Bob and Charlie both follow Alice
    await Follow.create({ follower: bob.user.id, following: alice.user.id, status: 'accepted' });
    await Follow.create({ follower: charlie.user.id, following: alice.user.id, status: 'accepted' });

    // Alice adds Bob to close friends, but NOT Charlie
    await User.findByIdAndUpdate(alice.user.id, {
      $push: { closeFriends: bob.user.id }
    });

    // Alice creates a Close Friends story
    const fakeImageBuffer = Buffer.from('fake image content');
    const storyRes = await request(app)
      .post('/api/stories')
      .set('Cookie', alice.cookie)
      .attach('media', fakeImageBuffer, 'story_close_friends.jpg')
      .field('audience', 'close_friends')
      .field('caption', 'Exclusive close friends update');

    expect(storyRes.status).toBe(201);
    expect(storyRes.body.story.audience).toBe('close_friends');

    // Bob (close friend) fetches tray -> should see Alice's story
    const bobTray = await request(app).get('/api/stories/tray').set('Cookie', bob.cookie);
    expect(bobTray.status).toBe(200);
    const aliceGroupInBob = bobTray.body.tray.find((g) => g.author._id === alice.user.id);
    expect(aliceGroupInBob).toBeDefined();
    expect(aliceGroupInBob.stories.length).toBe(1);

    // Charlie (follower, but NOT close friend) fetches tray -> should NOT see Alice's close friends story
    const charlieTray = await request(app).get('/api/stories/tray').set('Cookie', charlie.cookie);
    expect(charlieTray.status).toBe(200);
    const aliceGroupInCharlie = charlieTray.body.tray.find((g) => g.author._id === alice.user.id);
    expect(aliceGroupInCharlie).toBeUndefined();
  });

  it('2. Stories: Authorizes viewer list inspection and records view with timestamps', async () => {
    const alice = await registerHelper({
      username: 'alice_v',
      email: 'alice_v@example.com',
      password: 'password123',
      fullName: 'Alice Viewer'
    });

    const bob = await registerHelper({
      username: 'bob_v',
      email: 'bob_v@example.com',
      password: 'password123',
      fullName: 'Bob Viewer'
    });

    const fakeImage = Buffer.from('test');
    const storyRes = await request(app)
      .post('/api/stories')
      .set('Cookie', alice.cookie)
      .attach('media', fakeImage, 'img.jpg');

    const storyId = storyRes.body.story._id;

    // Bob views the story
    const viewRes = await request(app)
      .post(`/api/stories/${storyId}/view`)
      .set('Cookie', bob.cookie);
    expect(viewRes.status).toBe(200);

    // Alice inspects viewer list
    const viewersRes = await request(app)
      .get(`/api/stories/${storyId}/viewers`)
      .set('Cookie', alice.cookie);
    expect(viewersRes.status).toBe(200);
    expect(viewersRes.body.viewers.length).toBe(1);
    expect(viewersRes.body.viewers[0].user._id).toBe(bob.user.id);
    expect(viewersRes.body.viewers[0].viewedAt).toBeDefined();

    // Bob tries to inspect viewer list -> 403 Forbidden
    const bobViewersRes = await request(app)
      .get(`/api/stories/${storyId}/viewers`)
      .set('Cookie', bob.cookie);
    expect(bobViewersRes.status).toBe(403);
  });

  it('3. Stories: Replies to story route directly into DM conversation', async () => {
    const alice = await registerHelper({
      username: 'alice_rep',
      email: 'alice_rep@example.com',
      password: 'password123',
      fullName: 'Alice Rep'
    });

    const bob = await registerHelper({
      username: 'bob_rep',
      email: 'bob_rep@example.com',
      password: 'password123',
      fullName: 'Bob Rep'
    });

    const fakeImage = Buffer.from('test');
    const storyRes = await request(app)
      .post('/api/stories')
      .set('Cookie', alice.cookie)
      .attach('media', fakeImage, 'pic.png');

    const storyId = storyRes.body.story._id;

    // Bob replies to Alice's story
    const replyRes = await request(app)
      .post(`/api/stories/${storyId}/reply`)
      .set('Cookie', bob.cookie)
      .send({ text: 'Love this photo!' });

    expect(replyRes.status).toBe(201);
    expect(replyRes.body.success).toBe(true);
    expect(replyRes.body.data.storyReply).toBeDefined();
    expect(replyRes.body.data.storyReply.storyId).toBe(storyId);
    expect(replyRes.body.data.text).toBe('Love this photo!');

    // Verify conversation between Alice and Bob now has this message
    const conv = await Conversation.findById(replyRes.body.data.conversation);
    expect(conv.participants.map((p) => p.toString())).toContain(alice.user.id);
    expect(conv.participants.map((p) => p.toString())).toContain(bob.user.id);
  });

  it('4. Highlights: Creates and retrieves user profile highlights', async () => {
    const user = await registerHelper({
      username: 'hl_user',
      email: 'hl@example.com',
      password: 'password123',
      fullName: 'Highlight User'
    });

    const fakeImage = Buffer.from('test');
    const s1 = await request(app)
      .post('/api/stories')
      .set('Cookie', user.cookie)
      .attach('media', fakeImage, 's1.jpg');

    const hlRes = await request(app)
      .post('/api/stories/highlights')
      .set('Cookie', user.cookie)
      .send({
        title: 'Trips',
        coverUrl: '/uploads/stories/cover.jpg',
        stories: [s1.body.story._id]
      });

    expect(hlRes.status).toBe(201);
    expect(hlRes.body.highlight.title).toBe('Trips');

    const getHlRes = await request(app)
      .get(`/api/stories/highlights/user/${user.user.id}`)
      .set('Cookie', user.cookie);

    expect(getHlRes.status).toBe(200);
    expect(getHlRes.body.highlights.length).toBe(1);
    expect(getHlRes.body.highlights[0].title).toBe('Trips');
  });

  it('5. Notes: Enforces 60-character limit and audience filtering', async () => {
    const alice = await registerHelper({
      username: 'alice_note',
      email: 'alice_n@example.com',
      password: 'password123',
      fullName: 'Alice Note'
    });

    const bob = await registerHelper({
      username: 'bob_note',
      email: 'bob_n@example.com',
      password: 'password123',
      fullName: 'Bob Note'
    });

    // Attempting note with 61 characters -> rejected 400
    const overLimitRes = await request(app)
      .post('/api/notes')
      .set('Cookie', alice.cookie)
      .send({ text: 'A'.repeat(61) });

    expect(overLimitRes.status).toBe(400);
    expect(overLimitRes.body.message).toMatch(/60 characters/i);

    // Valid note (under 60 chars)
    const validRes = await request(app)
      .post('/api/notes')
      .set('Cookie', alice.cookie)
      .send({ text: 'Working on Project Aurora today! 🚀', mood: '🚀' });

    expect(validRes.status).toBe(201);
    expect(validRes.body.note.text).toBe('Working on Project Aurora today! 🚀');

    // Mutual follow check: Bob and Alice follow each other
    await Follow.create({ follower: alice.user.id, following: bob.user.id, status: 'accepted' });
    await Follow.create({ follower: bob.user.id, following: alice.user.id, status: 'accepted' });

    const bobTray = await request(app).get('/api/notes/tray').set('Cookie', bob.cookie);
    expect(bobTray.status).toBe(200);
    expect(bobTray.body.notes.some((n) => n.text === 'Working on Project Aurora today! 🚀')).toBe(
      true
    );

    // Bob replies to Alice's note
    const noteId = validRes.body.note._id;
    const replyRes = await request(app)
      .post(`/api/notes/${noteId}/reply`)
      .set('Cookie', bob.cookie)
      .send({ text: 'Sounds awesome!' });

    expect(replyRes.status).toBe(201);
    expect(replyRes.body.data.noteReply).toBeDefined();
    expect(replyRes.body.data.noteReply.text).toBe('Working on Project Aurora today! 🚀');

    // Alice deletes her note
    const delRes = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set('Cookie', alice.cookie);
    expect(delRes.status).toBe(200);

    // Tray now empty
    const trayAfterDel = await request(app).get('/api/notes/tray').set('Cookie', bob.cookie);
    expect(trayAfterDel.body.notes.some((n) => n._id === noteId)).toBe(false);
  });

  it('5. Stories: User active stories API (GET /api/stories/user/:userId) correctly returns active stories for profile display', async () => {
    const dave = await registerHelper({
      username: 'dave',
      email: 'dave@example.com',
      password: 'password123',
      fullName: 'Dave Miller'
    });

    const emma = await registerHelper({
      username: 'emma',
      email: 'emma@example.com',
      password: 'password123',
      fullName: 'Emma Watson'
    });

    // Dave creates a story
    const fakeImageBuffer = Buffer.from('fake image content');
    await request(app)
      .post('/api/stories')
      .set('Cookie', dave.cookie)
      .attach('media', fakeImageBuffer, 'story_dave.jpg')
      .field('audience', 'everyone')
      .field('caption', 'Dave profile story');

    // Emma queries Dave active stories by user ID
    const resById = await request(app)
      .get(`/api/stories/user/${dave.user.id}`)
      .set('Cookie', emma.cookie);
    expect(resById.status).toBe(200);
    expect(resById.body.success).toBe(true);
    expect(resById.body.storyGroup).toBeDefined();
    expect(resById.body.storyGroup.stories.length).toBe(1);
    expect(resById.body.storyGroup.stories[0].caption).toBe('Dave profile story');

    // Emma queries Dave active stories by username
    const resByUsername = await request(app)
      .get('/api/stories/user/dave')
      .set('Cookie', emma.cookie);
    expect(resByUsername.status).toBe(200);
    expect(resByUsername.body.storyGroup.stories.length).toBe(1);

    // Query non-existent user returns 404
    const resNotFound = await request(app)
      .get('/api/stories/user/nonexistent_user')
      .set('Cookie', emma.cookie);
    expect(resNotFound.status).toBe(404);
  });
});
