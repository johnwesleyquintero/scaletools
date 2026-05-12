import { SupplierStatus } from '../types/supplier';

const STATUS_PRIORITY: Record<SupplierStatus, number> = {
  REJECTED: 0,
  NEW: 1,
  CONTACTED: 2,
  RESPONDED: 3,
  NEGOTIATING: 4,
  ACTIVE: 5,
};

/**
 * Valid transitions for supplier status.
 * Status can move forward or stay the same.
 * Moving backward is generally restricted unless explicitly forced.
 */
const VALID_TRANSITIONS: Record<SupplierStatus, SupplierStatus[]> = {
  NEW: ['CONTACTED', 'REJECTED'],
  CONTACTED: ['RESPONDED', 'NEGOTIATING', 'REJECTED'],
  RESPONDED: ['NEGOTIATING', 'ACTIVE', 'REJECTED'],
  NEGOTIATING: ['ACTIVE', 'REJECTED'],
  ACTIVE: ['REJECTED'],
  REJECTED: ['NEW', 'CONTACTED'], // Allow retry from rejected
};

/**
 * Checks if a status transition is valid according to business rules.
 */
export function canTransition(current: SupplierStatus, next: SupplierStatus): boolean {
  if (current === next) return true;
  return VALID_TRANSITIONS[current]?.includes(next) || false;
}

/**
 * Returns the priority score of a status.
 * Higher score means a "more advanced" or "better" state.
 */
export function getStatusPriority(status: SupplierStatus): number {
  return STATUS_PRIORITY[status] ?? 0;
}

/**
 * Normalizes a raw status string into a valid SupplierStatus.
 */
export function normalizeStatus(input: string): SupplierStatus {
  const normalized = input.trim().toUpperCase();
  
  if (normalized === 'ACTIVE' || normalized === 'YES') return 'ACTIVE';
  if (normalized === 'NEGOTIATING') return 'NEGOTIATING';
  if (normalized === 'REPLIED' || normalized === 'RESPONDED') return 'RESPONDED';
  if (normalized === 'EMAILED' || normalized === 'CONTACTED') return 'CONTACTED';
  if (normalized === 'REJECTED' || normalized === 'NO') return 'REJECTED';
  
  return 'NEW';
}

/**
 * Ensures that an incoming status update doesn't downgrade an existing record
 * unless the priority rules allow it or it's forced.
 */
export function resolveNextStatus(current: SupplierStatus, incoming: SupplierStatus): SupplierStatus {
  const currentPriority = getStatusPriority(current);
  const incomingPriority = getStatusPriority(incoming);
  
  // Never overwrite ACTIVE with lower priority states during automated sync
  if (current === 'ACTIVE' && incoming !== 'ACTIVE') {
    return 'ACTIVE';
  }
  
  // If the incoming status has higher priority, take it
  if (incomingPriority > currentPriority) {
    return incoming;
  }
  
  return current;
}
