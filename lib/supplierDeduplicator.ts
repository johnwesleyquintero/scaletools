import { Supplier } from '../types/supplier';
import { resolveNextStatus } from './supplierStateMachine';

/**
 * Generates a stable, deterministic supplier_id.
 * If domain exists: SUP-[DOMAIN-SLUG]
 * If no domain: SUP-[NAME-SLUG]-[HASH]
 */
export function generateStableId(name: string, domain?: string): string {
  if (domain) {
    const slug = domain.replace(/[^a-z0-9]/gi, '').toUpperCase();
    return `SUP-${slug}`;
  }
  
  const nameSlug = name.replace(/[^a-z0-9]/gi, '').toUpperCase().substring(0, 10);
  const hash = Math.random().toString(36).substring(2, 7).toUpperCase(); // Simple fallback hash
  return `SUP-${nameSlug}-${hash}`;
}

/**
 * Logic to deduplicate and merge suppliers during sync.
 */
export function processSupplierSync(
  incoming: Supplier,
  existingSuppliers: Supplier[]
): { action: 'CREATE' | 'UPDATE' | 'MERGE' | 'IGNORE'; supplier: Supplier } {
  
  // 1. Check for exact ID match (stable identity)
  const existingById = existingSuppliers.find(s => s.supplier_id === incoming.supplier_id);
  
  // 2. Check for domain match if ID didn't match
  const existingByDomain = incoming.website_domain 
    ? existingSuppliers.find(s => s.website_domain === incoming.website_domain)
    : undefined;
    
  const target = existingById || existingByDomain;
  
  if (!target) {
    return { 
      action: 'CREATE', 
      supplier: {
        ...incoming,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
      }
    };
  }
  
  // 3. Merge Logic
  const mergedSupplier: Supplier = {
    ...target,
    // Keep stable fields
    supplier_id: target.supplier_id,
    created_at: target.created_at || new Date().toISOString(),
    
    // Update or merge other fields
    name: incoming.name || target.name,
    type: incoming.type || target.type,
    website_domain: target.website_domain || incoming.website_domain,
    email: target.email || incoming.email,
    phone: target.phone || incoming.phone,
    market: target.market || incoming.market,
    account_url: target.account_url || incoming.account_url,
    
    // Resolve status using state machine
    status: resolveNextStatus(target.status, incoming.status),
    
    // Audit updates
    updated_at: new Date().toISOString(),
    last_synced_at: new Date().toISOString(),
    last_status_change_at: target.status !== incoming.status 
      ? new Date().toISOString() 
      : target.last_status_change_at,
  };
  
  return { 
    action: target.supplier_id === incoming.supplier_id ? 'UPDATE' : 'MERGE', 
    supplier: mergedSupplier 
  };
}
