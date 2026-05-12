import { ASINHistory } from './keepaHistoryStore';
import { analyzeTemporalHistory, TemporalSignals } from './keepaTemporalAnalyzer';
import { calculateConfidenceScore } from './confidenceEngine';

export interface ASINIntelligence extends TemporalSignals {
  asin: string;
  demand_score: number;
  stability_score: number;
  volatility_score: number;
  opportunity_score: number;
  confidence_score: number;
}

/**
 * Combines snapshots and temporal signals into a high-level intelligence object for an ASIN.
 */
export function computeASINIntelligence(history: ASINHistory): ASINIntelligence {
  const temporalSignals = analyzeTemporalHistory(history);
  
  // Get latest snapshot for current state
  const latestSnapshot = history.snapshots[history.snapshots.length - 1];
  const confidence = calculateConfidenceScore(latestSnapshot.timestamp);

  // Derive demand score (Current rank vs historical stability)
  const rank = latestSnapshot.product.sales_rank.current;
  let baseDemand = 0.5;
  if (rank > 0) {
    if (rank < 50000) baseDemand = 0.9;
    else if (rank < 150000) baseDemand = 0.6;
    else baseDemand = 0.3;
  }
  const demand_score = baseDemand * temporalSignals.demand_stability;

  // Opportunity Score (Simplified: High stability + Positive price trend)
  let opportunity_score = 0.5;
  if (temporalSignals.price_trend === 'UP') opportunity_score += 0.2;
  if (temporalSignals.price_trend === 'DOWN') opportunity_score -= 0.3;
  opportunity_score += (temporalSignals.demand_stability * 0.3);
  opportunity_score = Math.min(Math.max(opportunity_score, 0), 1);

  return {
    asin: history.asin,
    ...temporalSignals,
    demand_score,
    stability_score: temporalSignals.demand_stability,
    volatility_score: temporalSignals.market_volatility,
    opportunity_score,
    confidence_score: confidence,
  };
}
