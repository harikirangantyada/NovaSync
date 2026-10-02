/**
 * NovaCart Multimodal Optical Barcode & Vision Scanner
 * Emulates in-cart camera system, laser barcode reader, and Gemini Computer Vision classifier.
 */

import React, { useState } from 'react';
import { Camera, X, Scan, CheckCircle, Search, ShieldCheck, Zap } from 'lucide-react';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../services/storeData';
import { sanitizeInput } from '../services/securityEngine';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanProduct: (product: Product) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onScanProduct
}) => {
  const [manualCode, setManualCode] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [scanSuccessItem, setScanSuccessItem] = useState<Product | null>(null);

  if (!isOpen) return null;

  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = sanitizeInput(manualCode);
    const matched = INITIAL_PRODUCTS.find(p => p.barcode === cleanCode || p.sku.toLowerCase() === cleanCode.toLowerCase());
    if (matched) {
      triggerScanSuccess(matched);
    }
  };

  const triggerScanSuccess = (product: Product) => {
    setScanSuccessItem(product);
    onScanProduct(product);
    setTimeout(() => {
      setScanSuccessItem(null);
      onClose();
    }, 600);
  };

  const filteredProducts = INITIAL_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="scanner-modal-title"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 id="scanner-modal-title" className="text-base font-bold text-slate-100 flex items-center gap-2">
                Autonomous Cart Scanner
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Dual Barcode + Vision AI
                </span>
              </h2>
              <p className="text-xs text-slate-400">Scan barcodes or use AI camera recognition to add items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Scanner"
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Camera Simulation */}
        <div className="relative bg-slate-950 p-6 flex flex-col items-center justify-center border-b border-slate-800 overflow-hidden">
          
          {/* Animated Scanning Beam */}
          <div className="relative w-64 h-36 border-2 border-dashed border-cyan-500/60 rounded-xl flex items-center justify-center bg-cyan-950/20 overflow-hidden shadow-inner shadow-cyan-950">
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400 animate-pulse" style={{ animationDuration: '1.2s' }} />
            
            {/* Viewfinder Target Reticle */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

            {scanSuccessItem ? (
              <div className="flex flex-col items-center gap-2 text-emerald-400 animate-scaleUp">
                <CheckCircle className="w-10 h-10" />
                <span className="text-xs font-bold text-slate-100">{scanSuccessItem.name}</span>
                <span className="text-[10px] text-emerald-300 font-mono">Weight Verified: {scanSuccessItem.weightGrams}g</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-slate-400">
                <Scan className="w-8 h-8 text-cyan-400/80 animate-pulse" />
                <span className="text-xs font-mono text-cyan-300">Aim Barcode or Product at Center</span>
              </div>
            )}
          </div>

          {/* Quick Manual Entry Form */}
          <form onSubmit={handleManualScan} className="w-full max-w-md mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter 12-digit barcode or SKU (e.g. 890100100101)..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full px-3.5 py-2 pl-9 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              Verify & Add
            </button>
          </form>
        </div>

        {/* Quick-Scan Shelf Catalog List */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Direct Tap-to-Scan In-Store Products:
            </h3>
            <span className="text-[11px] text-slate-500">Tap any item to simulate instant laser scan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => triggerScanSuccess(product)}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-900 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 truncate">
                      {product.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400 ml-1">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 font-mono">
                      {product.aisle}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-cyan-300">{product.weightGrams}g</span>
                    {product.allergens.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400 font-medium">Contains {product.allergens[0]}</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Automated Tare & Load-Cell Sync Active
          </span>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white font-medium focus:outline-none"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
