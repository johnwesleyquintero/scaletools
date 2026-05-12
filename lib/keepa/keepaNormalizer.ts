import { KeepaProduct } from './keepaParser';

/**
 * Normalizes a raw Keepa CSV row into a structured KeepaProduct object.
 * Maps messy spreadsheet headers to internal clean types.
 */
export function normalizeKeepaRow(row: any): KeepaProduct {
  const cleanNum = (val: any) => {
    if (val === null || val === undefined || val === ' - ' || val === '') return 0;
    const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]/g, '')) : val;
    return isNaN(num) ? 0 : num;
  };

  const cleanStr = (val: any) => {
    if (val === null || val === undefined || val === ' - ') return '';
    return String(val).trim();
  };

  const images = cleanStr(row['Images'] || row['Image URLs']).split(';').filter(Boolean);

  return {
    asin: cleanStr(row['ASIN']),
    title: cleanStr(row['Title'] || row['Product Title']),
    image: images,
    sales_rank: {
      current: cleanNum(row['Sales Rank: Current'] || row['Sales Rank']),
      avg_90d: cleanNum(row['Sales Rank: 90 days avg.']),
      drops_90d: cleanNum(row['Sales Rank: Drops (last 90 days)']),
    },
    buy_box: {
      price: cleanNum(row['Buy Box: Current'] || row['Buy Box Price']),
      avg_90d: cleanNum(row['Buy Box: 90 days avg.']),
      seller: cleanStr(row['Buy Box: Seller']),
      is_amazon: cleanStr(row['Buy Box: Seller']).toLowerCase() === 'amazon',
      stock_status: cleanStr(row['Buy Box: Stock Status']),
    },
    pricing: {
      amazon: cleanNum(row['Amazon: Current']),
      new_fba: cleanNum(row['New: Current'] || row['New FBA: Current']),
      used: cleanNum(row['Used: Current']),
    },
    demand: {
      monthly_sales: cleanNum(row['Bought in past month'] || row['Sales: Monthly']),
      trend_90d: cleanNum(row['Sales Rank: Drops (last 90 days)']), // Proxy for trend
    },
    fees: {
      fba_fee: cleanNum(row['FBA Fees'] || row['Estimated FBA Fees']),
      referral_fee_percent: 0.15, // Default referral fee if not in export
    },
    metadata: {
      brand: cleanStr(row['Brand']),
      category: cleanStr(row['Root Category']),
      manufacturer: cleanStr(row['Manufacturer']),
      upc: cleanStr(row['UPC']),
    },
  };
}
