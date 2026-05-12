import { supplierService } from './supplierService';
import { marketService } from './marketService';
import { keepaHistoryStore } from '../lib/keepa/keepaHistoryStore';
import { computeASINIntelligence } from '../lib/keepa/asinIntelligenceEngine';
import { matchProductToSuppliers } from '../lib/productMatcher';
import { Product, MatchResult } from '../schemas/product.schema';

/**
 * Mock product data for development.
 */
const MOCK_PRODUCTS: Record<string, Partial<Product>> = {
  'B00ABC123': {
    asin: 'B00ABC123',
    title: 'Professional Grade Wholesale Widgets - Pack of 10',
    category: 'Industrial',
    amazon_price: 129.99,
  },
  'B00XYZ789': {
    asin: 'B00XYZ789',
    title: 'Evergreen Premium Garden Tools Set',
    category: 'Garden',
    amazon_price: 45.50,
  },
  'B00123456': {
    asin: 'B00123456',
    title: 'Global Brands Electronics Charger Hub',
    category: 'Electronics',
    amazon_price: 89.00,
  }
};

export const productService = {
  /**
   * Analyzes a product and finds matching supplier opportunities with temporal intelligence.
   */
  async analyzeProduct(asin: string, title?: string): Promise<MatchResult> {
    const suppliers = await supplierService.getAllSuppliers();
    const marketIntel = await marketService.getMarketIntelligence(asin);
    
    // Fetch historical intelligence if available
    const history = await keepaHistoryStore.getASINHistory(asin);
    const intelligence = history ? computeASINIntelligence(history) : undefined;
    
    // Simulate fetching product data
    const baseProduct = MOCK_PRODUCTS[asin] || {
      asin,
      title: title || 'Unknown Product',
      amazon_price: 100.00,
    };
    
    const product: Product = {
      asin: baseProduct.asin!,
      title: baseProduct.title!,
      category: baseProduct.category || 'General',
      amazon_price: baseProduct.amazon_price!,
    };

    const matchedSuppliers = matchProductToSuppliers(
      product, 
      suppliers, 
      marketIntel.final_market_score,
      marketIntel.risk_level,
      intelligence
    );

    return {
      product_asin: asin,
      matched_suppliers: matchedSuppliers,
    };
  }
};
