import { ASINHistory } from './keepaHistoryStore';

export interface TemporalSignals {
  price_trend: 'UP' | 'DOWN' | 'STABLE';
  demand_stability: number; // 0-1 (higher is more stable)
  market_volatility: number; // 0-1 (higher is more volatile)
  opportunity_decay: number; // 0-1 (higher means margin is shrinking faster)
}

/**
 * Analyzes historical snapshots to detect temporal market signals.
 */
export function analyzeTemporalHistory(history: ASINHistory): TemporalSignals {
  const snapshots = history.snapshots.sort((a, b) => a.timestamp - b.timestamp);
  
  if (snapshots.length < 2) {
    return {
      price_trend: 'STABLE',
      demand_stability: 1.0,
      market_volatility: 0.0,
      opportunity_decay: 0.0,
    };
  }

  const prices = snapshots.map(s => s.product.buy_box.price).filter(p => p > 0);
  const ranks = snapshots.map(s => s.product.sales_rank.current).filter(r => r > 0);

  // 1. Price Trend (Simple comparison of first and last)
  let price_trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
  if (prices.length >= 2) {
    const first = prices[0];
    const last = prices[prices.length - 1];
    const diffPercent = (last - first) / (first || 1);
    if (diffPercent > 0.05) price_trend = 'UP';
    else if (diffPercent < -0.05) price_trend = 'DOWN';
  }

  // 2. Demand Stability (Coeff of Variation proxy)
  let demand_stability = 0.8;
  if (ranks.length >= 2) {
    const avg = ranks.reduce((a, b) => a + b, 0) / ranks.length;
    const variance = ranks.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / ranks.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / (avg || 1);
    demand_stability = Math.max(0, 1 - cv); // Lower CV = higher stability
  }

  // 3. Market Volatility (Buy Box change frequency)
  let market_volatility = 0.2;
  let changes = 0;
  for (let i = 1; i < snapshots.length; i++) {
    if (snapshots[i].product.buy_box.seller !== snapshots[i-1].product.buy_box.seller) {
      changes++;
    }
  }
  market_volatility = Math.min(changes / (snapshots.length - 1), 1);

  // 4. Opportunity Decay
  // How fast is the gap between price and a theoretical cost shrinking?
  // (Simplified: Price decay)
  let opportunity_decay = 0.0;
  if (price_trend === 'DOWN') {
    const first = prices[0];
    const last = prices[prices.length - 1];
    opportunity_decay = Math.min(Math.abs((last - first) / first), 1);
  }

  return {
    price_trend,
    demand_stability,
    market_volatility,
    opportunity_decay,
  };
}
