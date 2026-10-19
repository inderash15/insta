import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import http from 'http';
import request from 'supertest';
import { io as ClientIO } from 'socket.io-client';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { initSocket, isUserOnline, getOnlineUserIds, getUserSocketCount } from '../src/config/socket.js';
import { User } from '../src/models/User.js';
import { Conversation } from '../src/models/Conversation.js';
import { Message } from '../src/models/Message.js';

describe('Presence & Real-Time Read Receipts Integration Tests', () => {
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

  const createSocketClient = (tokenCookie) => {
    const socket = ClientIO(`http://localhost:${serverPort}`, {
      extraHeaders: tokenCookie ? { cookie: tokenCookie[0] } : {},
      transports: ['websocket'],
      forceNew: true
    });
    clientSockets.push(socket);
    return socket;
  };

  it('1. Connects user socket, marks online, and tracks presence snapshot', async () => {
    const userA = await registerHelper({
      username: 'alice_p',
      email: 'alice_p@example.com',
      password: 'password123',
      fullName: 'Alice Presence'
    });

    const socketA = createSocketClient(userA.cookie);
    await new Promise((resolve) => socketA.on('connect', resolve));

    socketA.emit('join_user', userA.user._id || userA.user.id);
    await new Promise((r) => setTimeout(r, 100));

    expect(isUserOnline(userA.user._id || userA.user.id)).toBe(true);
    expect(getOnlineUserIds()).toContain((userA.user._id || userA.user.id).toString());
  });

  it('2. Multi-connection: Closing 1 of 2 tabs keeps user online; closing both marks offline with lastActiveAt', async () => {
    const userA = await registerHelper({
      username: 'bob_multi',
      email: 'bob_multi@example.com',
      password: 'password123',
      fullName: 'Bob Multi'
    });
    const userId = (userA.user._id || userA.user.id).toString();

    // Tab 1 connects
    const tab1 = createSocketClient(userA.cookie);
    await new Promise((resolve) => tab1.on('connect', resolve));
    tab1.emit('join_user', userId);
    await new Promise((r) => setTimeout(r, 80));

    // Tab 2 connects
    const tab2 = createSocketClient(userA.cookie);
    await new Promise((resolve) => tab2.on('connect', resolve));
    tab2.emit('join_user', userId);
    await new Promise((r) => setTimeout(r, 80));

    expect(getUserSocketCount(userId)).toBe(2);
    expect(isUserOnline(userId)).toBe(true);

    // Tab 1 disconnects -> User must remain online because Tab 2 is still active
    tab1.disconnect();
    await new Promise((r) => setTimeout(r, 80));

    expect(getUserSocketCount(userId)).toBe(1);
    expect(isUserOnline(userId)).toBe(true);

    // Tab 2 disconnects -> User now has 0 active sockets and transitions to offline
    tab2.disconnect();
    await new Promise((r) => setTimeout(r, 80));

    expect(getUserSocketCount(userId)).toBe(0);
    expect(isUserOnline(userId)).toBe(false);

    // Verify lastActiveAt is updated in database
    const updatedUser = await User.findById(userId);
    expect(updatedUser.lastActiveAt).toBeDefined();
    expect(new Date(updatedUser.lastActiveAt).getTime()).toBeGreaterThan(0);
  });

  it('3. Reconnecting a socket restores user presence', async () => {
    const userA = await registerHelper({
      username: 'charlie_re',
      email: 'charlie_re@example.com',
      password: 'password123',
      fullName: 'Charlie Reconnect'
    });
    const userId = (userA.user._id || userA.user.id).toString();

    const socket = createSocketClient(userA.cookie);
    await new Promise((resolve) => socket.on('connect', resolve));
    socket.emit('join_user', userId);
    await new Promise((r) => setTimeout(r, 60));

    expect(isUserOnline(userId)).toBe(true);

    socket.disconnect();
    await new Promise((r) => setTimeout(r, 60));
    expect(isUserOnline(userId)).toBe(false);

    // Reconnection
    const socketReconnected = createSocketClient(userA.cookie);
    await new Promise((resolve) => socketReconnected.on('connect', resolve));
    socketReconnected.emit('join_user', userId);
    await new Promise((r) => setTimeout(r, 60));

    expect(isUserOnline(userId)).toBe(true);
  });

  it('4. Real-time Sent, Delivered, and Seen message receipt lifecycle', async () => {
    const sender = await registerHelper({
      username: 'sender_sam',
      email: 'sam@example.com',
      password: 'password123',
      fullName: 'Sam Sender'
    });

    const recipient = await registerHelper({
      username: 'recipient_rachel',
      email: 'rachel@example.com',
      password: 'password123',
      fullName: 'Rachel Recipient'
    });

    const senderId = (sender.user._id || sender.user.id).toString();
    const recipientId = (recipient.user._id || recipient.user.id).toString();

    // Create conversation
    const convRes = await request(app)
      .post('/api/conversations')
      .set('Cookie', sender.cookie)
      .send({ recipientId });

    expect(convRes.status).toBe(200);
    const convId = convRes.body.conversation._id;

    // Connect recipient socket so recipient is detected online
    const recipientSocket = createSocketClient(recipient.cookie);
    await new Promise((resolve) => recipientSocket.on('connect', resolve));
    recipientSocket.emit('join_user', recipientId);
    await new Promise((r) => setTimeout(r, 60));

    expect(isUserOnline(recipientId)).toBe(true);

    // Sender sends message
    const sendRes = await request(app)
      .post(`/api/conversations/${convId}/messages`)
      .set('Cookie', sender.cookie)
      .send({ text: 'Hello Rachel!' });

    expect(sendRes.status).toBe(201);
    const msg = sendRes.body.message;
    expect(msg.sentAt).toBeDefined();

    // Delivered check: because recipient is online, deliveredTo should contain recipientId
    expect(msg.deliveredTo.length).toBeGreaterThan(0);
    expect(msg.deliveredTo[0].user.toString()).toBe(recipientId);

    // Seen check BEFORE opening: recipient has NOT read it yet
    expect(msg.readBy.length).toBe(0);

    // Conversation unread count for recipient is 1
    const unreadCheck = await request(app)
      .get('/api/conversations')
      .set('Cookie', recipient.cookie);
    expect(unreadCheck.body.conversations[0].unreadCount).toBe(1);

    // Recipient opens the conversation messages (triggers mark read)
    const readMsgsRes = await request(app)
      .get(`/api/conversations/${convId}/messages`)
      .set('Cookie', recipient.cookie);

    expect(readMsgsRes.status).toBe(200);

    // Verify database record has updated readBy and unreadCounts
    const dbMsg = await Message.findById(msg._id);
    expect(dbMsg.readBy.length).toBe(1);
    expect(dbMsg.readBy[0].user.toString()).toBe(recipientId);
    expect(dbMsg.readBy[0].readAt).toBeDefined();

    // Recipient's unread count is reset to 0
    const clearedUnreadCheck = await request(app)
      .get('/api/conversations')
      .set('Cookie', recipient.cookie);
    expect(clearedUnreadCheck.body.conversations[0].unreadCount).toBe(0);
  });

  it('5. Enforces conversation authorization and privacy rules', async () => {
    const userA = await registerHelper({
      username: 'auth_alice',
      email: 'auth_alice@example.com',
      password: 'password123',
      fullName: 'Alice Auth'
    });

    const userB = await registerHelper({
      username: 'auth_bob',
      email: 'auth_bob@example.com',
      password: 'password123',
      fullName: 'Bob Auth'
    });

    const userC = await registerHelper({
      username: 'intruder_eve',
      email: 'eve@example.com',
      password: 'password123',
      fullName: 'Eve Intruder'
    });

    const convRes = await request(app)
      .post('/api/conversations')
      .set('Cookie', userA.cookie)
      .send({ recipientId: userB.user._id || userB.user.id });

    const convId = convRes.body.conversation._id;

    // Eve tries to access messages of Alice & Bob's conversation
    const intruderGet = await request(app)
      .get(`/api/conversations/${convId}/messages`)
      .set('Cookie', userC.cookie);

    expect(intruderGet.status).toBe(404);

    // Eve tries to send a message to Alice & Bob's conversation
    const intruderSend = await request(app)
      .post(`/api/conversations/${convId}/messages`)
      .set('Cookie', userC.cookie)
      .send({ text: 'I should not be allowed here' });

    expect(intruderSend.status).toBe(404);
  });

  it('6. Respects showActivityStatus privacy preference by hiding lastActiveAt for other users', async () => {
    const userPrivate = await registerHelper({
      username: 'private_peter',
      email: 'peter@example.com',
      password: 'password123',
      fullName: 'Peter Private'
    });

    const viewer = await registerHelper({
      username: 'viewer_val',
      email: 'val@example.com',
      password: 'password123',
      fullName: 'Val Viewer'
    });

    // Peter opts out of activity status
    const updatePrefRes = await request(app)
      .put('/api/settings/preferences')
      .set('Cookie', userPrivate.cookie)
      .send({ showActivityStatus: false });

    expect(updatePrefRes.status).toBe(200);
    expect(updatePrefRes.body.preferences.showActivityStatus).toBe(false);

    // Viewer fetches Peter's profile
    const profileRes = await request(app)
      .get(`/api/users/${userPrivate.user.username}`)
      .set('Cookie', viewer.cookie);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.profile.lastActiveAt).toBeUndefined();

    // Peter viewing his own profile still has his info
    const selfRes = await request(app)
      .get(`/api/users/${userPrivate.user.username}`)
      .set('Cookie', userPrivate.cookie);

    expect(selfRes.status).toBe(200);
    expect(selfRes.body.profile.lastActiveAt).toBeDefined();
  });
});
