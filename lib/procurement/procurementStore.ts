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
  },

  /**
   * Adds an item to a draft PO for a specific supplier.
   * If no draft exists for the supplier, a new one is created.
   */
  async addItemToDraft(supplierId: string, supplierName: string, item: any) {
    const drafts = await this.getAllDrafts();
    let draft = drafts.find(d => d.supplier_id === supplierId && d.status === 'draft');
    
    if (!draft) {
      draft = {
        id: `PO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'draft',
        supplier_id: supplierId,
        supplier_name: supplierName,
        items: [],
        total_cost: 0,
        projected_profit: 0,
        created_at: Date.now(),
      };
      drafts.push(draft);
    }
    
    // Check if item already exists in this draft
    const existingItemIndex = draft.items.findIndex((i: any) => i.asin === item.asin);
    if (existingItemIndex >= 0) {
      draft.items[existingItemIndex].quantity += item.quantity;
    } else {
      draft.items.push(item);
    }
    
    // Recalculate totals
    draft.total_cost = draft.items.reduce((sum: number, i: any) => sum + (i.supplier_price * i.quantity), 0);
    draft.projected_profit = draft.items.reduce((sum: number, i: any) => sum + (i.projected_margin * i.quantity), 0);
    
    await fs.writeFile(STORE_PATH, JSON.stringify(drafts, null, 2));
    return draft;
  }
};
