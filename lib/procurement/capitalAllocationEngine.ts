import { DraftPO } from '@/schemas/procurement.schema';

export interface SupplierAllocationMetrics {
  supplierId: string;
  supplierName: string;
  avgROI: number;
  avgMargin: number;
  opportunityDensity: number;
  riskScore: number;
  confidenceScore: number;
  totalValueInDraft: number;
}

export interface AllocationResult {
  supplierId: string;
  supplierName: string;
  recommendedSpend: number;
  expectedROI: number;
  riskAdjustedScore: number;
  reasoning: string[];
}

/**
 * Capital Allocation Engine v1
 * Enables ScaleTools to weigh portfolio-level decisions across suppliers.
 */
export const capitalAllocationEngine = {
  /**
   * Aggregates metrics from active drafts.
   */
  async computeSupplierMetrics(drafts: DraftPO[]): Promise<SupplierAllocationMetrics[]> {
    return drafts.map(draft => {
      const totalItems = draft.items.length;
      const avgROI = draft.items.reduce((sum, item) => sum + (item.projected_margin / (item.supplier_price || 1)), 0) / (totalItems || 1);
      const avgMargin = draft.projected_profit / (totalItems || 1);
      const confidenceScore = draft.items.reduce((sum, item) => sum + item.confidence_score, 0) / (totalItems || 1);
      
      // Heuristic: Risk is inverse of confidence + items density penalty (more items = more complexity/risk)
      const riskScore = Math.max(0, (1 - confidenceScore) * 0.8);
      
      return {
        supplierId: draft.supplier_id,
        supplierName: draft.supplier_name,
        avgROI,
        avgMargin,
        opportunityDensity: totalItems,
        riskScore,
        confidenceScore,
        totalValueInDraft: draft.total_cost
      };
    });
  },

  /**
   * Core algorithm for capital distribution.
   */
  allocate(capital: number, metrics: SupplierAllocationMetrics[]): AllocationResult[] {
    if (metrics.length === 0 || capital <= 0) return [];

    // 1. Calculate weighted scores
    const scoredSuppliers = metrics.map(m => {
      // weights: ROI (60%), Confidence (25%), Density (15%)
      // subtract Risk penalty
      const roiScore = Math.min(1, m.avgROI); // Cap at 100% for scoring
      const densityBonus = Math.min(0.15, (m.opportunityDensity / 10) * 0.15);
      
      const rawScore = (roiScore * 0.6) + (m.confidenceScore * 0.25) + densityBonus - (m.riskScore * 0.3);
      
      return {
        ...m,
        rawScore: Math.max(0.1, rawScore) // Ensure at least a base floor
      };
    });

    // 2. Normalize and distribute
    const totalScore = scoredSuppliers.reduce((sum, s) => sum + s.rawScore, 0);
    
    return scoredSuppliers.map(s => {
      const weight = s.rawScore / totalScore;
      const recommendedSpend = capital * weight;
      
      const reasoning = [
        `Targeting batch with ${(s.avgROI * 100).toFixed(1)}% expected ROI`,
        s.confidenceScore > 0.8 ? "High verification confidence" : "Requires further data validation",
        s.riskScore > 0.4 ? "Significant risk penalty applied" : "Low volatility profile",
        `Optimized for ${s.opportunityDensity} line-item opportunities`
      ];

      return {
        supplierId: s.supplierId,
        supplierName: s.supplierName,
        recommendedSpend,
        expectedROI: s.avgROI,
        riskAdjustedScore: s.rawScore,
        reasoning
      };
    }).sort((a, b) => b.recommendedSpend - a.recommendedSpend);
  }
};
