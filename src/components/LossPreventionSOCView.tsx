/**
 * NovaCart Loss Prevention Security Operations Center (SOC)
 * Real-time fleet telemetry, remote brake lock/unlock controls, shrinkage anomaly triage,
 * and immutable audit log stream with JSON export.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  UserCheck, 
  AlertTriangle, 
  Battery, 
  Download, 
  FileText, 
  Trash2,
  Filter,
  CheckCircle,
  Eye,
  Radio
} from 'lucide-react';
import { AuditLogEntry, CartFleetUnit } from '../types';
import { FLEET_SIMULATED_CARTS } from '../services/storeData';
import { auditLogger } from '../services/auditLogger';
import { generateShrinkageIncidentSummary } from '../services/geminiService';

interface LossPreventionSOCViewProps {
  isCart101Locked: boolean;
  onToggleCart101Lock: () => void;
}

export const LossPreventionSOCView: React.FC<LossPreventionSOCViewProps> = ({
  isCart101Locked,
  onToggleCart101Lock
}) => {
  const [fleet, setFleet] = useState<CartFleetUnit[]>(FLEET_SIMULATED_CARTS);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [selectedIncidentSummary, setSelectedIncidentSummary] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auditLogger.subscribe(setLogs);
    return () => unsubscribe();
  }, []);

  const handleToggleLock = (cartId: string) => {
    if (cartId === 'CART-101') {
      onToggleCart101Lock();
      auditLogger.log({
        actor: 'LP_OFFICER_SARAH',
        role: 'loss_prevention',
        action: isCart101Locked ? 'REMOTE_CART_UNLOCK' : 'REMOTE_CART_LOCK_ENGAGED',
        details: `Manual brake toggle executed for ${cartId}`,
        severity: isCart101Locked ? 'info' : 'warning',
        cartId
      });
      return;
    }

    setFleet(prev => prev.map(c => {
      if (c.cartId === cartId) {
        const nextStatus = c.status === 'locked' ? 'active' : 'locked';
        auditLogger.log({
          actor: 'LP_OFFICER_SARAH',
          role: 'loss_prevention',
          action: nextStatus === 'locked' ? 'REMOTE_CART_LOCK_ENGAGED' : 'REMOTE_CART_UNLOCK',
          details: `Manual wheel brake command sent to ${cartId}`,
          severity: nextStatus === 'locked' ? 'security_alert' : 'info',
          cartId
        });
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleDispatchAssociate = (cartId: string, aisle: string) => {
    auditLogger.log({
      actor: 'LP_DISPATCH',
      role: 'loss_prevention',
      action: 'SECURITY_STAFF_DISPATCHED',
      details: `Floor associate dispatched to ${aisle} for physical cart inspection (${cartId})`,
      severity: 'warning',
      cartId
    });
    alert(`Floor Associate dispatched to ${aisle} to assist with Cart ${cartId}.`);
  };

  const handleExportLogs = () => {
    const jsonStr = auditLogger.exportAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `novacart_audit_log_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = useMemo(() => {
    if (filterSeverity === 'all') return logs;
    return logs.filter(log => log.severity === filterSeverity);
  }, [logs, filterSeverity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-rose-950/30 p-5 rounded-2xl border border-rose-800/40">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
                <span>Loss Prevention & Security Operations Center</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-900/60 text-rose-300 border border-rose-700/50 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-ping text-rose-400" />
                  Live Fleet Radar
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Real-time load-cell telemetry, remote wheel brake interlocks, and automated shrinkage detection
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportLogs}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors focus:ring-2 focus:ring-rose-500"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Audit Compliance Log (JSON)</span>
        </button>
      </div>

      {/* Fleet Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span>Active Smart Cart Fleet (4 Units Monitored)</span>
          <span className="text-xs text-slate-500 font-mono">Telemetry Refresh: 1000ms</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fleet.map(unit => {
            const isCart101 = unit.cartId === 'CART-101';
            const isLocked = isCart101 ? isCart101Locked : unit.status === 'locked';

            return (
              <div
                key={unit.cartId}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isLocked 
                    ? 'bg-rose-950/20 border-rose-700/60 shadow-lg shadow-rose-950/40'
                    : unit.riskScore > 70
                    ? 'bg-amber-950/20 border-amber-700/60'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <span>{unit.cartId}</span>
                      {isCart101 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          Active User
                        </span>
                      )}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isLocked
                        ? 'bg-rose-900/80 text-rose-200 border border-rose-600'
                        : unit.riskScore > 70
                        ? 'bg-amber-900/80 text-amber-200 border border-amber-600'
                        : 'bg-emerald-900/80 text-emerald-200 border border-emerald-600'
                    }`}>
                      {isLocked ? 'LOCKED' : unit.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 mb-3">
                    <div className="flex justify-between">
                      <span>Shopper:</span>
                      <span className="text-slate-200 font-medium">{unit.assignedShopper}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="text-cyan-300 font-mono">{unit.currentAisle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Basket Value:</span>
                      <span className="text-slate-200 font-mono">${unit.totalValue.toFixed(2)} ({unit.itemCount} items)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weight Delta:</span>
                      <span className={`font-mono font-bold ${unit.weightVarianceGrams > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {unit.weightVarianceGrams > 0 ? `+${unit.weightVarianceGrams}g` : `${unit.weightVarianceGrams}g`}
                      </span>
                    </div>
                  </div>

                  {/* Shrinkage Risk Score Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Shrinkage Risk:</span>
                      <span className={`font-bold font-mono ${
                        unit.riskScore > 70 ? 'text-rose-400' : unit.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {unit.riskScore}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                      <div 
                        className={`h-full ${
                          unit.riskScore > 70 ? 'bg-rose-500' : unit.riskScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${unit.riskScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Active Anomalies */}
                  {unit.activeAnomalies.length > 0 && (
                    <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-900/60 mb-3 text-[10px] text-rose-300 space-y-1">
                      {unit.activeAnomalies.map((ano, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-400 flex-shrink-0 mt-0.5" />
                          <span>{ano}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Staff Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleToggleLock(unit.cartId)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                      isLocked
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-rose-600 hover:bg-rose-500 text-white'
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <Unlock className="w-3 h-3" />
                        <span>Unlock</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Lock Brake</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDispatchAssociate(unit.cartId, unit.currentAisle)}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    Dispatch Staff
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Audit Log Stream */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">
              Tamper-Evident Security & Audit Log Stream
            </h3>
          </div>

          {/* Filter options */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Severities ({logs.length})</option>
              <option value="info">Info</option>
              <option value="warning">Warnings</option>
              <option value="security_alert">Security Alerts</option>
            </select>
          </div>
        </div>

        {/* Logs Table / List */}
        <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs pr-1">
          {filteredLogs.map(entry => (
            <div
              key={entry.id}
              className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                entry.severity === 'security_alert'
                  ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                  : entry.severity === 'warning'
                  ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  entry.severity === 'security_alert' ? 'bg-rose-400 animate-ping' : entry.severity === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span className="font-bold text-slate-200 whitespace-nowrap">
                  [{entry.action}]
                </span>
                <span className="text-slate-400 truncate">
                  {entry.details}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-shrink-0">
                <span>By: {entry.actor}</span>
                {entry.cartId && <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">{entry.cartId}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
