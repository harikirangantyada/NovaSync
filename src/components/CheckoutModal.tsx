/**
 * NovaCart Autonomous Frictionless Checkout Modal
 * Simulates frictionless cryptographic payment, final dual-sensor scale clearance,
 * and rate-limited tokenization.
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  X, 
  Fingerprint, 
  CheckCircle2, 
  AlertTriangle, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { SmartCartState } from '../types';
import { rateLimiter } from '../services/securityEngine';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartState: SmartCartState;
  onCompleteCheckout: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartState,
  onCompleteCheckout
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'biometric' | 'google_pay' | 'token_card'>('biometric');

  if (!isOpen) return null;

  const handlePay = () => {
    // 1. Rate limiter check (max 5 checkout attempts per minute per cart)
    const rateCheck = rateLimiter.check(`checkout_${cartState.cartId}`, 5, 60000);
    if (!rateCheck.allowed) {
      setErrorMessage('Security Rate Limit Exceeded: Please wait 60 seconds before retrying checkout.');
      return;
    }

    // 2. Shrinkage Check: Block checkout if cart is locked or has extreme weight mismatch
    if (cartState.status === 'locked' || Math.abs(cartState.weightDiscrepancyGrams) > 250) {
      setErrorMessage(`Shrinkage Pre-check Failed: Unexplained weight variance (+${cartState.weightDiscrepancyGrams}g) in basket. Loss Prevention clearance required.`);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Simulate cryptographic authorization sequence
    setTimeout(() => {
      setIsProcessing(false);
      onCompleteCheckout();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 id="checkout-modal-title" className="text-base font-bold text-slate-100 flex items-center gap-2">
                Autonomous Frictionless Checkout
              </h2>
              <p className="text-xs text-slate-400">Zero-line digital payment & weight clearance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Checkout"
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Amount Due Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Total Authorization Amount</span>
              <span className="text-2xl font-mono font-black text-cyan-300">
                ${cartState.total.toFixed(2)}
              </span>
            </div>
            <div className="text-right text-xs text-slate-400">
              <span>{cartState.items.reduce((s, i) => s + i.quantity, 0)} Items</span>
              <span className="block text-emerald-400 font-medium">+{cartState.loyaltyPointsEarned} Rewards Pts</span>
            </div>
          </div>

          {/* Scale Pre-Clearance Status */}
          <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            Math.abs(cartState.weightDiscrepancyGrams) <= 50
              ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
              : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Scale Clearance: <strong>{cartState.scaleSensorWeightGrams}g</strong> (Variance: {cartState.weightDiscrepancyGrams}g)</span>
            </div>
            <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-900">
              {Math.abs(cartState.weightDiscrepancyGrams) <= 50 ? 'Approved' : 'Discrepancy'}
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Frictionless Identity / Payment Method:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedMethod('biometric')}
                className={`p-3 rounded-xl border text-xs flex flex-col items-center gap-2 transition-all ${
                  selectedMethod === 'biometric'
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Fingerprint className="w-6 h-6 text-cyan-400" />
                <span className="font-semibold text-[11px]">Biometric Pass</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('google_pay')}
                className={`p-3 rounded-xl border text-xs flex flex-col items-center gap-2 transition-all ${
                  selectedMethod === 'google_pay'
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-6 h-6 text-emerald-400" />
                <span className="font-semibold text-[11px]">Google Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('token_card')}
                className={`p-3 rounded-xl border text-xs flex flex-col items-center gap-2 transition-all ${
                  selectedMethod === 'token_card'
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-6 h-6 text-purple-400" />
                <span className="font-semibold text-[11px]">Tokenized Card</span>
              </button>
            </div>
          </div>

          {/* Cryptographic Checksum Note */}
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-800 pt-3">
            <span>Payload Checksum:</span>
            <span className="text-slate-400">{cartState.cartChecksum.slice(0, 16)}...</span>
          </div>

          {/* Authorize Button */}
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authorizing Cryptographic Token...</span>
              </span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Authorize & Unlock Store Exit ($ {cartState.total.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
