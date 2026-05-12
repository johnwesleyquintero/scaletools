import { procurementStore } from '../lib/procurement/procurementStore';
import { DraftPO, POItem } from '../schemas/procurement.schema';
import { supplierService } from './supplierService';

/**
 * Service to bridge intelligence and procurement action layers.
 */
export const procurementService = {
  /**
   * Adds a product opportunity to a draft purchase order for a specific supplier.
   */
  async addToDraftPO(params: {
    asin: string;
    supplierId: string;
    amazonPrice: number;
    supplierPrice: number;
    confidenceScore: number;
  }): Promise<void> {
    const drafts = await procurementStore.getAllDrafts();
    let draft = drafts.find(d => d.supplier_id === params.supplierId && d.status === 'draft');
    
    if (!draft) {
      const supplier = await supplierService.getSupplierById(params.supplierId);
      draft = {
        id: `PO-${Date.now()}`,
        status: 'draft',
        supplier_id: params.supplierId,
        supplier_name: supplier?.name || 'Unknown Supplier',
        items: [],
        total_cost: 0,
        projected_profit: 0,
        created_at: Date.now(),
      };
    }

    const margin = params.amazonPrice - params.supplierPrice - (params.amazonPrice * 0.15); // Simple proxy fee

    const newItem: POItem = {
      asin: params.asin,
      supplier_price: params.supplierPrice,
      amazon_price: params.amazonPrice,
      quantity: 1, // Default to 1 for scaffold
      projected_margin: margin,
      confidence_score: params.confidenceScore,
    };

    // Prevent duplicate items in same PO for now
    if (!draft.items.find(i => i.asin === params.asin)) {
      draft.items.push(newItem);
      draft.total_cost += newItem.supplier_price;
      draft.projected_profit += newItem.projected_margin;
      
      await procurementStore.upsertDraft(draft);
    }
  },

  async getProcurementSummary() {
    const drafts = await procurementStore.getAllDrafts();
    return {
      active_drafts: drafts.length,
      total_projected_spend: drafts.reduce((sum, d) => sum + d.total_cost, 0),
      total_projected_profit: drafts.reduce((sum, d) => sum + d.projected_profit, 0),
    };
  }
};
