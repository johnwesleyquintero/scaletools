import fs from 'fs/promises';
import path from 'path';
import { DraftPO } from '../../schemas/procurement.schema';

const STORE_PATH = path.join(process.cwd(), 'data', 'purchase_orders.json');

/**
 * Foundation store for managing the procurement lifecycle.
 */
export const procurementStore = {
  async init() {
    try {
      await fs.access(STORE_PATH);
    } catch {
      await fs.writeFile(STORE_PATH, JSON.stringify([], null, 2));
    }
  },

  /**
   * Fetches all draft purchase orders.
   */
  async getAllDrafts(): Promise<DraftPO[]> {
    await this.init();
    const data = await fs.readFile(STORE_PATH, 'utf-8');
    return JSON.parse(data);
  },

  /**
   * Saves or updates a draft purchase order.
   */
  async upsertDraft(draft: DraftPO) {
    const drafts = await this.getAllDrafts();
    const index = drafts.findIndex(d => d.id === draft.id);
    
    if (index >= 0) {
      drafts[index] = draft;
    } else {
      drafts.push(draft);
    }
    
    await fs.writeFile(STORE_PATH, JSON.stringify(drafts, null, 2));
  },

  /**
   * Fetches a single draft by ID.
   */
  async getDraftById(id: string): Promise<DraftPO | undefined> {
    const drafts = await this.getAllDrafts();
    return drafts.find(d => d.id === id);
  }
};
