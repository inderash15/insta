import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import http from 'http';
import request from 'supertest';
import { io as ClientIO } from 'socket.io-client';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { initSocket } from '../src/config/socket.js';
import { User } from '../src/models/User.js';
import { Post } from '../src/models/Post.js';
import { Like } from '../src/models/Like.js';
import { Bookmark } from '../src/models/Bookmark.js';
import { Comment } from '../src/models/Comment.js';
import { Follow } from '../src/models/Follow.js';
import { Story } from '../src/models/Story.js';
import { Reel } from '../src/models/Reel.js';
import { Notification } from '../src/models/Notification.js';

describe('Real-Time Platform Integration Tests', () => {
  let server;
  let serverPort;
  let clientSockets = [];

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();

    server = http.createServer(app);
    initSocket(server);
    await new Promise((resolve) => {
      server.listen(0, () => {
        serverPort = server.address().port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    for (const s of clientSockets) {
      if (s.connected) s.disconnect();
    }
    await new Promise((resolve) => server.close(resolve));
    await disconnectDB();
  });

  beforeEach(async () => {
    for (const s of clientSockets) {
      if (s.connected) s.disconnect();
    }
    clientSockets = [];
    await User.deleteMany({});
    await Post.deleteMany({});
    await Like.deleteMany({});
    await Bookmark.deleteMany({});
    await Comment.deleteMany({});
    await Follow.deleteMany({});
    await Story.deleteMany({});
    await Reel.deleteMany({});
    await Notification.deleteMany({});
  });

  const registerHelper = async (userData) => {
    const res = await request(app).post('/api/auth/register').send(userData);
    return {
      user: res.body.user,
      cookie: res.headers['set-cookie']
    };
  };

  const createSocketClient = (tokenCookie) => {
    const socket = ClientIO(`http://localhost:${serverPort}`, {
      extraHeaders: tokenCookie ? { cookie: tokenCookie[0] } : {},
      transports: ['websocket'],
      forceNew: true
    });
    clientSockets.push(socket);
    return socket;
  };

  it('1. User A likes a post and User B sees the updated count live without refreshing', async () => {
    const userA = await registerHelper({
      username: 'alice_rt',
      email: 'alice_rt@example.com',
      password: 'password123',
      fullName: 'Alice Realtime'
    });

    const userB = await registerHelper({
      username: 'bob_rt',
      email: 'bob_rt@example.com',
      password: 'password123',
      fullName: 'Bob Realtime'
    });

    // Create a post for Alice
    const post = await Post.create({
      author: userA.user.id || userA.user._id,
      caption: 'Real-time test post',
      media: [{ url: '/test.jpg', type: 'image' }]
    });

    // Connect User B socket
    const socketB = createSocketClient(userB.cookie);
    await new Promise((resolve) => socketB.on('connect', resolve));
    socketB.emit('join_user', userB.user.id || userB.user._id);

    // Prepare promise for post:liked event on User B
    const likedPromise = new Promise((resolve) => {
      socketB.on('post:liked', (data) => resolve(data));
    });

    // User A likes the post
    const likeRes = await request(app)
      .post(`/api/posts/${post._id}/like`)
      .set('Cookie', userA.cookie);

    expect(likeRes.status).toBe(200);
    expect(likeRes.body.liked).toBe(true);
    expect(likeRes.body.likesCount).toBe(1);

    // User B receives the event with updated likesCount in real time
    const eventData = await likedPromise;
    expect(eventData.postId.toString()).toBe(post._id.toString());
    expect(eventData.likesCount).toBe(1);
    expect(eventData.userId.toString()).toBe((userA.user.id || userA.user._id).toString());
  });

  it('2. Post unliking decrements count atomically and synchronizes to clients in real time', async () => {
    const userA = await registerHelper({
      username: 'alice_un',
      email: 'alice_un@example.com',
      password: 'password123',
      fullName: 'Alice Unlike'
    });

    const post = await Post.create({
      author: userA.user.id || userA.user._id,
      caption: 'Unlike post test',
      media: [{ url: '/test.jpg', type: 'image' }],
      likesCount: 1
    });

    await Like.create({
      user: userA.user.id || userA.user._id,
      targetType: 'post',
      targetId: post._id
    });

    const socketA = createSocketClient(userA.cookie);
    await new Promise((resolve) => socketA.on('connect', resolve));
    socketA.emit('join_user', userA.user.id || userA.user._id);

    const unlikedPromise = new Promise((resolve) => {
      socketA.on('post:unliked', (data) => resolve(data));
    });

    // Unlike post
    const unlikeRes = await request(app)
      .post(`/api/posts/${post._id}/like`)
      .set('Cookie', userA.cookie);

    expect(unlikeRes.status).toBe(200);
    expect(unlikeRes.body.liked).toBe(false);
    expect(unlikeRes.body.likesCount).toBe(0);

    const event = await unlikedPromise;
    expect(event.postId.toString()).toBe(post._id.toString());
    expect(event.likesCount).toBe(0);
  });

  it('3. Comments appear in real time and deletions update comment count live', async () => {
    const userA = await registerHelper({
      username: 'alice_cmt',
      email: 'alice_cmt@example.com',
      password: 'password123',
      fullName: 'Alice Comment'
    });

    const userB = await registerHelper({
      username: 'bob_cmt',
      email: 'bob_cmt@example.com',
      password: 'password123',
      fullName: 'Bob Comment'
    });

    const post = await Post.create({
      author: userA.user.id || userA.user._id,
      caption: 'Comment test post',
      media: [{ url: '/test.jpg', type: 'image' }]
    });

    const socketA = createSocketClient(userA.cookie);
    await new Promise((resolve) => socketA.on('connect', resolve));

    const commentCreatedPromise = new Promise((resolve) => {
      socketA.on('comment:created', (data) => resolve(data));
    });

    // User B adds comment
    const commentRes = await request(app)
      .post(`/api/posts/${post._id}/comments`)
      .set('Cookie', userB.cookie)
      .send({ text: 'Incredible post!' });

    expect(commentRes.status).toBe(201);
    expect(commentRes.body.comment.text).toBe('Incredible post!');

    const commentEvent = await commentCreatedPromise;
    expect(commentEvent.postId.toString()).toBe(post._id.toString());
    expect(commentEvent.comment.text).toBe('Incredible post!');
    expect(commentEvent.commentsCount).toBe(1);

    // Now delete comment and check comment:deleted event
    const commentDeletedPromise = new Promise((resolve) => {
      socketA.on('comment:deleted', (data) => resolve(data));
    });

    const delRes = await request(app)
      .delete(`/api/posts/comments/${commentRes.body.comment._id}`)
      .set('Cookie', userB.cookie);

    expect(delRes.status).toBe(200);

    const delEvent = await commentDeletedPromise;
    expect(delEvent.commentId.toString()).toBe(commentRes.body.comment._id.toString());
    expect(delEvent.commentsCount).toBe(0);
  });

  it('4. Saving a post persists in database and delivers post:saved socket event to user room', async () => {
    const userA = await registerHelper({
      username: 'alice_sv',
      email: 'alice_sv@example.com',
      password: 'password123',
      fullName: 'Alice Save'
    });

    const post = await Post.create({
      author: userA.user.id || userA.user._id,
      caption: 'Save test post',
      media: [{ url: '/test.jpg', type: 'image' }]
    });

    const socketA = createSocketClient(userA.cookie);
    await new Promise((resolve) => socketA.on('connect', resolve));
    socketA.emit('join_user', userA.user.id || userA.user._id);

    const savedPromise = new Promise((resolve) => {
      socketA.on('post:saved', (data) => resolve(data));
    });

    const saveRes = await request(app)
      .post(`/api/posts/${post._id}/save`)
      .set('Cookie', userA.cookie);

    expect(saveRes.status).toBe(200);
    expect(saveRes.body.bookmarked).toBe(true);

    const event = await savedPromise;
    expect(event.postId.toString()).toBe(post._id.toString());

    // Verify persistence via GET /api/posts/saved
    const savedList = await request(app)
      .get('/api/posts/saved')
      .set('Cookie', userA.cookie);

    expect(savedList.status).toBe(200);
    expect(savedList.body.posts.some((p) => p._id.toString() === post._id.toString())).toBe(true);
  });

  it('5. Following a user broadcasts follower_count_updated and following_count_updated in real time', async () => {
    const userA = await registerHelper({
      username: 'target_flw',
      email: 'target_flw@example.com',
      password: 'password123',
      fullName: 'Target Followee'
    });

    const userB = await registerHelper({
      username: 'actor_flw',
      email: 'actor_flw@example.com',
      password: 'password123',
      fullName: 'Actor Follower'
    });

    const socketA = createSocketClient(userA.cookie);
    const socketB = createSocketClient(userB.cookie);

    await Promise.all([
      new Promise((res) => socketA.on('connect', res)),
      new Promise((res) => socketB.on('connect', res))
    ]);

    socketA.emit('join_user', userA.user.id || userA.user._id);
    socketB.emit('join_user', userB.user.id || userB.user._id);

    const followerCountPromise = new Promise((resolve) => {
      socketA.on('follower_count_updated', (data) => resolve(data));
    });

    const followingCountPromise = new Promise((resolve) => {
      socketB.on('following_count_updated', (data) => resolve(data));
    });

    // User B follows User A
    const followRes = await request(app)
      .post(`/api/users/${userA.user.id || userA.user._id}/follow`)
      .set('Cookie', userB.cookie);

    expect(followRes.status).toBe(200);
    expect(followRes.body.status).toBe('accepted');

    const followerEvent = await followerCountPromise;
    expect(followerEvent.userId.toString()).toBe((userA.user.id || userA.user._id).toString());
    expect(followerEvent.countChange).toBe(1);

    const followingEvent = await followingCountPromise;
    expect(followingEvent.userId.toString()).toBe((userB.user.id || userB.user._id).toString());
    expect(followingEvent.countChange).toBe(1);
  });

  it('6. Story creation and views trigger live story socket events', async () => {
    const userA = await registerHelper({
      username: 'alice_sty',
      email: 'alice_sty@example.com',
      password: 'password123',
      fullName: 'Alice Story'
    });

    const userB = await registerHelper({
      username: 'bob_sty',
      email: 'bob_sty@example.com',
      password: 'password123',
      fullName: 'Bob Story'
    });

    const story = await Story.create({
      author: userA.user.id || userA.user._id,
      mediaUrl: '/test_story.jpg',
      mediaType: 'image',
      expiresAt: new Date(Date.now() + 86400000)
    });

    const socketA = createSocketClient(userA.cookie);
    await new Promise((res) => socketA.on('connect', res));
    socketA.emit('join_user', userA.user.id || userA.user._id);

    const storyViewedPromise = new Promise((resolve) => {
      socketA.on('story:viewed', (data) => resolve(data));
    });

    // User B views User A's story
    const viewRes = await request(app)
      .post(`/api/stories/${story._id}/view`)
      .set('Cookie', userB.cookie);

    expect(viewRes.status).toBe(200);
    expect(viewRes.body.viewed).toBe(true);

    const viewedEvent = await storyViewedPromise;
    expect(viewedEvent.storyId.toString()).toBe(story._id.toString());
    expect(viewedEvent.viewersCount).toBe(1);
    expect(viewedEvent.viewerId.toString()).toBe((userB.user.id || userB.user._id).toString());
  });

  it('7. Reel like updates and view count broadcast live', async () => {
    const userA = await registerHelper({
      username: 'alice_rl',
      email: 'alice_rl@example.com',
      password: 'password123',
      fullName: 'Alice Reel'
    });

    const reel = await Reel.create({
      author: userA.user.id || userA.user._id,
      videoUrl: '/test_reel.mp4',
      caption: 'Live reel test'
    });

    const socket = createSocketClient(userA.cookie);
    await new Promise((res) => socket.on('connect', res));

    const reelLikedPromise = new Promise((resolve) => {
      socket.on('reel:liked', (data) => resolve(data));
    });

    const likeRes = await request(app)
      .post(`/api/reels/${reel._id}/like`)
      .set('Cookie', userA.cookie);

    expect(likeRes.status).toBe(200);
    expect(likeRes.body.liked).toBe(true);
    expect(likeRes.body.likesCount).toBe(1);

    const likedEvent = await reelLikedPromise;
    expect(likedEvent.reelId.toString()).toBe(reel._id.toString());
    expect(likedEvent.likesCount).toBe(1);
  });

  it('8. Marking notifications read emits notification_count_reset live to user session', async () => {
    const userA = await registerHelper({
      username: 'alice_ntf',
      email: 'alice_ntf@example.com',
      password: 'password123',
      fullName: 'Alice Notif'
    });

    await Notification.create({
      recipient: userA.user.id || userA.user._id,
      sender: userA.user.id || userA.user._id,
      type: 'follow',
      text: 'Test notification'
    });

    const socketA = createSocketClient(userA.cookie);
    await new Promise((res) => socketA.on('connect', res));
    socketA.emit('join_user', userA.user.id || userA.user._id);

    const resetPromise = new Promise((resolve) => {
      socketA.on('notification_count_reset', () => resolve(true));
    });

    const readRes = await request(app)
      .patch('/api/notifications/read-all')
      .set('Cookie', userA.cookie);

    expect(readRes.status).toBe(200);

    const resetReceived = await resetPromise;
    expect(resetReceived).toBe(true);
  });
});
