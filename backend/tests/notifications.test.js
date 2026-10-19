import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Post } from '../src/models/Post.js';
import { Notification } from '../src/models/Notification.js';

describe('Notifications API Tests', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Notification.deleteMany({});
  });

  const registerHelper = async (userData) => {
    const res = await request(app).post('/api/auth/register').send(userData);
    return {
      user: res.body.user,
      cookie: res.headers['set-cookie']
    };
  };

  it('1. Generates notifications on follow and post like, and marks read', async () => {
    const userA = await registerHelper({
      username: 'influencer',
      email: 'influencer@example.com',
      password: 'password123',
      fullName: 'Star Model'
    });

    const userB = await registerHelper({
      username: 'fan',
      email: 'fan@example.com',
      password: 'password123',
      fullName: 'Super Fan'
    });

    // Create a post for userA
    const post = await Post.create({
      author: userA.user._id || userA.user.id,
      media: [{ url: '/uploads/posts/sample.jpg', type: 'image' }],
      caption: 'Loving life!'
    });

    // UserB follows UserA
    await request(app)
      .post(`/api/users/${userA.user._id || userA.user.id}/follow`)
      .set('Cookie', userB.cookie);


    // UserB likes UserA's post
    await request(app)
      .post(`/api/posts/${post._id}/like`)
      .set('Cookie', userB.cookie);

    // UserA checks notifications
    const notifRes = await request(app)
      .get('/api/notifications')
      .set('Cookie', userA.cookie);

    expect(notifRes.status).toBe(200);
    expect(notifRes.body.success).toBe(true);
    expect(notifRes.body.unreadCount).toBe(2);
    expect(notifRes.body.notifications.length).toBe(2);

    const types = notifRes.body.notifications.map((n) => n.type);
    expect(types).toContain('follow');
    expect(types).toContain('like_post');

    // Mark one notification as read
    const firstNotifId = notifRes.body.notifications[0]._id;
    const readOneRes = await request(app)
      .patch(`/api/notifications/${firstNotifId}/read`)
      .set('Cookie', userA.cookie);

    expect(readOneRes.status).toBe(200);
    expect(readOneRes.body.notification.isRead).toBe(true);

    // Mark all as read
    const readAllRes = await request(app)
      .patch('/api/notifications/read-all')
      .set('Cookie', userA.cookie);

    expect(readAllRes.status).toBe(200);

    // Verify unread count is 0
    const finalCheck = await request(app)
      .get('/api/notifications')
      .set('Cookie', userA.cookie);

    expect(finalCheck.body.unreadCount).toBe(0);
  });
});
