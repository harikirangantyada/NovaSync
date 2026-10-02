/**
 * NovaCart Interactive Store Map & Shortest Path Wayfinding
 * 2D SVG floorplan with real-time waypoint routing, turn-by-turn checklist, and aisle stock lookup.
 */

import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  CheckCircle, 
  Plus, 
  Route, 
  Layers, 
  Timer, 
  Footprints,
  Sparkles,
  Info
} from 'lucide-react';
import { Product, StoreAisle } from '../types';
import { STORE_AISLES, INITIAL_PRODUCTS } from '../services/storeData';
import { computeOptimalShoppingRoute, STORE_ENTRANCE, CHECKOUT_ZONE } from '../services/navigationEngine';

interface StoreMapViewProps {
  cartProducts: Product[];
  onAddProductToCart: (product: Product) => void;
}

export const StoreMapView: React.FC<StoreMapViewProps> = ({
  cartProducts,
  onAddProductToCart
}) => {
  const [selectedAisle, setSelectedAisle] = useState<StoreAisle | null>(STORE_AISLES[0]);
  const [activeTab, setActiveTab] = useState<'map' | 'turns'>('map');

  // Compute optimal shortest path visiting all products in cart
  const routeCalculation = computeOptimalShoppingRoute(
    { x: STORE_ENTRANCE.x, y: STORE_ENTRANCE.y },
    cartProducts
  );

  const aisleProducts = selectedAisle 
    ? INITIAL_PRODUCTS.filter(p => p.aisle.toLowerCase().includes(String(selectedAisle.number)) || p.category === selectedAisle.category)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header and Route Efficiency Stats */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <Navigation className="w-6 h-6 text-emerald-400" />
            <span>Smart Store Wayfinding & Optimal Tour</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            2-Opt algorithmic pathfinding minimizes walking fatigue and eliminates congestion bottlenecks
          </p>
        </div>

        {/* Real-time Route Stats */}
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
          <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <Route className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Route</span>
              <span className="text-sm font-mono font-bold text-slate-200">{routeCalculation.totalDistanceMeters}m</span>
            </div>
          </div>

          <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <Timer className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Walk Time</span>
              <span className="text-sm font-mono font-bold text-slate-200">~{routeCalculation.estimatedMinutes} min</span>
            </div>
          </div>

          <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <Footprints className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Est. Steps</span>
              <span className="text-sm font-mono font-bold text-slate-200">{routeCalculation.stepsCount} steps</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Floorplan Layout: Map on Left, Aisle Explorer & Directions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Store Map Canvas */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col items-center">
          
          <div className="w-full flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-3 text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400 ring-2 ring-cyan-900" />
                <span>Store Entrance</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-emerald-900" />
                <span>Active Basket Items ({cartProducts.length})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-400 ring-2 ring-purple-900" />
                <span>Checkout Exit</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">Scale: 10px ≈ 1.2m</span>
          </div>

          {/* SVG Map Container */}
          <div className="w-full overflow-x-auto flex justify-center py-2">
            <svg
              viewBox="0 0 800 780"
              className="w-full max-w-[700px] h-auto bg-slate-950 rounded-xl border border-slate-800 shadow-inner select-none"
              style={{ minWidth: '480px' }}
            >
              {/* Floor Grid background pattern */}
              <defs>
                <pattern id="floor-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="800" height="780" fill="url(#floor-grid)" />

              {/* Entrance Area Top */}
              <rect x="300" y="8" width="200" height="36" rx="8" fill="#083344" stroke="#06b6d4" strokeWidth="1.5" />
              <text x="400" y="30" textAnchor="middle" fill="#67e8f9" fontSize="12" fontWeight="bold">
                ▲ STORE ENTRANCE / SMART CART DOCK ▲
              </text>

              {/* Draw Store Aisles */}
              {STORE_AISLES.map(aisle => {
                const isSelected = selectedAisle?.id === aisle.id;
                return (
                  <g 
                    key={aisle.id} 
                    onClick={() => setSelectedAisle(aisle)}
                    className="cursor-pointer transition-transform hover:opacity-90"
                  >
                    <rect
                      x={aisle.x}
                      y={aisle.y}
                      width={aisle.width}
                      height={aisle.height}
                      rx="12"
                      fill={isSelected ? '#1e293b' : '#0f172a'}
                      stroke={isSelected ? '#06b6d4' : aisle.color}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      strokeDasharray={isSelected ? 'none' : 'none'}
                    />
                    <text
                      x={aisle.x + aisle.width / 2}
                      y={aisle.y + 24}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      Aisle {aisle.number}
                    </text>
                    <text
                      x={aisle.x + aisle.width / 2}
                      y={aisle.y + 42}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                    >
                      {aisle.category}
                    </text>

                    {/* Shelf interior dividers */}
                    <line x1={aisle.x + 10} y1={aisle.y + 65} x2={aisle.x + aisle.width - 10} y2={aisle.y + 65} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={aisle.x + 10} y1={aisle.y + 130} x2={aisle.x + aisle.width - 10} y2={aisle.y + 130} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={aisle.x + 10} y1={aisle.y + 195} x2={aisle.x + aisle.width - 10} y2={aisle.y + 195} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                  </g>
                );
              })}

              {/* Draw Optimal Shopping Path Polyline */}
              {routeCalculation.orderedWaypoints.length > 1 && (
                <polyline
                  points={routeCalculation.orderedWaypoints.map(wp => `${wp.x},${wp.y}`).join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              )}

              {/* Waypoints Pins */}
              {routeCalculation.orderedWaypoints.map((wp, idx) => (
                <g key={wp.id}>
                  <circle
                    cx={wp.x}
                    cy={wp.y}
                    r={idx === 0 || idx === routeCalculation.orderedWaypoints.length - 1 ? 9 : 7}
                    fill={idx === 0 ? '#06b6d4' : idx === routeCalculation.orderedWaypoints.length - 1 ? '#a855f7' : '#10b981'}
                    stroke="#0f172a"
                    strokeWidth="2"
                  />
                  <text
                    x={wp.x}
                    y={wp.y - 12}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.8))"
                  >
                    {idx + 1}. {wp.label.split(' ')[0]}
                  </text>
                </g>
              ))}

              {/* Frictionless Checkout Zone Bottom */}
              <rect x="250" y="700" width="300" height="42" rx="10" fill="#3b0764" stroke="#a855f7" strokeWidth="1.5" />
              <text x="400" y="726" textAnchor="middle" fill="#e9d5ff" fontSize="12" fontWeight="bold">
                ★ AUTONOMOUS FRICTIONLESS CHECKOUT LANE ★
              </text>
            </svg>
          </div>
        </div>

        {/* Right Sidebar: Aisle Explorer & Turn-by-Turn Shopping Route */}
        <div className="space-y-4">
          
          {/* Tab selector */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'map' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Aisle Inventory ({selectedAisle ? `Aisle ${selectedAisle.number}` : 'Select'})
            </button>
            <button
              onClick={() => setActiveTab('turns')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'turns' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Turn-by-Turn ({routeCalculation.orderedWaypoints.length} stops)
            </button>
          </div>

          {activeTab === 'map' ? (
            /* Selected Aisle Inventory List */
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              {selectedAisle && (
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-100 text-sm">
                      {selectedAisle.name}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                      Aisle {selectedAisle.number}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Category: {selectedAisle.category} • Shelf capacity: 94%
                  </p>
                </div>
              )}

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {aisleProducts.map(product => (
                  <div
                    key={product.id}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-11 h-11 rounded-lg object-cover bg-slate-900 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-200 truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="font-mono text-cyan-300 font-semibold">${product.price.toFixed(2)}</span>
                        <span>•</span>
                        <span className="text-slate-400">{product.shelf}</span>
                        <span>•</span>
                        <span>{product.weightGrams}g</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onAddProductToCart(product)}
                      className="p-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      title="Add to cart"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Turn-by-Turn Route Navigation */
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-2">
                Optimal Tour Waypoint Sequence
              </h3>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {routeCalculation.orderedWaypoints.map((wp, index) => (
                  <div
                    key={wp.id}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <span className="font-semibold text-slate-200 block">
                        {wp.label}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Coordinates: ({wp.x}, {wp.y})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
