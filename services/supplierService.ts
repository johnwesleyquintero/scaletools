import fs from 'fs/promises';
import path from 'path';
import { Supplier } from '../types/supplier';

const DATA_PATH = path.join(process.cwd(), 'data', 'suppliers.json');

/**
 * Service for managing supplier data with a local JSON store.
 */
export const supplierService = {
  /**
   * Initializes the data file if it doesn't exist.
   */
  async init() {
    try {
      await fs.access(DATA_PATH);
    } catch {
      await fs.writeFile(DATA_PATH, JSON.stringify([], null, 2));
    }
  },

  /**
   * Fetches all suppliers from the JSON store.
   */
  async getAllSuppliers(): Promise<Supplier[]> {
    await this.init();
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  },

  /**
   * Fetches a single supplier by ID.
   */
  async getSupplierById(id: string): Promise<Supplier | undefined> {
    const suppliers = await this.getAllSuppliers();
    return suppliers.find(s => s.supplier_id === id);
  },

  /**
   * Saves or updates a list of suppliers.
   */
  async saveSuppliers(suppliers: Supplier[]): Promise<void> {
    await fs.writeFile(DATA_PATH, JSON.stringify(suppliers, null, 2));
  },

  /**
   * Upserts a single supplier.
   */
  async upsertSupplier(supplier: Supplier): Promise<void> {
    const suppliers = await this.getAllSuppliers();
    const index = suppliers.findIndex(s => s.supplier_id === supplier.supplier_id);
    
    if (index >= 0) {
      suppliers[index] = supplier;
    } else {
      suppliers.push(supplier);
    }
    
    await this.saveSuppliers(suppliers);
  }
};
