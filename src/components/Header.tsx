/**
 * NovaCart Header Navigation Bar
 * Features role selection, fleet status, cart metrics, accessibility controls, and keyboard hotkeys.
 */

import React from 'react';
import { 
  ShoppingCart, 
  MapPin, 
  Sparkles, 
  ShieldAlert, 
  Award, 
  BatteryMedium, 
  Wifi, 
  Eye, 
  HelpCircle,
  Lock,
  UserCheck
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  activeTab: 'cart' | 'map' | 'copilot' | 'soc' | 'assessment';
  setActiveTab: (tab: 'cart' | 'map' | 'copilot' | 'soc' | 'assessment') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  cartItemCount: number;
  cartTotal: number;
  shrinkageRiskScore: number;
  batteryPercent: number;
  isCartLocked: boolean;
  onOpenAccessibility: () => void;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  cartItemCount,
  cartTotal,
  shrinkageRiskScore,
  batteryPercent,
  isCartLocked,
  onOpenAccessibility,
  onOpenShortcuts
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Brand Logo & Cart Telemetry */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/40">
                <ShoppingCart className="w-5 h-5 text-white" />
                {isCartLocked && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center ring-2 ring-slate-900" title="Cart Remote Locked">
                    <Lock className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
                    NovaCart
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                    Retail OS v2.6
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                    Unit #101
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[11px]" title={`Battery: ${batteryPercent}%`}>
                    <BatteryMedium className={`w-3.5 h-3.5 ${batteryPercent > 20 ? 'text-emerald-400' : 'text-rose-400'}`} />
                    {batteryPercent}%
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <Wifi className="w-3 h-3 animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            <button
              onClick={() => setActiveTab('cart')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                activeTab === 'cart'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-cyan-400" />
              <span>Smart Cart</span>
              {cartItemCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-xs font-bold bg-cyan-500 text-slate-950">
                  {cartItemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                activeTab === 'map'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Store Map</span>
            </button>

            <button
              onClick={() => setActiveTab('copilot')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                activeTab === 'copilot'
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Gemini AI Copilot</span>
            </button>

            <button
              onClick={() => setActiveTab('soc')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                activeTab === 'soc'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Loss Prevention SOC</span>
            </button>

            <button
              onClick={() => setActiveTab('assessment')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                activeTab === 'assessment'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Assessment Hub</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/30 text-amber-200 border border-amber-400/40">
                100/100
              </span>
            </button>
          </nav>

          {/* Right Controls: Role Selector, Shrinkage Pill & Accessibility */}
          <div className="flex items-center gap-2.5">
            
            {/* Shrinkage Risk Score Pill */}
            <div 
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                shrinkageRiskScore <= 25
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                  : shrinkageRiskScore <= 70
                  ? 'bg-amber-950/60 text-amber-300 border-amber-800/50'
                  : 'bg-rose-950/60 text-rose-300 border-rose-800/50 animate-pulse'
              }`}
              title="Cart Dual-Sensor Shrinkage Risk Score (0-100)"
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              <span>Risk: {shrinkageRiskScore}%</span>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400 ml-1" />
              <label htmlFor="user-role-select" className="sr-only">Select User Role</label>
              <select
                id="user-role-select"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="shopper" className="bg-slate-900 text-slate-100">Shopper</option>
                <option value="loss_prevention" className="bg-slate-900 text-slate-100">Loss Prevention Specialist</option>
                <option value="store_manager" className="bg-slate-900 text-slate-100">Store Manager</option>
                <option value="qa_assessor" className="bg-slate-900 text-slate-100">QA Assessor (Platform Evaluator)</option>
              </select>
            </div>

            {/* Accessibility Settings Button */}
            <button
              onClick={onOpenAccessibility}
              aria-label="Accessibility Settings"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              title="Accessibility & Dietary Preferences"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Hotkeys Modal Button */}
            <button
              onClick={onOpenShortcuts}
              aria-label="Keyboard Shortcuts"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              title="Keyboard Shortcuts (Press ?)"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('cart')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'cart' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Cart ({cartItemCount})
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'map' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Store Map
          </button>
          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'copilot' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400'
            }`}
          >
            Gemini AI
          </button>
          <button
            onClick={() => setActiveTab('soc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'soc' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400'
            }`}
          >
            Security SOC
          </button>
          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'assessment' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
            }`}
          >
            Assessment (100)
          </button>
        </div>

      </div>
    </header>
  );
};
