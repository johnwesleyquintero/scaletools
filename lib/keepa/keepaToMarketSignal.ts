import { KeepaProduct } from './keepaParser';
import { MarketSignals } from '../marketSignalEngine';

/**
 * Converts a normalized KeepaProduct into the system's internal MarketSignals.
 * This connects real Keepa data to our existing intelligence logic.
 */
export function mapKeepaToMarketSignals(product: KeepaProduct): MarketSignals {
  // 1. Determine Price Trend
  let price_trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
  const currentPrice = product.buy_box.price;
  const avg90d = product.buy_box.avg_90d;
  
  if (currentPrice > 0 && avg90d > 0) {
    const diff = (currentPrice - avg90d) / avg90d;
    if (diff > 0.05) price_trend = 'UP';
    else if (diff < -0.05) price_trend = 'DOWN';
  }

  // 2. Sales Rank Percentile (Proxy calculation)
  // In a real system, we'd compare against category total. 
  // For now, we'll map rank ranges to a 0-100 scale.
  let sales_rank_percentile = 50;
  if (product.sales_rank.current > 0) {
    if (product.sales_rank.current < 10000) sales_rank_percentile = 10;
    else if (product.sales_rank.current < 50000) sales_rank_percentile = 30;
    else if (product.sales_rank.current < 150000) sales_rank_percentile = 60;
    else sales_rank_percentile = 90;
  }

  // 3. Buy Box Stability
  // Check if current price is far from 90d average
  const is_buy_box_stable = Math.abs((currentPrice - avg90d) / (avg90d || 1)) < 0.1;

  // 4. Competition Count (Derived if not direct)
  // For now, we use a constant or proxy if available in raw data.
  // Mocking 10 for now as it's not always in basic exports.
  const competition_count = 10;

  return {
    price_trend,
    sales_rank_percentile,
    competition_count,
    is_buy_box_stable
  };
}
