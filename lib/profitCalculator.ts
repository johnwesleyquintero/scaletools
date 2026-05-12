const DEFAULT_AMAZON_FEE_RATE = 0.15;
const VOLATILITY_BUFFER = 0.05; // 5% buffer for price swings

export interface ProfitStats {
  margin: number;
  roi: number;
  fees: number;
  risk_adjusted_margin: number;
  profit_score: number; // 0-1 score for overall profitability
}

/**
 * Calculates profit margins and ROI with risk considerations.
 */
export function calculateProfit(
  amazonPrice: number,
  supplierCost: number,
  feeRate: number = DEFAULT_AMAZON_FEE_RATE,
  matchConfidence: number = 1.0
): ProfitStats {
  const fees = amazonPrice * feeRate;
  const margin = amazonPrice - supplierCost - fees;
  const roi = supplierCost > 0 ? margin / supplierCost : 0;
  
  // Risk-adjusted margin: subtract a buffer to account for potential price drops
  const risk_adjusted_margin = margin - (amazonPrice * VOLATILITY_BUFFER);
  
  // Profit Score (0-1): Based on ROI and confidence
  // High ROI (e.g. > 30%) with high confidence yields a high score
  const roiScore = Math.min(Math.max(roi / 0.5, 0), 1); // 50% ROI is a "perfect" score
  const profit_score = roiScore * matchConfidence;
  
  return {
    margin,
    roi,
    fees,
    risk_adjusted_margin,
    profit_score
  };
}
