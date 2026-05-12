import { DraftPO } from '@/schemas/procurement.schema';

/**
 * Service for exporting Draft POs into standardized formats.
 */
export const exportService = {
  /**
   * Generates a CSV string from a Draft PO.
   */
  generateCSV(draft: DraftPO): string {
    const headers = [
      'Supplier Name',
      'Product Title',
      'ASIN',
      'Quantity',
      'Unit Cost',
      'Total Cost',
      'Estimated Margin',
      'ROI %',
      'Confidence Score'
    ];

    const rows = draft.items.map(item => [
      draft.supplier_name,
      `"${(item.title || 'Unknown').replace(/"/g, '""')}"`,
      item.asin,
      item.quantity,
      item.supplier_price.toFixed(2),
      (item.supplier_price * item.quantity).toFixed(2),
      (item.projected_margin * item.quantity).toFixed(2),
      ((item.projected_margin / (item.supplier_price || 1)) * 100).toFixed(1) + '%',
      (item.confidence_score * 100).toFixed(0) + '%'
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  },

  /**
   * Triggers a browser download of the CSV file.
   */
  downloadCSV(draft: DraftPO) {
    const csvContent = this.generateCSV(draft);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `PO_${draft.supplier_name.replace(/\s+/g, '_')}_${timestamp}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
