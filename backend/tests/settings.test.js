import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Post } from '../src/models/Post.js';
import { Collection } from '../src/models/Collection.js';
import { ContactSubmission } from '../src/models/ContactSubmission.js';

describe('Settings, Collections & Help API Tests', () => {
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
    await Collection.deleteMany({});
    await ContactSubmission.deleteMany({});
  });

  const registerHelper = async (userData) => {
    const res = await request(app).post('/api/auth/register').send(userData);
    return {
      user: res.body.user,
      cookie: res.headers['set-cookie']
    };
  };

  it('1. Updates user preferences and verifies persistence', async () => {
    const { cookie } = await registerHelper({
      username: 'settingsuser',
      email: 'settings@example.com',
      password: 'password123',
      fullName: 'Settings User'
    });

    const updateRes = await request(app)
      .put('/api/settings/preferences')
      .set('Cookie', cookie)
      .send({
        theme: 'light',
        notifications: { pauseAll: true },
        language: 'es'
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.preferences.theme).toBe('light');
    expect(updateRes.body.preferences.notifications.pauseAll).toBe(true);

    const getRes = await request(app)
      .get('/api/settings/preferences')
      .set('Cookie', cookie);

    expect(getRes.status).toBe(200);
    expect(getRes.body.preferences.theme).toBe('light');
    expect(getRes.body.preferences.language).toBe('es');
  });

  it('2. Creates, retrieves, and deletes bookmark collections', async () => {
    const { cookie } = await registerHelper({
      username: 'collector',
      email: 'collector@example.com',
      password: 'password123',
      fullName: 'Art Collector'
    });

    // Create collection
    const createRes = await request(app)
      .post('/api/settings/collections')
      .set('Cookie', cookie)
      .send({ name: 'Architecture Inspiration' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.collection.name).toBe('Architecture Inspiration');

    const colId = createRes.body.collection._id;

    // List collections
    const listRes = await request(app)
      .get('/api/settings/collections')
      .set('Cookie', cookie);

    expect(listRes.status).toBe(200);
    expect(listRes.body.collections.length).toBe(1);

    // Get detail
    const detailRes = await request(app)
      .get(`/api/settings/collections/${colId}`)
      .set('Cookie', cookie);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.collection.name).toBe('Architecture Inspiration');

    // Delete collection
    const deleteRes = await request(app)
      .delete(`/api/settings/collections/${colId}`)
      .set('Cookie', cookie);

    expect(deleteRes.status).toBe(200);

    const checkList = await request(app)
      .get('/api/settings/collections')
      .set('Cookie', cookie);

    expect(checkList.body.collections.length).toBe(0);
  });

  it('3. Submits help and contact inquiry ticket', async () => {
    const contactRes = await request(app)
      .post('/api/settings/contact')
      .send({
        name: 'Inquiring User',
        email: 'inquiry@example.com',
        subject: 'API question',
        category: 'feature',
        message: 'Could you support GraphQL endpoints in the future?'
      });

    expect(contactRes.status).toBe(201);
    expect(contactRes.body.success).toBe(true);
    expect(contactRes.body.ticketId).toBeDefined();

    const saved = await ContactSubmission.findById(contactRes.body.ticketId);
    expect(saved).not.toBeNull();
    expect(saved.category).toBe('feature');
  });
});
