import Papa from 'papaparse';

export interface KeepaProduct {
  asin: string;
  title: string;
  image: string[];
  sales_rank: {
    current: number;
    avg_90d: number;
    drops_90d: number;
  };
  buy_box: {
    price: number;
    avg_90d: number;
    seller: string;
    is_amazon: boolean;
    stock_status: string;
  };
  pricing: {
    amazon: number;
    new_fba: number;
    used: number;
  };
  demand: {
    monthly_sales: number;
    trend_90d: number;
  };
  fees: {
    fba_fee: number;
    referral_fee_percent: number;
  };
  metadata: {
    brand: string;
    category: string;
    manufacturer: string;
    upc: string;
  };
}

/**
 * Robust CSV parser for Keepa export files.
 */
export async function parseKeepaCSV(csvContent: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => resolve(results.data),
      error: (error: any) => reject(error),
    });
  });
}
