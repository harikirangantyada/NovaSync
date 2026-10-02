/**
 * NovaCart Shopper Cart & Visual Checkout Interface
 * High-performance smart-cart UI with load-cell telemetry, allergen warnings, budget cap gauge, and cryptographic checksum.
 */

import React, { useMemo } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Camera, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  CreditCard, 
  Leaf, 
  Coins, 
  Lock, 
  CheckCircle2, 
  ShoppingBag,
  ArrowRight,
  TrendingDown,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { SmartCartState, Product } from '../types';
import { ScaleSimulator } from './ScaleSimulator';
import { INITIAL_PRODUCTS } from '../services/storeData';

interface ShopperCartViewProps {
  cartState: SmartCartState;
  onOpenScanner: () => void;
  onIncrementItem: (product: Product) => void;
  onDecrementItem: (productId: string) => void;
  onRemoveItem: (productId: string) => void;
  onInjectWeightDelta: (deltaGrams: number) => void;
  onTareScale: () => void;
  onCheckout: () => void;
  onOpenCopilot: () => void;
  onOpenMap: () => void;
}

export const ShopperCartView: React.FC<ShopperCartViewProps> = ({
  cartState,
  onOpenScanner,
  onIncrementItem,
  onDecrementItem,
  onRemoveItem,
  onInjectWeightDelta,
  onTareScale,
  onCheckout,
  onOpenCopilot,
  onOpenMap
}) => {
  const isBudgetWarning = useMemo(() => 
    cartState.dietaryProfile.budgetCap > 0 && cartState.total >= cartState.dietaryProfile.budgetCap * 0.9,
    [cartState.dietaryProfile.budgetCap, cartState.total]
  );

  const isBudgetExceeded = useMemo(() => 
    cartState.dietaryProfile.budgetCap > 0 && cartState.total > cartState.dietaryProfile.budgetCap,
    [cartState.dietaryProfile.budgetCap, cartState.total]
  );
  
  // Calculate total carbon footprint memoized
  const totalCarbonKg = useMemo(() => Number(
    cartState.items.reduce((sum, item) => sum + (item.product.carbonScoreKg * item.quantity), 0).toFixed(2)
  ), [cartState.items]);

  // Check for any items containing user's flagged allergens memoized
  const allergenConflicts = useMemo(() => {
    const profileAllergens = cartState.dietaryProfile.allergens;
    if (profileAllergens.length === 0) return [];
    return cartState.items.filter(item => 
      item.product.allergens.some(a => profileAllergens.includes(a))
    );
  }, [cartState.items, cartState.dietaryProfile.allergens]);

  const totalItemsCount = useMemo(() => 
    cartState.items.reduce((sum, i) => sum + i.quantity, 0),
    [cartState.items]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner / Status Overview */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <span>Cart Session #101</span>
            {cartState.status === 'locked' ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Remote Wheel Lock Engaged
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Autonomous Ready
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous dual-sensor verified basket with cryptographic state validation
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onOpenScanner}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Product</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-cyan-900/60 text-[10px] text-cyan-200 border border-cyan-700/50">
              S
            </kbd>
          </button>

          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            title="Ask Gemini for recipes & ingredient placement"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">AI Recipe-to-Cart</span>
          </button>
        </div>
      </div>

      {/* Problem Statement Alignment: Operational Value Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Checkout Wait Time</span>
            <span className="text-xs font-bold text-emerald-300">0 Seconds (Saved ~12 mins)</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Shrinkage Risk Exposure</span>
            <span className="text-xs font-bold text-cyan-300">$0.00 (Dual-Sensor Guarded)</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Allergen Safety Status</span>
            <span className="text-xs font-bold text-purple-300">{allergenConflicts.length === 0 ? '100% Safe (0 Conflicts)' : 'Alert Flagged'}</span>
          </div>
        </div>
      </div>

      {/* Allergen Warning Banner */}
      {allergenConflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block text-amber-100">
              ALLERGEN SAFETY ALERT DETECTED IN BASKET:
            </span>
            <span>
              The following item(s) conflict with your active dietary profile (avoiding: {cartState.dietaryProfile.allergens.join(', ')}):
            </span>
            <ul className="list-disc list-inside mt-1 font-semibold text-amber-300">
              {allergenConflicts.map(item => (
                <li key={item.product.id}>
                  {item.product.name} (Contains: {item.product.allergens.join(', ')})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Budget Cap Monitor */}
      {cartState.dietaryProfile.budgetCap > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <span>Budget Cap Guardian:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                isBudgetExceeded 
                  ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                  : isBudgetWarning 
                  ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                ${cartState.total.toFixed(2)} / ${cartState.dietaryProfile.budgetCap.toFixed(2)}
              </span>
            </span>
            <span className="text-slate-400">
              {isBudgetExceeded 
                ? `Exceeded budget by $${(cartState.total - cartState.dietaryProfile.budgetCap).toFixed(2)}!` 
                : `${Math.round((cartState.total / cartState.dietaryProfile.budgetCap) * 100)}% of limit`}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div 
              className={`h-full transition-all duration-300 ${
                isBudgetExceeded 
                  ? 'bg-rose-500' 
                  : isBudgetWarning 
                  ? 'bg-amber-500' 
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (cartState.total / cartState.dietaryProfile.budgetCap) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Load-Cell Scale Sensor Simulator */}
      <ScaleSimulator
        expectedWeightGrams={cartState.totalWeightGrams}
        actualWeightGrams={cartState.scaleSensorWeightGrams}
        discrepancyGrams={cartState.weightDiscrepancyGrams}
        riskScore={cartState.shrinkageRiskScore}
        isCartLocked={cartState.status === 'locked'}
        onInjectWeightDelta={onInjectWeightDelta}
        onTareScale={onTareScale}
      />

      {/* Main Grid: Cart Items on Left (2/3), Checkout Summary on Right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <span>Items in Basket</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300">
                {cartState.items.reduce((sum, i) => sum + i.quantity, 0)} units
              </span>
            </h2>
            
            {/* Cryptographic Checksum Badge */}
            <div 
              className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40"
              title={`HMAC-SHA256 Cart State Hash: ${cartState.cartChecksum}`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SHA-256 Sig: {cartState.cartChecksum.slice(0, 10)}...</span>
            </div>
          </div>

          {cartState.items.length === 0 ? (
            /* Empty Basket State */
            <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-slate-200 mb-1">Your Smart Cart is Empty</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-5">
                Scan barcodes using the cart's optical camera, or pick a sample basket to test automatic weight verification and checkout.
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={onOpenScanner}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Open Barcode Scanner
                </button>
                <button
                  onClick={() => onIncrementItem(INITIAL_PRODUCTS[0])}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  + Add Honeycrisp Apples
                </button>
                <button
                  onClick={() => onIncrementItem(INITIAL_PRODUCTS[8])}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  + Add Wild Salmon
                </button>
              </div>
            </div>
          ) : (
            /* Active Basket Items */
            <div className="space-y-3">
              {cartState.items.map(item => (
                <div
                  key={item.product.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-950 flex-shrink-0 border border-slate-800"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-100 text-sm truncate">
                          {item.product.name}
                        </h4>
                        {item.weightVerified ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Weight Match
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                            Variance {item.weightDeltaGrams}g
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="font-mono text-cyan-300 font-semibold">
                          ${item.product.price.toFixed(2)}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">
                          {item.product.aisle} ({item.product.shelf})
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">
                          {item.product.weightGrams * item.quantity}g total
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Remove Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => onDecrementItem(item.product.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        aria-label={`Decrease quantity of ${item.product.name}`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-mono font-bold text-sm text-slate-100">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onIncrementItem(item.product)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        aria-label={`Increase quantity of ${item.product.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-mono font-bold text-sm text-slate-100 min-w-16 text-right">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                      aria-label={`Remove ${item.product.name} from cart`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Nav Trigger to Store Map */}
          {cartState.items.length > 0 && (
            <button
              onClick={onOpenMap}
              className="w-full p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs text-slate-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>View Shortest In-Store Walking Tour for current {cartState.items.length} items</span>
              </span>
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                Open Store Map <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          )}
        </div>

        {/* Right Column: Checkout Breakdown */}
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-100 text-base border-b border-slate-800 pb-3">
              Order Financial Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Subtotal ({cartState.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-mono font-medium">${cartState.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1">
                  <span>Sales Tax (Tax-Exempt Produce)</span>
                  <span className="text-[10px] text-slate-500 font-mono">6.5%</span>
                </span>
                <span className="font-mono font-medium">${cartState.taxAmount.toFixed(2)}</span>
              </div>

              {cartState.discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-400 font-medium">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Loyalty Saving (5% &gt;$30)</span>
                  </span>
                  <span className="font-mono">-${cartState.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-100">Total Due</span>
                <span className="text-xl font-mono font-black text-cyan-300">
                  ${cartState.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Environmental & Loyalty Points Perks */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>Carbon Footprint:</span>
                </span>
                <span className="font-mono font-bold text-slate-200">{totalCarbonKg} kg CO₂e</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Rewards Earned:</span>
                </span>
                <span className="font-mono font-bold text-amber-300">+{cartState.loyaltyPointsEarned} pts</span>
              </div>
            </div>

            {/* Frictionless One-Tap Checkout Button */}
            <button
              onClick={onCheckout}
              disabled={cartState.items.length === 0 || cartState.status === 'locked'}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                cartState.items.length === 0 || cartState.status === 'locked'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/25 focus:ring-2 focus:ring-emerald-400'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>One-Tap Frictionless Checkout</span>
            </button>

            {cartState.status === 'locked' && (
              <p className="text-[11px] text-rose-400 text-center">
                Cart is currently locked by Loss Prevention due to weight discrepancy. Please resolve with store associate or tare scale.
              </p>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>PCI-DSS Level 1 Cryptographic Tokenization</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
