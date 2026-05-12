import { DraftPO } from '@/schemas/procurement.schema';
import { outcomeStore } from './outcomeStore';

export interface SupplierAllocationMetrics {
  supplierId: string;
  supplierName: string;
  avgROI: number;
  avgMargin: number;
  opportunityDensity: number;
  riskScore: number;
  confidenceScore: number;
  totalValueInDraft: number;
  accuracyScore: number;
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
   * Aggregates metrics from active drafts, including historical accuracy.
   */
  async computeSupplierMetrics(drafts: DraftPO[]): Promise<SupplierAllocationMetrics[]> {
    const metricsPromises = drafts.map(async draft => {
      const totalItems = draft.items.length;
      const avgROI = draft.items.reduce((sum, item) => sum + (item.projected_margin / (item.supplier_price || 1)), 0) / (totalItems || 1);
      const avgMargin = draft.projected_profit / (totalItems || 1);
      const confidenceScore = draft.items.reduce((sum, item) => sum + item.confidence_score, 0) / (totalItems || 1);
      
      const outcomeMetrics = await outcomeStore.getSupplierMetrics(draft.supplier_id);
      
      // Heuristic: Risk is inverse of confidence + items density penalty
      // Feedback: Adjust risk based on historical accuracy
      const baseRisk = Math.max(0, (1 - confidenceScore) * 0.8);
      const riskScore = baseRisk * (2 - outcomeMetrics.accuracy_score);
      
      return {
        supplierId: draft.supplier_id,
        supplierName: draft.supplier_name,
        avgROI,
        avgMargin,
        opportunityDensity: totalItems,
        riskScore,
        confidenceScore,
        totalValueInDraft: draft.total_cost,
        accuracyScore: outcomeMetrics.accuracy_score
      };
    });

    return Promise.all(metricsPromises);
  },

  /**
   * Core algorithm for capital distribution.
   */
  allocate(capital: number, metrics: SupplierAllocationMetrics[]): AllocationResult[] {
    if (metrics.length === 0 || capital <= 0) return [];

    // 1. Calculate weighted scores
    const scoredSuppliers = metrics.map(m => {
      // weights: ROI (50%), Accuracy (30%), Confidence (10%), Density (10%)
      const roiScore = Math.min(1, m.avgROI);
      const densityBonus = Math.min(0.1, (m.opportunityDensity / 10) * 0.1);
      
      const rawScore = (roiScore * 0.5) + (m.accuracyScore * 0.3) + (m.confidenceScore * 0.1) + densityBonus - (m.riskScore * 0.2);
      
      return {
        ...m,
        rawScore: Math.max(0.05, rawScore)
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
