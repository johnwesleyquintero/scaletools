import { supplierService } from './supplierService';
import { keepaHistoryStore } from '../lib/keepa/keepaHistoryStore';

export interface SearchResult {
  id: string;
  type: 'supplier' | 'product';
  title: string;
  subtitle: string;
  url: string;
}

/**
 * Global search service for the ScaleTools cockpit.
 */
export const searchService = {
  async globalSearch(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // 1. Search Suppliers
    const suppliers = await supplierService.getAllSuppliers();
    suppliers.forEach(s => {
      if (s.name.toLowerCase().includes(lowerQuery) || (s.website_domain && s.website_domain.toLowerCase().includes(lowerQuery))) {
        results.push({
          id: s.supplier_id,
          type: 'supplier',
          title: s.name,
          subtitle: `Supplier • ${s.status}`,
          url: `/dashboard?id=${s.supplier_id}`
        });
      }
    });

    // 2. Search Keepa History / Products
    const history = await keepaHistoryStore.getHistory();
    Object.values(history).forEach(h => {
      const latest = h.snapshots[h.snapshots.length - 1].product;
      if (h.asin.toLowerCase().includes(lowerQuery) || latest.title.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: h.asin,
          type: 'product',
          title: h.asin,
          subtitle: `Product • ${latest.title.substring(0, 40)}...`,
          url: `/products?asin=${h.asin}`
        });
      }
    });

    return results.slice(0, 10);
  }
};
