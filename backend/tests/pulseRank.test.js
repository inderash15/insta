import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Reel } from '../src/models/Reel.js';
import { Follow } from '../src/models/Follow.js';
import { RecommendationEvent } from '../src/models/RecommendationEvent.js';
import { getPulseRankReels, PULSERANK_WEIGHTS } from '../src/services/pulserank/index.js';
import { rankCandidates } from '../src/services/pulserank/ranker.js';
import { rerankFeed } from '../src/services/pulserank/reranker.js';

describe('Project Aurora — PulseRank Recommendation Engine Tests', () => {
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
    await Follow.deleteMany({});
    await RecommendationEvent.deleteMany({});
  });

  const registerHelper = async (userData) => {
    const res = await request(app).post('/api/auth/register').send(userData);
    return {
      user: res.body.user,
      cookie: res.headers['set-cookie']
    };
  };

  it('1. Ranking formula computes correct multi-objective score breakdown', () => {
    const mockFeatureMatrix = [
      {
        item: {
          reel: {
            _id: '64a1b2c3d4e5f6a7b8c9d001',
            author: { _id: 'user1', username: 'tech_creator' },
            hashtags: ['coding', 'react']
          }
        },
        features: {
          topicAffinity: 1.0,
          authorAffinity: 0.8,
          isFollowing: 1.0,
          freshnessDecay: 0.9,
          normalizedEngagement: 0.5,
          isEmergingCreator: 0.0,
          alreadyWatched: 0.0,
          skipPenalty: 0.0
        }
      },
      {
        item: {
          reel: {
            _id: '64a1b2c3d4e5f6a7b8c9d002',
            author: { _id: 'user2', username: 'repetitive_creator' },
            hashtags: ['random']
          }
        },
        features: {
          topicAffinity: 0.0,
          authorAffinity: 0.0,
          isFollowing: 0.0,
          freshnessDecay: 0.1,
          normalizedEngagement: 0.1,
          isEmergingCreator: 0.0,
          alreadyWatched: 1.0, // penalized
          skipPenalty: 0.8 // high skip penalty
        }
      }
    ];

    const ranked = rankCandidates(mockFeatureMatrix, PULSERANK_WEIGHTS);
    expect(ranked.length).toBe(2);

    // High affinity reel should be ranked first
    expect(ranked[0].reel._id).toBe('64a1b2c3d4e5f6a7b8c9d001');
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
    expect(ranked[0].explainability.reasons).toContain('Because you follow @tech_creator');
    expect(ranked[0].explainability.signals.positiveValue).toBeGreaterThan(0.5);

    // Repetitive & skipped reel should have negative penalties applied
    expect(ranked[1].explainability.signals.repetitionPenalty).toBe(PULSERANK_WEIGHTS.w_repetition);
    expect(ranked[1].explainability.signals.negativeCost).toBeGreaterThan(0);
  });

  it('2. Diversity reranker prevents more than 2 consecutive videos from same creator', () => {
    const authorA = { _id: 'authorA', username: 'creatorA' };
    const authorB = { _id: 'authorB', username: 'creatorB' };

    const scoredItems = [
      { reel: { _id: 'r1', author: authorA }, score: 0.99 },
      { reel: { _id: 'r2', author: authorA }, score: 0.98 },
      { reel: { _id: 'r3', author: authorA }, score: 0.97 }, // 3rd consecutive from authorA
      { reel: { _id: 'r4', author: authorB }, score: 0.95 },
      { reel: { _id: 'r5', author: authorA }, score: 0.90 }
    ];

    const reranked = rerankFeed(scoredItems, 1, 5);
    const authorSequence = reranked.map((item) => item.reel.author._id);

    // Author sequence should interleave authorB before a 3rd authorA appears: [authorA, authorA, authorB, authorA, authorA]
    expect(authorSequence[0]).toBe('authorA');
    expect(authorSequence[1]).toBe('authorA');
    expect(authorSequence[2]).toBe('authorB');
    expect(authorSequence[3]).toBe('authorA');
  });

  it('3. PulseRank excludes blocked authors and items marked "Not interested"', async () => {
    const viewer = await registerHelper({
      username: 'viewer1',
      email: 'viewer1@example.com',
      password: 'password123',
      fullName: 'Viewer One'
    });

    const creatorGood = await registerHelper({
      username: 'creator_good',
      email: 'cgood@example.com',
      password: 'password123',
      fullName: 'Good Creator'
    });

    const creatorBlocked = await registerHelper({
      username: 'creator_blocked',
      email: 'cblocked@example.com',
      password: 'password123',
      fullName: 'Blocked Creator'
    });

    // Create reels
    const reelGood = await Reel.create({
      author: creatorGood.user.id,
      videoUrl: '/uploads/reels/good.mp4',
      caption: 'Awesome reel',
      hashtags: ['coding']
    });

    const reelBlocked = await Reel.create({
      author: creatorBlocked.user.id,
      videoUrl: '/uploads/reels/blocked.mp4',
      caption: 'Should not appear',
      hashtags: ['coding']
    });

    const reelDisliked = await Reel.create({
      author: creatorGood.user.id,
      videoUrl: '/uploads/reels/disliked.mp4',
      caption: 'Viewer dislikes this',
      hashtags: ['coding']
    });

    // Block creatorBlocked
    await User.findByIdAndUpdate(viewer.user.id, {
      $push: { blockedUsers: creatorBlocked.user.id }
    });

    // Mark reelDisliked as "not_interested"
    await request(app)
      .post(`/api/reels/${reelDisliked._id}/feedback`)
      .set('Cookie', viewer.cookie)
      .send({ action: 'not_interested', reason: 'Not my taste' });

    // Fetch recommendations for viewer
    const userDoc = await User.findById(viewer.user.id);
    const feed = await getPulseRankReels({ user: userDoc, page: 1, limit: 10 });

    const returnedIds = feed.reels.map((r) => r._id.toString());
    expect(returnedIds).toContain(reelGood._id.toString());
    expect(returnedIds).not.toContain(reelBlocked._id.toString());
    expect(returnedIds).not.toContain(reelDisliked._id.toString());
  });

  it('4. Records watch telemetry and delivers transparent explainability', async () => {
    const viewer = await registerHelper({
      username: 'telemetry_user',
      email: 'telemetry@example.com',
      password: 'password123',
      fullName: 'Telemetry User'
    });

    const creator = await registerHelper({
      username: 'star_creator',
      email: 'star@example.com',
      password: 'password123',
      fullName: 'Star Creator'
    });

    const reel = await Reel.create({
      author: creator.user.id,
      videoUrl: '/uploads/reels/star.mp4',
      caption: 'Learning #javascript and #react',
      hashtags: ['javascript', 'react'],
      likesCount: 15
    });

    // Viewer sets explicit interests
    await request(app)
      .put('/api/reels/preferences/interests')
      .set('Cookie', viewer.cookie)
      .send({ interests: ['javascript', 'webdev'] });

    // Viewer logs a 15-second completion event
    const eventRes = await request(app)
      .post(`/api/reels/${reel._id}/events`)
      .set('Cookie', viewer.cookie)
      .send({
        eventType: 'completion',
        watchDuration: 15.2,
        completionRatio: 1.0
      });

    expect(eventRes.status).toBe(200);
    expect(eventRes.body.success).toBe(true);
    expect(eventRes.body.eventId).toBeDefined();

    // Query explainability
    const explainRes = await request(app)
      .get(`/api/reels/${reel._id}/explain`)
      .set('Cookie', viewer.cookie);

    expect(explainRes.status).toBe(200);
    expect(explainRes.body.engine).toBe('PulseRank-v1');
    expect(explainRes.body.reasons.some((r) => r.includes('Matched your interests'))).toBe(true);
  });
});
