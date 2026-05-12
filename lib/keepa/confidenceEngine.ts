/**
 * Confidence decay logic for data age.
 */
export function calculateConfidenceScore(lastUpdatedTimestamp: number): number {
  const now = Date.now();
  const ageInDays = (now - lastUpdatedTimestamp) / (1000 * 60 * 60 * 24);

  if (ageInDays <= 7) return 1.0;     // 0-7 days -> 100%
  if (ageInDays <= 30) return 0.7;    // 8-30 days -> 70%
  if (ageInDays <= 90) return 0.4;    // 31-90 days -> 40%
  
  return 0.1; // Very old data
}

/**
 * Applies confidence penalty to a base score.
 */
export function applyConfidencePenalty(baseScore: number, confidence: number): number {
  return baseScore * confidence;
}
