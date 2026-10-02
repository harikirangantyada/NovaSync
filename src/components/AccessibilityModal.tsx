/**
 * NovaCart Accessibility (WCAG 2.1 AA) & Dietary Profile Settings Modal
 * Configures high-contrast mode, text scaling, audio cues, allergen filters, and budget limits.
 */

import React from 'react';
import { 
  Eye, 
  X, 
  Volume2, 
  Sparkles, 
  ShieldAlert, 
  DollarSign, 
  Sliders,
  Check
} from 'lucide-react';
import { Allergen } from '../types';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  largeText: boolean;
  setLargeText: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  userAllergens: Allergen[];
  onToggleAllergen: (allergen: Allergen) => void;
  budgetCap: number;
  setBudgetCap: (val: number) => void;
  dietPreference: string;
  setDietPreference: (val: string) => void;
}

const ALLERGEN_OPTIONS: { id: Allergen; label: string }[] = [
  { id: 'gluten', label: 'Gluten / Wheat' },
  { id: 'peanuts', label: 'Peanuts' },
  { id: 'tree_nuts', label: 'Tree Nuts (Almonds, Walnuts)' },
  { id: 'dairy', label: 'Dairy / Lactose' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'soy', label: 'Soy' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'fish', label: 'Fin Fish' }
];

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
  highContrast,
  setHighContrast,
  largeText,
  setLargeText,
  soundEnabled,
  setSoundEnabled,
  userAllergens,
  onToggleAllergen,
  budgetCap,
  setBudgetCap,
  dietPreference,
  setDietPreference
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="a11y-modal-title"
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 id="a11y-modal-title" className="text-base font-bold text-slate-100 flex items-center gap-2">
                Accessibility & Dietary Profile
              </h2>
              <p className="text-xs text-slate-400">WCAG 2.1 AA certified preferences & health safeguards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Settings"
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          
          {/* Visual & Audio Toggles */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Visual & Auditory Controls:
            </h3>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                <div>
                  <span className="font-semibold text-slate-200 block">High Contrast Mode</span>
                  <span className="text-xs text-slate-400">Deep blacks & maximum contrast borders</span>
                </div>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                <div>
                  <span className="font-semibold text-slate-200 block">Large Text Sizing</span>
                  <span className="text-xs text-slate-400">Scales font sizes by +15% for readability</span>
                </div>
                <input
                  type="checkbox"
                  checked={largeText}
                  onChange={(e) => setLargeText(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                <div>
                  <span className="font-semibold text-slate-200 block">Auditory Chimes & Scan Feedback</span>
                  <span className="text-xs text-slate-400">Sound confirmation on barcode scans & warnings</span>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700"
                />
              </label>
            </div>
          </div>

          {/* Dietary Allergens Guardian */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Allergen Safety Guardian:</span>
              <span className="text-amber-400 font-semibold">{userAllergens.length} Active Filters</span>
            </h3>
            <p className="text-xs text-slate-400">
              The smart cart alerts immediately if an item containing selected allergens is added to the cart.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {ALLERGEN_OPTIONS.map(opt => {
                const isSelected = userAllergens.includes(opt.id);
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => onToggleAllergen(opt.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-medium">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Limit Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Session Budget Cap:
              </h3>
              <span className="font-mono font-bold text-cyan-300">
                {budgetCap > 0 ? `$${budgetCap.toFixed(2)}` : 'No Cap'}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={budgetCap}
              onChange={(e) => setBudgetCap(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-950 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>$0 (Off)</span>
              <span>$50</span>
              <span>$100</span>
              <span>$150</span>
              <span>$200</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            Apply & Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
};
