import { z } from 'zod';

export const OutcomeStatusSchema = z.enum([
  'ordered',
  'received',
  'sold',
  'cancelled'
]);

export const PurchaseOutcomeSchema = z.object({
  id: z.string(), // Outcome ID
  po_id: z.string(),
  supplier_id: z.string(),
  supplier_name: z.string(),
  asin: z.string(),
  title: z.string().optional(),
  
  // Predictions (captured at time of order)
  predicted_cost: z.number(),
  predicted_margin: z.number(),
  predicted_roi: z.number(),
  confidence_at_order: z.number(),
  
  // Realities (updated as lifecycle progresses)
  actual_cost: z.number().optional(),
  actual_revenue: z.number().optional(),
  actual_margin: z.number().optional(),
  actual_roi: z.number().optional(),
  
  status: OutcomeStatusSchema,
  created_at: z.number(),
  updated_at: z.number(),
});

export type PurchaseOutcome = z.infer<typeof PurchaseOutcomeSchema>;
export type OutcomeStatus = z.infer<typeof OutcomeStatusSchema>;

export const OutcomeMetricsSchema = z.object({
  supplier_id: z.string(),
  accuracy_score: z.number(), // 0-1
  avg_margin_deviation: z.number(),
  total_orders: z.number(),
  successful_orders: z.number(),
});

export type OutcomeMetrics = z.infer<typeof OutcomeMetricsSchema>;
