/**
 * Market signals and scoring logic.
 */

export interface MarketSignals {
  price_trend: 'UP' | 'DOWN' | 'STABLE';
  sales_rank_percentile: number; // 0-100 (lower is better, but here we'll treat higher as "better rank" for scoring)
  competition_count: number;
  is_buy_box_stable: boolean;
}

export interface MarketScore {
  demand_score: number;
  trend_score: number;
  competition_score: number;
  stability_score: number;
  final_market_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Calculates a market score based on various signals.
 */
export function calculateMarketScore(signals: MarketSignals): MarketScore {
  // 1. Demand Score (Higher percentile = better sales rank/demand)
  const demand_score = Math.min(Math.max((100 - signals.sales_rank_percentile) / 100, 0), 1);
  
  // 2. Trend Score
  let trend_score = 0.5;
  if (signals.price_trend === 'UP') trend_score = 0.9;
  if (signals.price_trend === 'DOWN') trend_score = 0.2;
  if (signals.price_trend === 'STABLE') trend_score = 0.7;
  
  // 3. Competition Score
  let competition_score = 1.0;
  if (signals.competition_count > 20) competition_score = 0.2;
  else if (signals.competition_count > 10) competition_score = 0.5;
  else if (signals.competition_count > 5) competition_score = 0.8;
  
  // 4. Stability Score
  const stability_score = signals.is_buy_box_stable ? 0.9 : 0.3;
  
  // Weighted final market score
  const final_market_score = (demand_score * 0.4) + (trend_score * 0.2) + (competition_score * 0.2) + (stability_score * 0.2);
  
  // Risk Level assessment
  let risk_level: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
  if (final_market_score > 0.7 && signals.is_buy_box_stable) risk_level = 'LOW';
  if (final_market_score < 0.4 || signals.price_trend === 'DOWN') risk_level = 'HIGH';
  
  return {
    demand_score,
    trend_score,
    competition_score,
    stability_score,
    final_market_score,
    risk_level
  };
}
