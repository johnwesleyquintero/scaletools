import { Supplier } from '../types/supplier';
import { normalizeStatus } from './supplierStateMachine';
import { generateStableId } from './supplierDeduplicator';

/**
 * Extracts a clean domain from a URL or raw string.
 */
export function extractDomain(url: string | undefined): string | undefined {
  if (!url) return undefined;
  
  try {
    let cleanUrl = url.trim().toLowerCase();
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = 'http://' + cleanUrl;
    }
    const urlObj = new URL(cleanUrl);
    let domain = urlObj.hostname;
    // Remove www.
    domain = domain.startsWith('www.') ? domain.slice(4) : domain;
    return domain;
  } catch (e) {
    // If URL parsing fails, just return the trimmed string or undefined
    const trimmed = url.trim().toLowerCase();
    return trimmed || undefined;
  }
}

/**
 * Transforms raw row data from Google Sheets into a normalized Supplier object.
 */
export function normalizeSupplier(rawRow: any): Supplier {
  const name = rawRow.Name || rawRow.Supplier || 'Unknown Supplier';
  const website = rawRow.Website || '';
  const domain = extractDomain(website);
  
  return {
    supplier_id: generateStableId(name, domain),
    name: name,
    type: 'Wholesaler', // Default type for now
    website_domain: domain,
    email: rawRow.Email || '',
    phone: rawRow['Phone Number'] || '',
    market: rawRow.Market || '',
    status: normalizeStatus(rawRow.Status || ''),
    account_url: rawRow['Account URL'] || '',
  };
}
