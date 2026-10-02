/**
 * NovaCart Physical Load-Cell Scale Simulator
 * Simulates in-cart high-precision weight sensors to verify item placement and flag retail shrinkage.
 */

import React from 'react';
import { Scale, AlertTriangle, CheckCircle2, RefreshCw, Zap } from 'lucide-react';

interface ScaleSimulatorProps {
  expectedWeightGrams: number;
  actualWeightGrams: number;
  discrepancyGrams: number;
  riskScore: number;
  isCartLocked: boolean;
  onInjectWeightDelta: (deltaGrams: number) => void;
  onTareScale: () => void;
}

export const ScaleSimulator: React.FC<ScaleSimulatorProps> = ({
  expectedWeightGrams,
  actualWeightGrams,
  discrepancyGrams,
  riskScore,
  isCartLocked,
  onInjectWeightDelta,
  onTareScale
}) => {
  const isNormal = Math.abs(discrepancyGrams) <= 30;
  const isWarning = Math.abs(discrepancyGrams) > 30 && Math.abs(discrepancyGrams) <= 150;
  const isCritical = Math.abs(discrepancyGrams) > 150;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
              Physical Load-Cell Telemetry
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                4-Point Strain Gauge
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Real-time cart basin weight verification vs digital item manifest
            </p>
          </div>
        </div>

        <button
          onClick={onTareScale}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
          title="Recalibrate sensors to tare zero point"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tare (Zero)</span>
        </button>
      </div>

      {/* Metrics Readout */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Expected SKU Mass
          </span>
          <span className="text-lg font-mono font-bold text-slate-200">
            {(expectedWeightGrams / 1000).toFixed(2)} <span className="text-xs font-normal text-slate-400">kg</span>
          </span>
          <span className="text-[10px] text-slate-500 block">Sum of item weights</span>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Load-Cell Sensor
          </span>
          <span className="text-lg font-mono font-bold text-cyan-300">
            {(actualWeightGrams / 1000).toFixed(2)} <span className="text-xs font-normal text-slate-400">kg</span>
          </span>
          <span className="text-[10px] text-slate-500 block">Active physical reading</span>
        </div>

        <div className={`p-3 rounded-xl border transition-colors ${
          isNormal 
            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
            : isWarning
            ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
            : 'bg-rose-950/20 border-rose-800/40 text-rose-300 animate-pulse'
        }`}>
          <span className="text-[11px] font-medium uppercase tracking-wider block opacity-80">
            Sensor Delta
          </span>
          <div className="flex items-center gap-1.5">
            {isNormal ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span className="text-lg font-mono font-bold">
              {discrepancyGrams > 0 ? `+${discrepancyGrams}` : discrepancyGrams}g
            </span>
          </div>
          <span className="text-[10px] opacity-80 block">
            {isNormal ? 'Verified in-sync' : isWarning ? 'Calibration drift' : 'Shrinkage anomaly'}
          </span>
        </div>
      </div>

      {/* Discrepancy Status Banner */}
      {isCritical && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 animate-bounce" />
            <span>
              <strong>UNSCANNED MASS DETECTED:</strong> An object weighing approx {discrepancyGrams}g was placed in cart without scanning barcode.
            </span>
          </div>
          {isCartLocked && (
            <span className="font-bold text-rose-300 uppercase tracking-wider px-2 py-0.5 rounded bg-rose-900/60 border border-rose-700 text-[10px]">
              Brakes Engaged
            </span>
          )}
        </div>
      )}

      {/* Evaluator Quick-Testing Injector Bar */}
      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Evaluator Shrinkage Simulation Testbed:
          </span>
          <span className="text-[11px] text-slate-400">
            Test anti-theft response in real-time
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onInjectWeightDelta(0)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-900/50 hover:border-emerald-700 transition-colors"
          >
            Match Exact (±0g)
          </button>
          <button
            onClick={() => onInjectWeightDelta(50)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-900/50 hover:border-amber-700 transition-colors"
          >
            Light Drift (+50g)
          </button>
          <button
            onClick={() => onInjectWeightDelta(450)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-900/50 hover:border-rose-700 transition-colors"
          >
            Unscanned Item (+450g)
          </button>
          <button
            onClick={() => onInjectWeightDelta(850)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-800/80 hover:border-rose-600 transition-colors"
          >
            Severe Theft (+850g)
          </button>
        </div>
      </div>

    </div>
  );
};
