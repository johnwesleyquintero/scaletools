import fs from 'fs/promises';
import path from 'path';

const LOG_PATH = path.join(process.cwd(), 'logs', 'supplier_events.log');

export type SupplierEventType = 'CREATED' | 'UPDATED' | 'MERGED' | 'STATUS_CHANGE';

export interface SupplierEvent {
  timestamp: string;
  type: SupplierEventType;
  supplier_id: string;
  name: string;
  details: string;
}

/**
 * Lightweight logger for supplier events to maintain an audit trail.
 */
export const supplierLogger = {
  /**
   * Logs an event to the log file.
   */
  async logEvent(event: Omit<SupplierEvent, 'timestamp'>) {
    const fullEvent: SupplierEvent = {
      timestamp: new Date().toISOString(),
      ...event,
    };
    
    const logLine = `${fullEvent.timestamp} [${fullEvent.type}] ${fullEvent.supplier_id} (${fullEvent.name}): ${fullEvent.details}\n`;
    
    try {
      await fs.appendFile(LOG_PATH, logLine);
    } catch (error) {
      console.error('Failed to write to supplier event log:', error);
    }
  }
};
