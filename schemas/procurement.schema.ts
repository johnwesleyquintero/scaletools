import { z } from 'zod';

export const POItemSchema = z.object({
  asin: z.string(),
  title: z.string().optional(),
  supplier_price: z.number(),
  amazon_price: z.number(),
  quantity: z.number().min(1),
  projected_margin: z.number(),
  confidence_score: z.number().min(0).max(1),
});

export const DraftPOSchema = z.object({
  id: z.string(),
  status: z.enum(['draft', 'review', 'approved']),
  supplier_id: z.string(),
  supplier_name: z.string(),
  items: z.array(POItemSchema),
  total_cost: z.number(),
  projected_profit: z.number(),
  created_at: z.number(),
});

export type POItem = z.infer<typeof POItemSchema>;
export type DraftPO = z.infer<typeof DraftPOSchema>;
