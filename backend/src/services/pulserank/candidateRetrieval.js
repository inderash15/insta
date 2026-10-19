import { Reel } from '../../models/Reel.js';
import { Follow } from '../../models/Follow.js';
import { RecommendationEvent } from '../../models/RecommendationEvent.js';

/**
 * Stage A — Multi-source Candidate Retrieval
 * Retrieves a candidate pool from followed accounts, topic interests,
 * creator affinities, fresh emerging creators, and an exploration buffer.
 */
export const retrieveCandidates = async (user, poolLimit = 60) => {
  const userId = user?._id;
  const candidatesMap = new Map();

  const addReelsToPool = (reels, sourceTag) => {
    for (const reel of reels) {
      const idStr = reel._id.toString();
      if (!candidatesMap.has(idStr)) {
        candidatesMap.set(idStr, {
          reel,
          sources: [sourceTag]
        });
      } else {
        candidatesMap.get(idStr).sources.push(sourceTag);
      }
    }
  };

  // 1. Followed accounts candidate pool
  if (userId) {
    const followingDocs = await Follow.find({
      follower: userId,
      status: 'accepted'
    }).select('following');
    const followingIds = followingDocs.map((f) => f.following);

    if (followingIds.length > 0) {
      const followedReels = await Reel.find({ author: { $in: followingIds } })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('author', 'username fullName avatarUrl isVerified isPrivate');
      addReelsToPool(followedReels, 'following');
    }
  }

  // 2. Topic/Interest matched candidates
  const explicitInterests = user?.interests || [];
  if (explicitInterests.length > 0) {
    const interestReels = await Reel.find({
      hashtags: { $in: explicitInterests }
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('author', 'username fullName avatarUrl isVerified isPrivate');
    addReelsToPool(interestReels, 'interest_match');
  }

  // 3. Creator affinity pool (creators user has liked or watched in past events)
  if (userId) {
    const pastEngagements = await RecommendationEvent.find({
      viewer: userId,
      eventType: { $in: ['like', 'completion', 'save'] }
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .select('author');
    const engagedAuthorIds = [
      ...new Set(pastEngagements.map((e) => e.author?.toString()).filter(Boolean))
    ];

    if (engagedAuthorIds.length > 0) {
      const affinityReels = await Reel.find({
        author: { $in: engagedAuthorIds }
      })
        .sort({ createdAt: -1 })
        .limit(15)
        .populate('author', 'username fullName avatarUrl isVerified isPrivate');
      addReelsToPool(affinityReels, 'creator_affinity');
    }
  }

  // 4. Emerging & Fresh Creators pool (reels uploaded in the last 72 hours with growing traction)
  const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
  const freshReels = await Reel.find({
    createdAt: { $gte: threeDaysAgo }
  })
    .sort({ viewsCount: -1, createdAt: -1 })
    .limit(25)
    .populate('author', 'username fullName avatarUrl isVerified isPrivate');
  addReelsToPool(freshReels, 'emerging_fresh');

  // 5. Exploration & General Discovery buffer (randomized or newest)
  const discoveryReels = await Reel.find({})
    .sort({ createdAt: -1 })
    .limit(poolLimit)
    .populate('author', 'username fullName avatarUrl isVerified isPrivate');
  addReelsToPool(discoveryReels, 'discovery_exploration');

  return Array.from(candidatesMap.values());
};
