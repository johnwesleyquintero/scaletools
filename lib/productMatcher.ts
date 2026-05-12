import { Supplier } from '../types/supplier';
import { Product, SupplierMatch } from '../schemas/product.schema';
import { calculateProfit } from './profitCalculator';
import { ASINIntelligence } from './keepa/asinIntelligenceEngine';

/**
 * Matches a product to potential suppliers based on keywords, heuristics, and temporal intelligence.
 */
export function matchProductToSuppliers(
  product: Product,
  suppliers: Supplier[],
  marketScore?: number,
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM',
  intelligence?: ASINIntelligence
): SupplierMatch[] {
  const productKeywords = product.title.toLowerCase().split(/\s+/).filter(k => k.length > 3);
  const productCategory = product.category?.toLowerCase() || '';

  const matches = suppliers.map(supplier => {
    let keywordScore = 0;
    const supplierName = supplier.name.toLowerCase();
    
    // 1. Keyword Matching
    productKeywords.forEach(keyword => {
      if (supplierName.includes(keyword)) {
        keywordScore += 1;
      }
    });
    
    const normalizedKeywordScore = Math.min(keywordScore / Math.max(productKeywords.length, 1), 1);
    
    // 2. Category Heuristics
    let categoryScore = 0;
    if (productCategory && supplierName.includes(productCategory)) {
      categoryScore = 1;
    }
    
    // 3. Activity Score
    const activityScore = supplier.status === 'ACTIVE' ? 1 : 0.5;
    
    // 4. Base Confidence Score (0-1)
    let match_confidence = (normalizedKeywordScore * 0.6) + (categoryScore * 0.4);
    
    // 5. Apply Temporal Confidence Decay
    if (intelligence) {
      match_confidence = match_confidence * intelligence.confidence_score;
      // Penalize high volatility
      if (intelligence.volatility_score > 0.6) {
        match_confidence *= 0.8;
      }
    }
    
    // 6. Profit Score & Stats
    const estimatedCost = product.amazon_price * 0.6; 
    const profit = calculateProfit(product.amazon_price, estimatedCost, undefined, match_confidence);
    
    // 7. Final Opportunity Score
    const market_score = intelligence?.opportunity_score ?? marketScore ?? 0.5;
    const final_score = (profit.profit_score * 0.5) + (match_confidence * 0.2) + (market_score * 0.3);
    
    return {
      supplier_id: supplier.supplier_id,
      supplier_name: supplier.name,
      match_confidence: parseFloat(match_confidence.toFixed(2)),
      estimated_cost: estimatedCost,
      amazon_price: product.amazon_price,
      estimated_margin: profit.margin,
      roi: profit.roi,
      profit_score: profit.profit_score,
      market_score: market_score,
      final_score: parseFloat(final_score.toFixed(2)),
      risk_level: intelligence && intelligence.volatility_score > 0.5 ? 'HIGH' : riskLevel,
    };
  });

  return matches
    .filter(m => m.match_confidence > 0.1) // Lower threshold to account for decay
    .sort((a, b) => b.final_score - a.final_score);
}
