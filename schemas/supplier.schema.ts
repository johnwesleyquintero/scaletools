import { z } from 'zod';

export const SupplierStatusSchema = z.enum([
  'NEW',
  'CONTACTED',
  'RESPONDED',
  'NEGOTIATING',
  'ACTIVE',
  'REJECTED',
]);

export const SupplierTypeSchema = z.enum([
  'Distributor',
  'Brand',
  'Wholesaler',
]);

export const SupplierSchema = z.object({
  supplier_id: z.string(), // Changed to string to support custom deterministic IDs
  name: z.string().min(1, 'Name is required'),
  type: SupplierTypeSchema.default('Wholesaler'),
  website_domain: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  market: z.string().optional(),
  status: SupplierStatusSchema.default('NEW'),
  account_url: z.string().url().optional().or(z.literal('')),
  
  // Audit Trail Fields
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  last_synced_at: z.string().datetime().optional(),
  last_status_change_at: z.string().datetime().optional(),
});

export type Supplier = z.infer<typeof SupplierSchema>;
export type SupplierStatus = z.infer<typeof SupplierStatusSchema>;
export type SupplierType = z.infer<typeof SupplierTypeSchema>;
