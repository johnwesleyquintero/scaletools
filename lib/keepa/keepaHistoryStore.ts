import fs from 'fs/promises';
import path from 'path';
import { KeepaProduct } from './keepaParser';

export interface KeepaSnapshot {
  id: string;
  timestamp: number;
  source: 'csv_upload';
  products: KeepaProduct[];
}

export interface ASINHistory {
  asin: string;
  snapshots: {
    timestamp: number;
    product: KeepaProduct;
  }[];
}

const HISTORY_PATH = path.join(process.cwd(), 'data', 'keepa_history.json');

/**
 * Store for maintaining historical Keepa snapshots per ASIN.
 */
export const keepaHistoryStore = {
  async init() {
    try {
      await fs.access(HISTORY_PATH);
    } catch {
      await fs.writeFile(HISTORY_PATH, JSON.stringify({}, null, 2));
    }
  },

  /**
   * Fetches the entire history object.
   */
  async getHistory(): Promise<Record<string, ASINHistory>> {
    await this.init();
    const data = await fs.readFile(HISTORY_PATH, 'utf-8');
    return JSON.parse(data);
  },

  /**
   * Appends new snapshots for a batch of products.
   */
  async appendSnapshots(products: KeepaProduct[], timestamp: number = Date.now()) {
    const history = await this.getHistory();
    
    for (const product of products) {
      if (!product.asin) continue;
      
      if (!history[product.asin]) {
        history[product.asin] = {
          asin: product.asin,
          snapshots: []
        };
      }
      
      // Add the snapshot
      history[product.asin].snapshots.push({
        timestamp,
        product
      });
      
      // Keep only the last 10 snapshots to avoid file bloat in this prototype phase
      if (history[product.asin].snapshots.length > 10) {
        history[product.asin].snapshots = history[product.asin].snapshots.slice(-10);
      }
    }
    
    await fs.writeFile(HISTORY_PATH, JSON.stringify(history, null, 2));
  },

  /**
   * Gets history for a specific ASIN.
   */
  async getASINHistory(asin: string): Promise<ASINHistory | undefined> {
    const history = await this.getHistory();
    return history[asin];
  }
};
