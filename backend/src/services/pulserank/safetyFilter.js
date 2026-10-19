import { Follow } from '../../models/Follow.js';
import { RecommendationEvent } from '../../models/RecommendationEvent.js';

/**
 * Stage B — Eligibility & Safety Filtering
 * Strictly excludes blocked authors, hidden creators, private ineligible accounts,
 * and content explicitly marked as "Not interested".
 */
export const filterCandidates = async (candidateItems, user) => {
  if (!candidateItems || candidateItems.length === 0) return [];
  const userId = user?._id;

  const blockedUserIds = new Set((user?.blockedUsers || []).map((id) => id.toString()));
  const hiddenCreatorIds = new Set((user?.hiddenCreators || []).map((id) => id.toString()));

  // Fetch all reels explicitly marked "not_interested" by this user
  let notInterestedReelIds = new Set();
  let followingUserIds = new Set();

  if (userId) {
    const [notInterestedEvents, followDocs] = await Promise.all([
      RecommendationEvent.find({
        viewer: userId,
        eventType: 'not_interested'
      }).select('reel'),
      Follow.find({
        follower: userId,
        status: 'accepted'
      }).select('following')
    ]);

    notInterestedReelIds = new Set(
      notInterestedEvents.map((e) => e.reel?.toString()).filter(Boolean)
    );
    followingUserIds = new Set(
      followDocs.map((f) => f.following?.toString()).filter(Boolean)
    );
  }

  const eligible = [];

  for (const item of candidateItems) {
    const reel = item.reel;
    if (!reel || !reel.author) continue;

    const reelIdStr = reel._id.toString();
    const authorIdStr = reel.author._id ? reel.author._id.toString() : reel.author.toString();

    // 1. Exclude blocked users (either direction)
    if (blockedUserIds.has(authorIdStr)) continue;

    // 2. Exclude hidden creators
    if (hiddenCreatorIds.has(authorIdStr)) continue;

    // 3. Exclude explicitly marked "Not Interested"
    if (notInterestedReelIds.has(reelIdStr)) continue;

    // 4. Exclude private accounts if not followed and not self
    const isSelf = userId && userId.toString() === authorIdStr;
    const isPrivate = reel.author.isPrivate;
    if (isPrivate && !isSelf && !followingUserIds.has(authorIdStr)) {
      continue;
    }

    eligible.push(item);
  }

  return eligible;
};
