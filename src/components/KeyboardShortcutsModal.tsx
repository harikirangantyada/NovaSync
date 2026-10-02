/**
 * NovaCart Keyboard Navigation & Hotkeys Guide Modal
 * Full WCAG accessibility keyboard shortcut directory.
 */

import React from 'react';
import { HelpCircle, X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'S', description: 'Open Optical Barcode & Vision Scanner' },
    { key: 'C', description: 'Switch to Smart Cart Tab' },
    { key: 'M', description: 'Switch to Interactive Store Map' },
    { key: 'A', description: 'Switch to Gemini AI Copilot' },
    { key: 'L', description: 'Switch to Loss Prevention SOC' },
    { key: 'E', description: 'Switch to Assessment & Audit Hub' },
    { key: 'T', description: 'Tare (Zero) Load-Cell Scale Sensor' },
    { key: 'P', description: 'Proceed to Frictionless Checkout' },
    { key: '?', description: 'Open Keyboard Shortcuts Directory' },
    { key: 'Esc', description: 'Close any active dialog or modal' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 id="shortcuts-title" className="text-base font-bold text-slate-100">
                Keyboard Shortcuts Directory
              </h2>
              <p className="text-xs text-slate-400">Accessible hands-free navigation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Shortcuts"
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-2.5 max-h-[70vh] overflow-y-auto">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
            >
              <span className="text-slate-300 font-medium">{sc.description}</span>
              <kbd className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-cyan-300 font-mono font-bold text-xs shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
