import { getSheetData } from '../lib/googleSheetsClient';
import { normalizeSupplier } from '../lib/supplierNormalizer';
import { processSupplierSync } from '../lib/supplierDeduplicator';
import { supplierService } from './supplierService';
import { supplierLogger } from '../logs/supplierEvents';
import { Supplier } from '../types/supplier';

export interface SyncSummary {
  created: number;
  updated: number;
  merged: number;
  ignored: number;
  total: number;
}

/**
 * Service to synchronize supplier data from Google Sheets with deduplication.
 */
export const syncService = {
  /**
   * Syncs suppliers from a specified sheet.
   */
  async syncSuppliersFromSheets(spreadsheetId: string, range: string): Promise<SyncSummary> {
    try {
      console.log(`Syncing suppliers from sheet: ${spreadsheetId}, range: ${range}`);
      
      const rawRows = await getSheetData(spreadsheetId, range);
      const existingSuppliers = await supplierService.getAllSuppliers();
      
      const summary: SyncSummary = {
        created: 0,
        updated: 0,
        merged: 0,
        ignored: 0,
        total: rawRows.length
      };

      const updatedSuppliers = [...existingSuppliers];

      for (const row of rawRows) {
        const normalized = normalizeSupplier(row);
        const { action, supplier } = processSupplierSync(normalized, updatedSuppliers);

        if (action === 'CREATE') {
          updatedSuppliers.push(supplier);
          summary.created++;
          await supplierLogger.logEvent({
            type: 'CREATED',
            supplier_id: supplier.supplier_id,
            name: supplier.name,
            details: `Created via sync from sheet ${spreadsheetId}`
          });
        } else if (action === 'UPDATE' || action === 'MERGE') {
          const index = updatedSuppliers.findIndex(s => s.supplier_id === supplier.supplier_id);
          const oldStatus = updatedSuppliers[index].status;
          updatedSuppliers[index] = supplier;
          
          if (action === 'UPDATE') {
            summary.updated++;
          } else {
            summary.merged++;
          }

          await supplierLogger.logEvent({
            type: action === 'UPDATE' ? 'UPDATED' : 'MERGED',
            supplier_id: supplier.supplier_id,
            name: supplier.name,
            details: `Updated/Merged via sync. Status: ${oldStatus} -> ${supplier.status}`
          });
        } else {
          summary.ignored++;
        }
      }

      await supplierService.saveSuppliers(updatedSuppliers);
      
      console.log(`Sync complete: ${JSON.stringify(summary)}`);
      return summary;
    } catch (error) {
      console.error('Failed to sync suppliers from sheets:', error);
      throw error;
    }
  }
};
