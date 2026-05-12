import fs from 'fs/promises';
import path from 'path';
import { PurchaseOutcome, OutcomeMetrics } from '../../schemas/procurementOutcome.schema';
import { DraftPO } from '../../schemas/procurement.schema';

const STORE_PATH = path.join(process.cwd(), 'data', 'procurement_outcomes.json');

export const outcomeStore = {
  async init() {
    try {
      await fs.access(STORE_PATH);
    } catch {
      await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
      await fs.writeFile(STORE_PATH, JSON.stringify([], null, 2));
    }
  },

  async getAllOutcomes(): Promise<PurchaseOutcome[]> {
    await this.init();
    const data = await fs.readFile(STORE_PATH, 'utf-8');
    return JSON.parse(data);
  },

  /**
   * Records outcomes from a Draft PO when it moves to execution.
   */
  async recordFromPO(draft: DraftPO) {
    const outcomes = await this.getAllOutcomes();
    
    const newOutcomes: PurchaseOutcome[] = draft.items.map(item => ({
      id: `OUT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      po_id: draft.id,
      supplier_id: draft.supplier_id,
      supplier_name: draft.supplier_name,
      asin: item.asin,
      title: item.title,
      predicted_cost: item.supplier_price,
      predicted_margin: item.projected_margin,
      predicted_roi: item.projected_margin / (item.supplier_price || 1),
      confidence_at_order: item.confidence_score,
      status: 'ordered',
      created_at: Date.now(),
      updated_at: Date.now(),
    }));

    await fs.writeFile(STORE_PATH, JSON.stringify([...outcomes, ...newOutcomes], null, 2));
    return newOutcomes;
  },

  async updateOutcome(id: string, updates: Partial<PurchaseOutcome>) {
    const outcomes = await this.getAllOutcomes();
    const index = outcomes.findIndex(o => o.id === id);
    if (index >= 0) {
      outcomes[index] = { ...outcomes[index], ...updates, updated_at: Date.now() };
      await fs.writeFile(STORE_PATH, JSON.stringify(outcomes, null, 2));
    }
  },

  /**
   * Calculates performance metrics for a supplier based on outcomes.
   */
  async getSupplierMetrics(supplierId: string): Promise<OutcomeMetrics> {
    const outcomes = await this.getAllOutcomes();
    const supplierOutcomes = outcomes.filter(o => o.supplier_id === supplierId && o.status === 'received');
    
    if (supplierOutcomes.length === 0) {
      return {
        supplier_id: supplierId,
        accuracy_score: 1.0, // Default to 1 for new suppliers to avoid penalizing lack of data
        avg_margin_deviation: 0,
        total_orders: 0,
        successful_orders: 0,
      };
    }

    const deviations = supplierOutcomes.map(o => {
      const pred = o.predicted_margin;
      const actual = o.actual_margin ?? pred;
      return Math.abs(pred - actual) / (pred || 1);
    });

    const avg_margin_deviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;
    const accuracy_score = Math.max(0, 1 - avg_margin_deviation);

    return {
      supplier_id: supplierId,
      accuracy_score,
      avg_margin_deviation,
      total_orders: outcomes.filter(o => o.supplier_id === supplierId).length,
      successful_orders: supplierOutcomes.length,
    };
  }
};
