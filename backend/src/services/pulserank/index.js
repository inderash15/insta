import { retrieveCandidates } from './candidateRetrieval.js';
import { filterCandidates } from './safetyFilter.js';
import { extractFeatures } from './featureExtractor.js';
import { rankCandidates, PULSERANK_WEIGHTS } from './ranker.js';
import { rerankFeed } from './reranker.js';

/**
 * PulseRank — Aurora's Explainable Multi-Objective Recommendation Engine
 * Executes Stages A through E in sequence:
 * Retrieval -> Safety Filtering -> Feature Extraction -> Scoring -> Diversification
 */
export const getPulseRankReels = async ({ user, page = 1, limit = 10 }) => {
  // Stage A: Multi-pool candidate retrieval
  const candidatePool = await retrieveCandidates(user, 80);

  // Stage B: Eligibility & safety filtering
  const eligibleCandidates = await filterCandidates(candidatePool, user);

  // Stage C: Feature extraction
  const featureMatrix = await extractFeatures(eligibleCandidates, user);

  // Stage D: Multi-objective ranking with explainability
  const scoredItems = rankCandidates(featureMatrix, PULSERANK_WEIGHTS);

  // Stage E: Final reranking & diversification
  const pagedResults = rerankFeed(scoredItems, page, limit);

  return {
    reels: pagedResults.map((item) => ({
      ...item.reel.toObject ? item.reel.toObject() : item.reel,
      _pulseRankScore: item.score,
      explainability: item.explainability
    })),
    totalEligible: scoredItems.length,
    page,
    limit
  };
};

export { PULSERANK_WEIGHTS };
