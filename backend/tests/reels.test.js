import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Reel } from '../src/models/Reel.js';
import { Like } from '../src/models/Like.js';

describe('Reels API Tests', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Reel.deleteMany({});
    await Like.deleteMany({});
  });

  const registerHelper = async (userData) => {
    const res = await request(app).post('/api/auth/register').send(userData);
    return {
      user: res.body.user,
      cookie: res.headers['set-cookie']
    };
  };

  it('1. Uploads and creates a new reel with video', async () => {
    const user = await registerHelper({
      username: 'creator',
      email: 'creator@example.com',
      password: 'password123',
      fullName: 'Content Creator'
    });

    const fakeVideoBuffer = Buffer.from('fake mp4 video content');

    const res = await request(app)
      .post('/api/reels')
      .set('Cookie', user.cookie)
      .attach('video', fakeVideoBuffer, 'demo_reel.mp4')
      .field('caption', 'My first amazing reel! #trending #viral')
      .field('audioTitle', 'Chill Beats');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.reel.caption).toBe('My first amazing reel! #trending #viral');
    expect(res.body.reel.hashtags).toContain('trending');
    expect(res.body.reel.hashtags).toContain('viral');
    expect(res.body.reel.audioTitle).toBe('Chill Beats');
    expect(res.body.reel.videoUrl).toMatch(/^\/uploads\/reels\//);
  });

  it('2. Fetches reels feed with like status and view count increment', async () => {
    const creator = await registerHelper({
      username: 'dancer',
      email: 'dancer@example.com',
      password: 'password123',
      fullName: 'Dancer Pro'
    });

    const viewer = await registerHelper({
      username: 'watcher',
      email: 'watcher@example.com',
      password: 'password123',
      fullName: 'Viewer One'
    });

    const reel = await Reel.create({
      author: creator.user._id || creator.user.id,
      videoUrl: '/uploads/reels/sample.mp4',
      caption: 'Dancing in the rain #dance',
      audioTitle: 'Rain Song'
    });

    // View reel
    const viewRes = await request(app).post(`/api/reels/${reel._id}/view`);
    expect(viewRes.status).toBe(200);

    const updated = await Reel.findById(reel._id);
    expect(updated.viewsCount).toBe(1);

    // Fetch reels as viewer
    const feedRes = await request(app)
      .get('/api/reels')
      .set('Cookie', viewer.cookie);

    expect(feedRes.status).toBe(200);
    expect(feedRes.body.reels.length).toBe(1);
    expect(feedRes.body.reels[0].viewsCount).toBe(1);
    expect(feedRes.body.reels[0].isLiked).toBe(false);

    // Like reel
    const likeRes = await request(app)
      .post(`/api/reels/${reel._id}/like`)
      .set('Cookie', viewer.cookie);

    expect(likeRes.status).toBe(200);
    expect(likeRes.body.liked).toBe(true);
    expect(likeRes.body.likesCount).toBe(1);

    // Fetch feed again to verify isLiked is true
    const feedResAfter = await request(app)
      .get('/api/reels')
      .set('Cookie', viewer.cookie);

    expect(feedResAfter.body.reels[0].isLiked).toBe(true);
  });

  it('3. Deletes reel by owner and prevents unauthorized deletion', async () => {
    const owner = await registerHelper({
      username: 'owner',
      email: 'owner@example.com',
      password: 'password123',
      fullName: 'Reel Owner'
    });

    const stranger = await registerHelper({
      username: 'stranger',
      email: 'stranger@example.com',
      password: 'password123',
      fullName: 'Stranger'
    });

    const reel = await Reel.create({
      author: owner.user._id || owner.user.id,
      videoUrl: '/uploads/reels/owner.mp4',
      caption: 'My reel'
    });


    // Stranger tries to delete
    const forbiddenRes = await request(app)
      .delete(`/api/reels/${reel._id}`)
      .set('Cookie', stranger.cookie);

    expect(forbiddenRes.status).toBe(403);

    // Owner deletes
    const deleteRes = await request(app)
      .delete(`/api/reels/${reel._id}`)
      .set('Cookie', owner.cookie);

    expect(deleteRes.status).toBe(200);

    const check = await Reel.findById(reel._id);
    expect(check).toBeNull();
  });
});
