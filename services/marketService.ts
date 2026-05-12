import { MarketSignals, MarketScore, calculateMarketScore } from '../lib/marketSignalEngine';

/**
 * Service to simulate or fetch market signals for products.
 */
export const marketService = {
  /**
   * Fetches/Simulates market signals for a given ASIN.
   */
  async getMarketSignals(asin: string): Promise<MarketSignals> {
    // In a real scenario, this would fetch from Keepa API or similar.
    // For now, we simulate based on ASIN characters to get deterministic results.
    const charCodeSum = asin.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    return {
      price_trend: charCodeSum % 3 === 0 ? 'UP' : charCodeSum % 3 === 1 ? 'STABLE' : 'DOWN',
      sales_rank_percentile: (charCodeSum % 100),
      competition_count: (charCodeSum % 30) + 1,
      is_buy_box_stable: charCodeSum % 2 === 0,
    };
  },

  /**
   * Enriches a product analysis with market intelligence.
   */
  async getMarketIntelligence(asin: string): Promise<MarketScore> {
    const signals = await this.getMarketSignals(asin);
    return calculateMarketScore(signals);
  }
};
