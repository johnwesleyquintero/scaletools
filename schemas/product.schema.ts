import { z } from 'zod';

export const ProductSchema = z.object({
  asin: z.string().length(10, 'ASIN must be exactly 10 characters'),
  title: z.string().min(1, 'Title is required'),
  category: z.string().optional(),
  amazon_price: z.number().positive(),
  estimated_fees: z.number().nonnegative().optional(),
});

export const MatchResultSchema = z.object({
  product_asin: z.string(),
  matched_suppliers: z.array(z.object({
    supplier_id: z.string(),
    supplier_name: z.string(),
    match_confidence: z.number().min(0).max(1),
    estimated_cost: z.number(),
    amazon_price: z.number(),
    estimated_margin: z.number(),
    roi: z.number(),
    
    // Phase 4 Fields
    profit_score: z.number().min(0).max(1),
    market_score: z.number().min(0).max(1),
    final_score: z.number().min(0).max(1),
    risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  })),
});

export type Product = z.infer<typeof ProductSchema>;
export type MatchResult = z.infer<typeof MatchResultSchema>;
export type SupplierMatch = MatchResult['matched_suppliers'][0];
