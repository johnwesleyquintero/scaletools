import { parseKeepaCSV, KeepaProduct } from '../lib/keepa/keepaParser';
import { normalizeKeepaRow } from '../lib/keepa/keepaNormalizer';
import { keepaHistoryStore } from '../lib/keepa/keepaHistoryStore';
import { computeASINIntelligence, ASINIntelligence } from '../lib/keepa/asinIntelligenceEngine';

export interface IngestionResult {
  processed: number;
  valid: number;
  failed: number;
  updated_asins: number;
  intelligence: ASINIntelligence[];
}

/**
 * Service to orchestrate Keepa CSV ingestion and temporal intelligence mapping.
 */
export const keepaIngestionService = {
  /**
   * Processes a Keepa CSV file and appends it to history.
   */
  async ingestCSV(csvContent: string): Promise<IngestionResult> {
    try {
      const rawData = await parseKeepaCSV(csvContent);
      const timestamp = Date.now();
      
      const normalizedProducts: KeepaProduct[] = [];
      const result: IngestionResult = {
        processed: 0,
        valid: 0,
        failed: 0,
        updated_asins: 0,
        intelligence: []
      };

      for (const row of rawData) {
        result.processed++;
        try {
          const product = normalizeKeepaRow(row);
          if (!product.asin) continue;
          
          normalizedProducts.push(product);
          result.valid++;
        } catch (e) {
          result.failed++;
        }
      }

      // Store snapshots in history
      await keepaHistoryStore.appendSnapshots(normalizedProducts, timestamp);
      
      // Compute intelligence for all updated ASINs
      const asins = normalizedProducts.map(p => p.asin);
      result.updated_asins = asins.length;

      for (const asin of asins) {
        const history = await keepaHistoryStore.getASINHistory(asin);
        if (history) {
          const intel = computeASINIntelligence(history);
          result.intelligence.push(intel);
        }
      }

      return result;
    } catch (error) {
      console.error('Keepa ingestion failed:', error);
      throw error;
    }
  }
};
