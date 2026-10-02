/**
 * NovaCart Gemini AI Culinary & In-Store Shopping Copilot
 * Integrates Google Gemini AI (@google/genai, gemini-3.8-flash) for recipe-to-cart conversion,
 * dietary allergen verification, and dynamic macro breakdown.
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  ChefHat, 
  Clock, 
  DollarSign, 
  Check, 
  Plus, 
  AlertCircle,
  Leaf,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Product, SmartCartState } from '../types';
import { generateRecipeToCart, RecipeResult } from '../services/geminiService';

interface GeminiCopilotViewProps {
  cartState: SmartCartState;
  onAddProducts: (products: Product[]) => void;
  onNavigateToCart: () => void;
}

export const GeminiCopilotView: React.FC<GeminiCopilotViewProps> = ({
  cartState,
  onAddProducts,
  onNavigateToCart
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState<RecipeResult | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleGenerateRecipe = async (mealPrompt: string) => {
    if (!mealPrompt.trim()) return;
    setIsLoading(true);
    setAddedSuccess(false);

    try {
      const result = await generateRecipeToCart(
        mealPrompt,
        cartState.dietaryProfile.dietPreference,
        cartState.dietaryProfile.allergens
      );
      setRecipeResult(result);
    } catch (err) {
      console.error('Error generating recipe:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAllToCart = () => {
    if (!recipeResult) return;
    onAddProducts(recipeResult.matchedProducts);
    setAddedSuccess(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Copilot Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-purple-950/30 p-5 rounded-2xl border border-purple-800/40">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
                <span>Gemini Shopping & Recipe Copilot</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/50">
                  gemini-3.8-flash
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Natural-language meal planning mapped directly to live in-store aisle inventory
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-purple-300 font-medium bg-purple-950/70 px-3 py-1.5 rounded-xl border border-purple-800/50">
          <span>Active Dietary Filter: {cartState.dietaryProfile.dietPreference}</span>
          {cartState.dietaryProfile.allergens.length > 0 && (
            <span>• Avoiding: {cartState.dietaryProfile.allergens.join(', ')}</span>
          )}
        </div>
      </div>

      {/* Recipe Query Prompt Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <label htmlFor="recipe-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          What would you like to cook or prepare?
        </label>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerateRecipe(prompt);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            id="recipe-input"
            type="text"
            placeholder="e.g. Keto Mediterranean Salmon Bowl under $25 for dinner..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Thinking...</span>
              </span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Generate Recipe & Cart</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400">Quick ideas:</span>
          <button
            type="button"
            onClick={() => {
              setPrompt('Pan-seared salmon with quinoa and fresh greens');
              handleGenerateRecipe('Pan-seared salmon with quinoa and fresh greens');
            }}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            🐟 Pan-Seared Salmon & Quinoa
          </button>
          <button
            type="button"
            onClick={() => {
              setPrompt('High-protein gluten-free breakfast toast with oat latte');
              handleGenerateRecipe('High-protein gluten-free breakfast toast with oat latte');
            }}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            🥑 Protein Toast & Oat Latte
          </button>
          <button
            type="button"
            onClick={() => {
              setPrompt('Quick Greek yogurt bowl with crisp apples and almonds');
              handleGenerateRecipe('Quick Greek yogurt bowl with crisp apples and almonds');
            }}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            🥣 Greek Yogurt & Almond Crunch
          </button>
        </div>
      </div>

      {/* Generated Recipe & Cart Ingredients */}
      {recipeResult && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg sm:text-xl font-black text-slate-100">
                  {recipeResult.recipeName}
                </h2>
              </div>
              <p className="text-xs text-purple-300 font-medium mt-1">
                {recipeResult.nutritionalHighlights}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{recipeResult.preparationMinutes} min prep</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 font-bold">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Est. ${recipeResult.estimatedCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Cooking Instructions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Chef Preparation Steps:
            </h3>
            <ol className="space-y-2">
              {recipeResult.cookingInstructions.map((step, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold font-mono text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Matched Store Inventory Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span>Matched Store Inventory Ingredients ({recipeResult.matchedProducts.length}):</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Allergen Checked ✓</span>
              </h3>

              {addedSuccess ? (
                <button
                  onClick={onNavigateToCart}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Added! Go to Cart</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              ) : (
                <button
                  onClick={handleAddAllToCart}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors focus:ring-2 focus:ring-purple-400"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add All {recipeResult.matchedProducts.length} Items to Smart Cart</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recipeResult.matchedProducts.map(prod => (
                <div
                  key={prod.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-900 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-200 block truncate">
                        {prod.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {prod.aisle} • {prod.shelf}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="font-mono font-bold text-cyan-300">${prod.price.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{prod.weightGrams}g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
