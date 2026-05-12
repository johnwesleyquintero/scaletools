import { outcomeStore } from './outcomeStore';
import { procurementStore } from './procurementStore';
import { capitalAllocationEngine, SupplierAllocationMetrics } from './capitalAllocationEngine';

export interface RebalanceRecommendation {
  supplierId: string;
  supplierName: string;
  currentAllocation: number;
  recommendedAllocation: number;
  adjustmentDelta: number;
  reasoning: string[];
  riskChange: 'increase' | 'decrease' | 'stable';
}

export interface PortfolioHealth {
  score: number; // 0-100
  totalDrift: number;
  topRisk: string;
  status: 'optimized' | 'drifting' | 'critical';
}

/**
 * Capital Rebalancing Engine v2
 * Continuous portfolio optimization based on live drift detection.
 */
export const capitalRebalancer = {
  /**
   * Performs a full portfolio rebalance analysis.
   */
  async analyze(totalCapital: number): Promise<{ 
    recommendations: RebalanceRecommendation[],
    health: PortfolioHealth 
  }> {
    const drafts = await procurementStore.getAllDrafts();
    const activeDrafts = drafts.filter(d => d.status === 'draft');
    
    // 1. Get live metrics (using the learning engine)
    const metrics = await capitalAllocationEngine.computeSupplierMetrics(activeDrafts);
    
    // 2. Get current target allocation
    const targetAllocations = capitalAllocationEngine.allocate(totalCapital, metrics);
    
    // 3. Compare with current draft totals (current allocation)
    const recommendations: RebalanceRecommendation[] = targetAllocations.map(target => {
      const draft = activeDrafts.find(d => d.supplier_id === target.supplierId);
      const currentAllocation = draft?.total_cost || 0;
      const adjustmentDelta = target.recommendedSpend - currentAllocation;
      
      const reasoning: string[] = [];
      if (Math.abs(adjustmentDelta) > totalCapital * 0.05) {
        reasoning.push(adjustmentDelta > 0 
          ? `Capital injection recommended due to high ${ (target.expectedROI * 100).toFixed(1) }% ROI` 
          : `Exposure reduction recommended to mitigate drift`);
      }
      
      // Check for performance vs prediction drift
      const metricsForSupplier = metrics.find(m => m.supplierId === target.supplierId);
      if (metricsForSupplier && metricsForSupplier.accuracyScore < 0.8) {
        reasoning.push(`Accuracy penalty: Prediction deviation of ${ ((1 - metricsForSupplier.accuracyScore) * 100).toFixed(1) }% detected`);
      }

      return {
        supplierId: target.supplierId,
        supplierName: target.supplierName,
        currentAllocation,
        recommendedAllocation: target.recommendedSpend,
        adjustmentDelta,
        reasoning,
        riskChange: (metricsForSupplier?.riskScore || 0) > 0.5 ? 'increase' : 'stable'
      };
    });

    // 4. Calculate Portfolio Health
    const totalDrift = recommendations.reduce((sum, r) => sum + Math.abs(r.adjustmentDelta), 0);
    const driftPercentage = totalDrift / (totalCapital || 1);
    const healthScore = Math.max(0, 100 - (driftPercentage * 100));
    
    const health: PortfolioHealth = {
      score: healthScore,
      totalDrift,
      topRisk: recommendations.sort((a, b) => b.recommendedAllocation - a.recommendedAllocation)[0]?.supplierName || 'None',
      status: healthScore > 85 ? 'optimized' : healthScore > 60 ? 'drifting' : 'critical'
    };

    return { recommendations, health };
  }
};
