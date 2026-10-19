import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Post } from '../src/models/Post.js';
import { Report } from '../src/models/Report.js';

describe('Admin, Settings & Moderation API Tests', () => {
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
    await Report.deleteMany({});
  });

  const registerHelper = async (userData) => {
    const res = await request(app).post('/api/auth/register').send(userData);
    return {
      user: res.body.user,
      cookie: res.headers['set-cookie']
    };
  };

  it('1. Changes password and verifies authentication with new credentials', async () => {
    const user = await registerHelper({
      username: 'sammy',
      email: 'sammy@example.com',
      password: 'oldPassword123',
      fullName: 'Sammy Davis'
    });

    // Change password
    const changeRes = await request(app)
      .post('/api/auth/change-password')
      .set('Cookie', user.cookie)
      .send({
        currentPassword: 'oldPassword123',
        newPassword: 'newStrongPassword456'
      });

    expect(changeRes.status).toBe(200);
    expect(changeRes.body.success).toBe(true);

    // Old password should fail login
    const oldLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'sammy',
        password: 'oldPassword123'
      });

    expect(oldLoginRes.status).toBe(401);

    // New password should succeed
    const newLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'sammy',
        password: 'newStrongPassword456'
      });

    expect(newLoginRes.status).toBe(200);
    expect(newLoginRes.body.success).toBe(true);
  });

  it('2. Submits a content report, and admin resolves it and deletes target', async () => {
    const author = await registerHelper({
      username: 'spammer',
      email: 'spammer@example.com',
      password: 'password123',
      fullName: 'Spam Bot'
    });

    const reporter = await registerHelper({
      username: 'vigilant',
      email: 'vigilant@example.com',
      password: 'password123',
      fullName: 'Good Citizen'
    });

    const admin = await registerHelper({
      username: 'adminuser',
      email: 'admin@example.com',
      password: 'password123',
      fullName: 'Site Admin'
    });

    // Elevate admin
    await User.findByIdAndUpdate(admin.user._id || admin.user.id, { role: 'admin' });

    // Create spam post
    const spamPost = await Post.create({
      author: author.user._id || author.user.id,
      caption: 'BUY CHEAP CRYPTO NOW',
      media: [{ url: '/uploads/posts/spam.jpg', type: 'image' }]
    });

    // Reporter files report
    const reportRes = await request(app)
      .post('/api/reports')
      .set('Cookie', reporter.cookie)
      .send({
        targetType: 'post',
        targetId: spamPost._id,
        reason: 'spam',
        description: 'Unsolicited crypto scam'
      });

    expect(reportRes.status).toBe(201);
    expect(reportRes.body.success).toBe(true);
    const reportId = reportRes.body.reportId;

    // Regular user cannot access /api/admin
    const forbiddenRes = await request(app)
      .get('/api/admin/stats')
      .set('Cookie', reporter.cookie);

    expect(forbiddenRes.status).toBe(403);

    // Admin accesses /api/admin/stats
    const statsRes = await request(app)
      .get('/api/admin/stats')
      .set('Cookie', admin.cookie);

    expect(statsRes.status).toBe(200);
    expect(statsRes.body.stats.pendingReports).toBe(1);

    // Admin resolves report and deletes the post
    const resolveRes = await request(app)
      .patch(`/api/admin/reports/${reportId}`)
      .set('Cookie', admin.cookie)
      .send({
        status: 'resolved',
        action: 'delete_target',
        resolutionNotes: 'Violates terms of service'
      });

    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.report.status).toBe('resolved');

    // Confirm post is deleted from database
    const postCheck = await Post.findById(spamPost._id);
    expect(postCheck).toBeNull();
  });
});
