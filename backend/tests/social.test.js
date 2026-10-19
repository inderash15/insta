import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Follow } from '../src/models/Follow.js';

describe('Social Graph & Profiles API Tests', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Follow.deleteMany({});
  });

  const registerHelper = async (userData) => {
    const res = await request(app).post('/api/auth/register').send(userData);
    return {
      user: res.body.user,
      cookie: res.headers['set-cookie']
    };
  };

  it('1. Fetches a public user profile and reports accurate relationship state', async () => {
    const userA = await registerHelper({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      fullName: 'Alice Smith'
    });

    const userB = await registerHelper({
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123',
      fullName: 'Bob Jones'
    });

    // Bob views Alice's profile
    const res = await request(app)
      .get('/api/users/alice')
      .set('Cookie', userB.cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.profile.username).toBe('alice');
    expect(res.body.profile.relationship.isSelf).toBe(false);
    expect(res.body.profile.relationship.isFollowing).toBe(false);
    expect(res.body.profile.relationship.canViewContent).toBe(true);
  });

  it('2. Updates authenticated user profile details', async () => {
    const userA = await registerHelper({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      fullName: 'Alice Smith'
    });

    const res = await request(app)
      .patch('/api/users/profile')
      .set('Cookie', userA.cookie)
      .send({
        fullName: 'Alice In Wonderland',
        bio: 'Exploring the digital universe',
        website: 'https://alice.example.com',
        isPrivate: true
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.fullName).toBe('Alice In Wonderland');
    expect(res.body.user.bio).toBe('Exploring the digital universe');
    expect(res.body.user.website).toBe('https://alice.example.com');
    expect(res.body.user.isPrivate).toBe(true);
  });

  it('3. Follows and unfollows a public user with atomic count updates', async () => {
    const userA = await registerHelper({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      fullName: 'Alice Smith'
    });

    const userB = await registerHelper({
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123',
      fullName: 'Bob Jones'
    });

    // Bob follows Alice (Public)
    const followRes = await request(app)
      .post(`/api/users/${userA.user._id}/follow`)
      .set('Cookie', userB.cookie);

    expect(followRes.status).toBe(200);
    expect(followRes.body.status).toBe('accepted');

    // Verify atomic counts
    const updatedAlice = await User.findById(userA.user._id);
    const updatedBob = await User.findById(userB.user._id);
    expect(updatedAlice.counts.followers).toBe(1);
    expect(updatedBob.counts.following).toBe(1);

    // Bob unfollows Alice
    const unfollowRes = await request(app)
      .post(`/api/users/${userA.user._id}/unfollow`)
      .set('Cookie', userB.cookie);

    expect(unfollowRes.status).toBe(200);

    const decrementedAlice = await User.findById(userA.user._id);
    const decrementedBob = await User.findById(userB.user._id);
    expect(decrementedAlice.counts.followers).toBe(0);
    expect(decrementedBob.counts.following).toBe(0);
  });

  it('4. Follows a private user and handles pending request lifecycle', async () => {
    // Alice is private
    const userA = await registerHelper({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      fullName: 'Alice Smith'
    });
    await User.findByIdAndUpdate(userA.user._id, { isPrivate: true });

    // Bob wants to follow Alice
    const userB = await registerHelper({
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123',
      fullName: 'Bob Jones'
    });

    const reqRes = await request(app)
      .post(`/api/users/${userA.user._id}/follow`)
      .set('Cookie', userB.cookie);

    expect(reqRes.status).toBe(200);
    expect(reqRes.body.status).toBe('pending');
    expect(reqRes.body.message).toContain('Follow request sent');

    // Counts remain 0 before acceptance
    let checkAlice = await User.findById(userA.user._id);
    expect(checkAlice.counts.followers).toBe(0);

    // Alice views pending requests
    const pendingListRes = await request(app)
      .get('/api/users/requests/pending')
      .set('Cookie', userA.cookie);

    expect(pendingListRes.status).toBe(200);
    expect(pendingListRes.body.requests.length).toBe(1);
    expect(pendingListRes.body.requests[0].follower.username).toBe('bob');

    // Alice accepts Bob's request
    const acceptRes = await request(app)
      .post(`/api/users/requests/${userB.user._id}/accept`)
      .set('Cookie', userA.cookie);

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.message).toContain('accepted');

    // Verify counts are now incremented
    checkAlice = await User.findById(userA.user._id);
    const checkBob = await User.findById(userB.user._id);
    expect(checkAlice.counts.followers).toBe(1);
    expect(checkBob.counts.following).toBe(1);
  });

  it('5. Blocks a user, severs mutual follow relationships, and hides profile', async () => {
    const userA = await registerHelper({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      fullName: 'Alice Smith'
    });

    const userB = await registerHelper({
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123',
      fullName: 'Bob Jones'
    });

    // Establish mutual follows
    await request(app).post(`/api/users/${userA.user._id}/follow`).set('Cookie', userB.cookie);
    await request(app).post(`/api/users/${userB.user._id}/follow`).set('Cookie', userA.cookie);

    // Alice blocks Bob
    const blockRes = await request(app)
      .post(`/api/users/${userB.user._id}/block`)
      .set('Cookie', userA.cookie);

    expect(blockRes.status).toBe(200);
    expect(blockRes.body.success).toBe(true);

    // Follow records removed
    const followExists = await Follow.findOne({
      $or: [
        { follower: userA.user._id, following: userB.user._id },
        { follower: userB.user._id, following: userA.user._id }
      ]
    });
    expect(followExists).toBeNull();

    // Bob can no longer view Alice's profile (returns 404)
    const hiddenProfileRes = await request(app)
      .get('/api/users/alice')
      .set('Cookie', userB.cookie);

    expect(hiddenProfileRes.status).toBe(404);

    // Alice views her blocked users list
    const blockedListRes = await request(app)
      .get('/api/users/profile/blocked')
      .set('Cookie', userA.cookie);
    expect(blockedListRes.status).toBe(200);
    expect(blockedListRes.body.success).toBe(true);
    expect(blockedListRes.body.blockedUsers).toHaveLength(1);
    expect(blockedListRes.body.blockedUsers[0].username).toBe('bob');
  });

  it('6. Fetches suggested people via /api/explore/people', async () => {
    const userA = await registerHelper({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      fullName: 'Alice Smith'
    });

    const userB = await registerHelper({
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123',
      fullName: 'Bob Jones'
    });

    // Unauthenticated request
    const publicRes = await request(app).get('/api/explore/people?limit=5');
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.success).toBe(true);
    expect(publicRes.body.users.length).toBeGreaterThanOrEqual(2);

    // Authenticated request (excludes self)
    const authRes = await request(app)
      .get('/api/explore/people?limit=5')
      .set('Cookie', userA.cookie);
    expect(authRes.status).toBe(200);
    expect(authRes.body.success).toBe(true);
    expect(authRes.body.users.some(u => u.username === 'alice')).toBe(false);
    expect(authRes.body.users.some(u => u.username === 'bob')).toBe(true);
  });
});
