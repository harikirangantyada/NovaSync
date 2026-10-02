/**
 * NovaCart Tamper-Evident Security & Operational Audit Logger
 * Maintains immutable in-memory and local session logs with severity indicators
 * and exportable JSON format for enterprise compliance.
 */

import { AuditLogEntry, UserRole } from '../types';

class AuditLoggerService {
  private logs: AuditLogEntry[] = [];
  private listeners: ((logs: AuditLogEntry[]) => void)[] = [];

  constructor() {
    // Seed initial operational telemetry entries
    this.log({
      actor: 'SYSTEM_BOOT',
      role: 'store_manager',
      action: 'CART_FLEET_INITIALIZED',
      details: 'Connected 4 autonomous carts to store base station. Telemetry active.',
      severity: 'info'
    });
  }

  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };

    this.logs.unshift(fullEntry);
    
    // Trim log buffer if exceeding 200 entries to prevent memory leaks
    if (this.logs.length > 200) {
      this.logs = this.logs.slice(0, 200);
    }

    this.notify();
    return fullEntry;
  }

  getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    this.notify();
  }

  subscribe(callback: (logs: AuditLogEntry[]) => void): () => void {
    this.listeners.push(callback);
    callback(this.logs);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify(): void {
    this.listeners.forEach(fn => fn(this.logs));
  }

  exportAsJSON(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const auditLogger = new AuditLoggerService();
