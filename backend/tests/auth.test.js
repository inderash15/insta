import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';

describe('Authentication & Sessions API Tests', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  const validUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User'
  };

  it('1. Successfully registers a new user and sets httpOnly session cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.username).toBe('testuser');
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.fullName).toBe('Test User');
    expect(res.body.user.role).toBe('user');
    expect(res.body.user.passwordHash).toBeUndefined();

    // Verify cookie was set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('token=');
    expect(cookies[0]).toContain('HttpOnly');
  });

  it('2. Rejects invalid registration input with clear validation errors', async () => {
    // Missing required fields
    const resMissing = await request(app)
      .post('/api/auth/register')
      .send({});
    expect(resMissing.status).toBe(400);
    expect(resMissing.body.success).toBe(false);

    // Short password (< 8 chars)
    const resShortPass = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: '123' });
    expect(resShortPass.status).toBe(400);
    expect(resShortPass.body.message).toContain('at least 8 characters');

    // Invalid username with spaces/symbols
    const resBadUser = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, username: 'invalid user!' });
    expect(resBadUser.status).toBe(400);
    expect(resBadUser.body.message).toContain('letters, numbers, periods, and underscores');

    // Invalid email format
    const resBadEmail = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'not-an-email' });
    expect(resBadEmail.status).toBe(400);
    expect(resBadEmail.body.message).toContain('Invalid email address');
  });

  it('3. Rejects duplicate username and duplicate email registrations', async () => {
    // Register first user
    const res1 = await request(app)
      .post('/api/auth/register')
      .send(validUser);
    expect(res1.status).toBe(201);

    // Duplicate username with different email
    const resDupUser = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'TESTUSER', // Case-insensitive duplicate
        email: 'other@example.com',
        password: 'password123',
        fullName: 'Another User'
      });
    expect(resDupUser.status).toBe(409);
    expect(resDupUser.body.message).toContain('Username is already taken');

    // Duplicate email with different username
    const resDupEmail = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'anotheruser',
        email: 'TEST@EXAMPLE.COM', // Case-insensitive duplicate
        password: 'password123',
        fullName: 'Another User'
      });
    expect(resDupEmail.status).toBe(409);
    expect(resDupEmail.body.message).toContain('already exists');
  });

  it('4. Confirms password is saved as a secure bcrypt hash, never in plaintext', async () => {
    await request(app)
      .post('/api/auth/register')
      .send(validUser);

    const savedUser = await User.findOne({ username: 'testuser' }).select('+passwordHash');
    expect(savedUser).toBeDefined();
    expect(savedUser.passwordHash).toBeDefined();
    expect(savedUser.passwordHash).not.toBe(validUser.password);
    expect(savedUser.passwordHash).toMatch(/^\$2[aby]\$12\$/); // bcrypt hash with cost 12
  });

  it('5. Successfully logs in with username or email and sets session cookie', async () => {
    await request(app)
      .post('/api/auth/register')
      .send(validUser);

    // Login with username
    const resUsername = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'testuser',
        password: 'password123'
      });
    expect(resUsername.status).toBe(200);
    expect(resUsername.body.success).toBe(true);
    expect(resUsername.body.user.username).toBe('testuser');
    expect(resUsername.headers['set-cookie']).toBeDefined();

    // Login with email
    const resEmail = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'test@example.com',
        password: 'password123'
      });
    expect(resEmail.status).toBe(200);
    expect(resEmail.body.success).toBe(true);
    expect(resEmail.body.user.email).toBe('test@example.com');
  });

  it('6. Rejects login with incorrect password using a generic error message', async () => {
    await request(app)
      .post('/api/auth/register')
      .send(validUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'testuser',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid username/email or password');
  });

  it('7. Rejects login for non-existent account with the same generic error message', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'nonexistentuser',
        password: 'password123'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid username/email or password');
  });

  it('8. GET /api/auth/me rejects an unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Authentication required');
  });

  it('9. GET /api/auth/me accepts a valid session cookie and returns user profile', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    const cookies = regRes.headers['set-cookie'];

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookies);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.user.username).toBe('testuser');
    expect(meRes.body.user.email).toBe('test@example.com');
    expect(meRes.body.user.passwordHash).toBeUndefined();
  });

  it('10. Logout clears the session cookie with matching cookie options', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    const cookies = regRes.headers['set-cookie'];

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookies);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    const logoutCookies = logoutRes.headers['set-cookie'];
    expect(logoutCookies).toBeDefined();
    // Expiration date in past or max-age 0 indicates cookie clearance
    expect(logoutCookies[0]).toMatch(/token=;|Expires=Thu, 01 Jan 1970|Max-Age=0/);
  });

  it('11. A logged-out request cannot access protected resources', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    const cookies = regRes.headers['set-cookie'];

    // Perform logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookies);
    const expiredCookies = logoutRes.headers['set-cookie'];

    // Attempt to access /api/auth/me using cleared cookies
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', expiredCookies);

    expect(meRes.status).toBe(401);
    expect(meRes.body.success).toBe(false);
  });

  it('12. Prevents privilege escalation: attempts to assign admin role are ignored', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        ...validUser,
        role: 'admin',
        isVerified: true
      });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('user');
    expect(res.body.user.isVerified).toBe(false);

    // Verify in database as well
    const savedUser = await User.findOne({ username: 'testuser' });
    expect(savedUser.role).toBe('user');
    expect(savedUser.isVerified).toBe(false);
  });
});
