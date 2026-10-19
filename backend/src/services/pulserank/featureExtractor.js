import { Follow } from '../../models/Follow.js';
import { RecommendationEvent } from '../../models/RecommendationEvent.js';

/**
 * Stage C — Feature Extraction
 * Extracts legitimate signals across Viewer, Content, and Viewer-Content interactions.
 */
export const extractFeatures = async (candidateItems, user) => {
  if (!candidateItems || candidateItems.length === 0) return [];
  const userId = user?._id;

  const userInterests = new Set((user?.interests || []).map((t) => t.toLowerCase()));

  // Pre-fetch viewer engagement history if authenticated
  let followingSet = new Set();
  let authorEngagementCounts = new Map();
  let watchedReelSet = new Set();
  let skippedAuthorCounts = new Map();

  if (userId) {
    const [followDocs, pastEvents] = await Promise.all([
      Follow.find({ follower: userId, status: 'accepted' }).select('following'),
      RecommendationEvent.find({
        viewer: userId,
        createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
      }).select('reel author eventType')
    ]);

    followingSet = new Set(followDocs.map((f) => f.following?.toString()).filter(Boolean));

    for (const evt of pastEvents) {
      const authId = evt.author?.toString();
      const reelId = evt.reel?.toString();

      if (reelId && (evt.eventType === 'completion' || evt.eventType === 'watch_progress')) {
        watchedReelSet.add(reelId);
      }

      if (authId) {
        if (['like', 'completion', 'save', 'comment'].includes(evt.eventType)) {
          authorEngagementCounts.set(authId, (authorEngagementCounts.get(authId) || 0) + 1);
        } else if (evt.eventType === 'skip') {
          skippedAuthorCounts.set(authId, (skippedAuthorCounts.get(authId) || 0) + 1);
        }
      }
    }
  }

  const featureList = [];

  for (const item of candidateItems) {
    const reel = item.reel;
    const authorId = reel.author._id ? reel.author._id.toString() : reel.author.toString();
    const reelId = reel._id.toString();

    // 1. Topic affinity calculation
    const reelHashtags = (reel.hashtags || []).map((h) => h.toLowerCase());
    let topicOverlap = 0;
    if (userInterests.size > 0 && reelHashtags.length > 0) {
      for (const tag of reelHashtags) {
        if (userInterests.has(tag)) topicOverlap++;
      }
    }
    const topicAffinity = reelHashtags.length > 0 ? Math.min(topicOverlap / reelHashtags.length, 1.0) : 0;

    // 2. Author affinity
    const authorEngagements = authorEngagementCounts.get(authorId) || 0;
    const authorAffinity = Math.min(authorEngagements / 5, 1.0);

    // 3. Follow bonus
    const isFollowing = followingSet.has(authorId) ? 1.0 : 0.0;

    // 4. Freshness exponential decay
    const ageInHours = Math.max((Date.now() - new Date(reel.createdAt).getTime()) / (1000 * 60 * 60), 0);
    const freshnessDecay = Math.exp(-ageInHours / 48); // 48h half-decay curve

    // 5. Normalized engagement velocity
    const views = Math.max(reel.viewsCount || 0, 1);
    const likes = reel.likesCount || 0;
    const comments = reel.commentsCount || 0;
    const rawEngagement = (likes * 1.0 + comments * 2.0) / views;
    const normalizedEngagement = Math.min(rawEngagement, 1.0);

    // 6. Emerging creator bonus (creator has under 5 reels or new account)
    const isEmergingCreator = (reel.author.counts?.posts || 0) < 5 ? 1.0 : 0.0;

    // 7. Repetition & skip penalties
    const alreadyWatched = watchedReelSet.has(reelId) ? 1.0 : 0.0;
    const skipCount = skippedAuthorCounts.get(authorId) || 0;
    const skipPenalty = Math.min(skipCount / 3, 1.0);

    featureList.push({
      item,
      features: {
        topicAffinity,
        authorAffinity,
        isFollowing,
        freshnessDecay,
        normalizedEngagement,
        isEmergingCreator,
        alreadyWatched,
        skipPenalty
      }
    });
  }

  return featureList;
};
