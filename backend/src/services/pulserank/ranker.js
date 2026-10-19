/**
 * Stage D — Multi-objective Ranking Model
 * Computes transparent, explainable scores using the mathematical formula:
 * score = positive_value - negative_cost + freshness_bonus + exploration_bonus - repetition_penalty
 */

export const PULSERANK_WEIGHTS = {
  w_topic: 0.35,
  w_author: 0.30,
  w_engagement: 0.20,
  w_follow: 0.15,
  w_skip: 0.40,
  w_freshness: 0.15,
  w_exploration: 0.10,
  w_repetition: 0.50
};

export const rankCandidates = (featureMatrix, weights = PULSERANK_WEIGHTS) => {
  const scoredItems = [];

  for (const entry of featureMatrix) {
    const { item, features } = entry;
    const f = features;

    // 1. Positive value calculation
    const positiveValue =
      weights.w_topic * f.topicAffinity +
      weights.w_author * f.authorAffinity +
      weights.w_engagement * f.normalizedEngagement +
      weights.w_follow * f.isFollowing;

    // 2. Negative cost calculation
    const negativeCost = weights.w_skip * f.skipPenalty;

    // 3. Freshness bonus
    const freshnessBonus = weights.w_freshness * f.freshnessDecay;

    // 4. Exploration bonus
    const explorationBonus = weights.w_exploration * f.isEmergingCreator;

    // 5. Repetition penalty
    const repetitionPenalty = weights.w_repetition * f.alreadyWatched;

    // Authoritative score formula
    const finalScore =
      positiveValue - negativeCost + freshnessBonus + explorationBonus - repetitionPenalty;

    // Generate explainability reasons for transparency ("Why am I seeing this?")
    const reasons = [];
    if (f.isFollowing > 0) {
      reasons.push(`Because you follow @${item.reel.author.username}`);
    }
    if (f.topicAffinity > 0.3) {
      const matched = (item.reel.hashtags || []).slice(0, 2).map((t) => `#${t}`).join(', ');
      reasons.push(`Matched your interests (${matched})`);
    }
    if (f.authorAffinity > 0.4) {
      reasons.push(`Based on your previous engagement with @${item.reel.author.username}`);
    }
    if (f.isEmergingCreator > 0) {
      reasons.push('Discovered from a rising creator');
    }
    if (f.freshnessDecay > 0.7) {
      reasons.push('Freshly published video');
    }
    if (reasons.length === 0) {
      reasons.push('Popular in Aurora recommendations');
    }

    scoredItems.push({
      reel: item.reel,
      score: finalScore,
      explainability: {
        score: parseFloat(finalScore.toFixed(4)),
        reasons,
        signals: {
          positiveValue: parseFloat(positiveValue.toFixed(4)),
          negativeCost: parseFloat(negativeCost.toFixed(4)),
          freshnessBonus: parseFloat(freshnessBonus.toFixed(4)),
          repetitionPenalty: parseFloat(repetitionPenalty.toFixed(4))
        }
      }
    });
  }

  // Sort descending by finalScore with deterministic tie-breaking
  scoredItems.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.reel._id.toString().localeCompare(b.reel._id.toString());
  });

  return scoredItems;
};
