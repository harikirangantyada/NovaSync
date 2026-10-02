/**
 * NovaCart Verifiable Digital QR Receipt Modal
 * Generates an itemized verifiable receipt with cryptographic transaction hash,
 * carbon impact score, loyalty rewards, and QR gate clearance code.
 */

import React from 'react';
import { 
  CheckCircle, 
  QrCode, 
  Download, 
  Printer, 
  Leaf, 
  Coins, 
  ShieldCheck, 
  X,
  ArrowRight
} from 'lucide-react';
import { SmartCartState } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartState: SmartCartState;
  onStartNewCart: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  cartState,
  onStartNewCart
}) => {
  if (!isOpen) return null;

  const transactionId = `TX-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const totalCarbonKg = Number(
    cartState.items.reduce((sum, item) => sum + (item.product.carbonScoreKg * item.quantity), 0).toFixed(2)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-modal-title"
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-emerald-950/40 to-slate-900 border-b border-slate-800 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/20">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 id="receipt-modal-title" className="text-xl font-black text-slate-100">
            Payment Verified & Gate Cleared
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Thank you for shopping with NovaCart Autonomous Retail!
          </p>
          <span className="text-[11px] font-mono text-cyan-400 mt-1">
            {transactionId}
          </span>
        </div>

        {/* Receipt Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Simulated QR Code for Store Turnstile / Exit Gate */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white text-slate-950 shadow-inner">
            {/* SVG QR Code Simulation */}
            <svg viewBox="0 0 100 100" className="w-28 h-28">
              <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
              <rect x="10" y="10" width="25" height="25" fill="#0f172a" />
              <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
              <rect x="18" y="18" width="9" height="9" fill="#0f172a" />

              <rect x="65" y="10" width="25" height="25" fill="#0f172a" />
              <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
              <rect x="73" y="18" width="9" height="9" fill="#0f172a" />

              <rect x="10" y="65" width="25" height="25" fill="#0f172a" />
              <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
              <rect x="18" y="73" width="9" height="9" fill="#0f172a" />

              <rect x="42" y="15" width="8" height="8" fill="#0f172a" />
              <rect x="42" y="32" width="16" height="8" fill="#0f172a" />
              <rect x="42" y="48" width="8" height="16" fill="#0f172a" />
              <rect x="60" y="48" width="16" height="8" fill="#0f172a" />
              <rect x="75" y="65" width="15" height="15" fill="#0f172a" />
              <rect x="50" y="75" width="12" height="12" fill="#0f172a" />
            </svg>
            <span className="font-mono text-[10px] text-slate-600 mt-2 font-bold tracking-wider uppercase">
              SCAN AT STORE EXIT TURNSTILE
            </span>
          </div>

          {/* Itemized summary */}
          <div className="border-t border-b border-slate-800 py-3 space-y-2">
            <span className="font-bold text-slate-300 block uppercase tracking-wider text-[10px]">
              Purchased Items:
            </span>
            {cartState.items.map(item => (
              <div key={item.product.id} className="flex justify-between items-center text-slate-300">
                <span className="truncate pr-2">
                  {item.quantity}x {item.product.name}
                </span>
                <span className="font-mono font-medium whitespace-nowrap">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Totals */}
          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span>${cartState.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Sales Tax:</span>
              <span>${cartState.taxAmount.toFixed(2)}</span>
            </div>
            {cartState.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Loyalty Discount:</span>
                <span>-${cartState.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-100 font-bold text-sm pt-1 border-t border-slate-800">
              <span>Total Paid:</span>
              <span className="text-cyan-300 font-black">${cartState.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Impact Stats */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <Leaf className="w-3.5 h-3.5" />
                Carbon Offset Footprint:
              </span>
              <span className="font-bold text-slate-200">{totalCarbonKg} kg CO₂e</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span className="flex items-center gap-1 text-amber-400">
                <Coins className="w-3.5 h-3.5" />
                Loyalty Reward Points:
              </span>
              <span className="font-bold text-amber-300">+{cartState.loyaltyPointsEarned} pts</span>
            </div>
          </div>

          {/* Cryptographic Proof */}
          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Cryptographic Hash:
            </span>
            <span>{cartState.cartChecksum.slice(0, 16)}...</span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors focus:ring-2 focus:ring-cyan-500"
            title="Print Receipt"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onStartNewCart();
              onClose();
            }}
            className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-cyan-600/30"
          >
            <span>Start Next Cart Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
