import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Conversation } from '../src/models/Conversation.js';
import { Message } from '../src/models/Message.js';

describe('Direct Messaging API Tests', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
  });

  const registerHelper = async (userData) => {
    const res = await request(app).post('/api/auth/register').send(userData);
    return {
      user: res.body.user,
      cookie: res.headers['set-cookie']
    };
  };

  it('1. Creates conversation and sends direct messages between users', async () => {
    const userA = await registerHelper({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      fullName: 'Alice Walker'
    });

    const userB = await registerHelper({
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123',
      fullName: 'Bob Martin'
    });

    // Alice starts conversation with Bob
    const convRes = await request(app)
      .post('/api/conversations')
      .set('Cookie', userA.cookie)
      .send({ recipientId: userB.user._id || userB.user.id });

    expect(convRes.status).toBe(200);
    expect(convRes.body.success).toBe(true);
    const conversationId = convRes.body.conversation._id;
    expect(conversationId).toBeDefined();

    // Alice sends a message to Bob
    const msgRes = await request(app)
      .post(`/api/conversations/${conversationId}/messages`)
      .set('Cookie', userA.cookie)
      .send({ text: 'Hey Bob! Welcome to Insta.' });

    expect(msgRes.status).toBe(201);
    expect(msgRes.body.success).toBe(true);
    expect(msgRes.body.message.text).toBe('Hey Bob! Welcome to Insta.');
    expect(msgRes.body.message.sender.username).toBe('alice');

    // Bob views conversations list and sees unreadCount = 1
    const bobConvRes = await request(app)
      .get('/api/conversations')
      .set('Cookie', userB.cookie);

    expect(bobConvRes.status).toBe(200);
    expect(bobConvRes.body.conversations.length).toBe(1);
    expect(bobConvRes.body.conversations[0].unreadCount).toBe(1);
    expect(bobConvRes.body.conversations[0].lastMessage.text).toBe('Hey Bob! Welcome to Insta.');

    // Bob opens conversation messages
    const bobMsgRes = await request(app)
      .get(`/api/conversations/${conversationId}/messages`)
      .set('Cookie', userB.cookie);

    expect(bobMsgRes.status).toBe(200);
    expect(bobMsgRes.body.messages.length).toBe(1);
    expect(bobMsgRes.body.messages[0].text).toBe('Hey Bob! Welcome to Insta.');

    // Bob checks conversations again: unreadCount should now be 0
    const bobConvRes2 = await request(app)
      .get('/api/conversations')
      .set('Cookie', userB.cookie);

    expect(bobConvRes2.body.conversations[0].unreadCount).toBe(0);
  });

  it('2. Blocks user from messaging if blocked', async () => {
    const userA = await registerHelper({
      username: 'clara',
      email: 'clara@example.com',
      password: 'password123',
      fullName: 'Clara Oswald'
    });

    const userB = await registerHelper({
      username: 'danny',
      email: 'danny@example.com',
      password: 'password123',
      fullName: 'Danny Pink'
    });

    const bId = userB.user._id || userB.user.id;
    const aId = userA.user._id || userA.user.id;

    // Clara blocks Danny
    await request(app)
      .post(`/api/users/${bId}/block`)
      .set('Cookie', userA.cookie);

    // Clara tries to create conversation with Danny
    const resA = await request(app)
      .post('/api/conversations')
      .set('Cookie', userA.cookie)
      .send({ recipientId: bId });

    expect(resA.status).toBe(403);

    // Danny tries to create conversation with Clara
    const resB = await request(app)
      .post('/api/conversations')
      .set('Cookie', userB.cookie)
      .send({ recipientId: aId });


    expect(resB.status).toBe(403);
  });
});
