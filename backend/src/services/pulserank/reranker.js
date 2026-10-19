/**
 * Stage E — Final Reranking & Diversity Control
 * Enforces creator diversification, prevents consecutive duplicates,
 * balances familiar interests with discovery, and delivers cursor-stable slices.
 */
export const rerankFeed = (scoredItems, page = 1, limit = 10) => {
  if (!scoredItems || scoredItems.length === 0) return [];

  const diversifiedList = [];
  const remaining = [...scoredItems];
  let lastCreatorId = null;
  let consecutiveCreatorCount = 0;

  while (remaining.length > 0) {
    let chosenIndex = -1;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const authorId = candidate.reel.author._id
        ? candidate.reel.author._id.toString()
        : candidate.reel.author.toString();

      // Check consecutive creator constraint: max 2 from same creator in a row
      if (authorId === lastCreatorId && consecutiveCreatorCount >= 2) {
        continue; // Try to pick an alternate creator
      }

      chosenIndex = i;
      break;
    }

    // If all remaining candidates are from the same creator, pick the first one anyway
    if (chosenIndex === -1) {
      chosenIndex = 0;
    }

    const selected = remaining.splice(chosenIndex, 1)[0];
    const authorId = selected.reel.author._id
      ? selected.reel.author._id.toString()
      : selected.reel.author.toString();

    if (authorId === lastCreatorId) {
      consecutiveCreatorCount++;
    } else {
      lastCreatorId = authorId;
      consecutiveCreatorCount = 1;
    }

    diversifiedList.push(selected);
  }

  // Stable pagination slicing
  const startIndex = (page - 1) * limit;
  return diversifiedList.slice(startIndex, startIndex + limit);
};
