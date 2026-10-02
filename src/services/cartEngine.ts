/**
 * NovaCart Core Cart Calculation & Physical Weight Sensor Engine
 * Handles tax, loyalty discounts, tare weight computation, shrinkage risk algorithms, and allergen scans.
 */

import { Allergen, CartItem, Product, SmartCartState } from '../types';
import { calculateCartChecksum } from './securityEngine';

export const TAX_RATE = 0.065; // Standard 6.5% sales tax (excluding raw produce)
export const LOYALTY_DISCOUNT_PERCENT = 0.05; // 5% loyalty saving on orders > $30

/**
 * Calculates financial totals with grocery tax classification
 */
export function calculateTotals(items: CartItem[]): {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  loyaltyPoints: number;
} {
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  // Tax calculation: Produce, Bakery, and Pantry staples are tax-exempt; Household and Snacks taxable
  const taxableSubtotal = items.reduce((sum, item) => {
    const isTaxExempt = ['Produce', 'Bakery', 'Pantry & Grains'].includes(item.product.category);
    return isTaxExempt ? sum : sum + (item.product.price * item.quantity);
  }, 0);

  const taxAmount = Number((taxableSubtotal * TAX_RATE).toFixed(2));
  const discountAmount = subtotal >= 30 ? Number((subtotal * LOYALTY_DISCOUNT_PERCENT).toFixed(2)) : 0;
  const total = Number((subtotal + taxAmount - discountAmount).toFixed(2));
  const loyaltyPoints = Math.floor(subtotal * 10);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    taxAmount,
    discountAmount,
    total,
    loyaltyPoints
  };
}

/**
 * Calculates physical load-cell sensor expected weight & delta
 */
export function calculateWeightMetrics(
  items: CartItem[],
  simulatedSensorWeight: number
): {
  expectedTotalWeightGrams: number;
  weightDiscrepancyGrams: number;
  shrinkageRiskScore: number;
  fraudFlags: string[];
} {
  const expectedTotalWeightGrams = items.reduce(
    (sum, item) => sum + (item.product.weightGrams * item.quantity),
    0
  );

  const weightDiscrepancyGrams = Math.round(simulatedSensorWeight - expectedTotalWeightGrams);
  const fraudFlags: string[] = [];
  let riskScore = 0;

  // Analysis of discrepancy
  const absoluteDelta = Math.abs(weightDiscrepancyGrams);

  if (absoluteDelta <= 25) {
    // Normal calibration tolerance
    riskScore = 2;
  } else if (absoluteDelta <= 75) {
    riskScore = 20;
    fraudFlags.push('Minor weight calibration variance (<75g)');
  } else if (absoluteDelta <= 250) {
    riskScore = 65;
    fraudFlags.push(`Suspicious weight delta (+${weightDiscrepancyGrams}g). Possible unscanned item.`);
  } else {
    riskScore = 95;
    fraudFlags.push(`CRITICAL SHRINKAGE ALERT: Large unexplained mass (+${weightDiscrepancyGrams}g) in cart basin.`);
  }

  // Barcode swap check: e.g. item scanned is cheap, but weight on scale is 500g heavier
  if (items.some(i => i.tamperFlag)) {
    riskScore = Math.max(riskScore, 85);
    fraudFlags.push('Barcode mismatch or vision classification override flagged.');
  }

  return {
    expectedTotalWeightGrams,
    weightDiscrepancyGrams,
    shrinkageRiskScore: Math.min(100, Math.max(0, riskScore)),
    fraudFlags
  };
}

/**
 * Checks for allergen conflicts between user profile and scanned product
 */
export function checkAllergenConflicts(
  userAllergens: Allergen[],
  product: Product
): { hasConflict: boolean; conflictingAllergens: Allergen[] } {
  if (!userAllergens || userAllergens.length === 0) {
    return { hasConflict: false, conflictingAllergens: [] };
  }

  const conflictingAllergens = product.allergens.filter(allergen => 
    userAllergens.includes(allergen)
  );

  return {
    hasConflict: conflictingAllergens.length > 0,
    conflictingAllergens
  };
}

/**
 * Pure state reducer to add an item to the cart and re-calculate cryptographic checksum
 */
export async function addItemToCart(
  currentState: SmartCartState,
  product: Product,
  sensorDeltaGrams?: number
): Promise<SmartCartState> {
  const existingIndex = currentState.items.findIndex(i => i.product.id === product.id);
  let updatedItems: CartItem[];

  const itemSensorWeight = sensorDeltaGrams ?? product.weightGrams;
  const isVerified = Math.abs(itemSensorWeight - product.weightGrams) <= product.weightToleranceGrams;

  if (existingIndex >= 0) {
    updatedItems = currentState.items.map((item, idx) => {
      if (idx === existingIndex) {
        const newQty = item.quantity + 1;
        return {
          ...item,
          quantity: newQty,
          expectedWeightGrams: product.weightGrams * newQty,
          actualSensorWeightGrams: item.actualSensorWeightGrams + itemSensorWeight,
          weightVerified: isVerified,
          weightDeltaGrams: (item.actualSensorWeightGrams + itemSensorWeight) - (product.weightGrams * newQty)
        };
      }
      return item;
    });
  } else {
    const newItem: CartItem = {
      product,
      quantity: 1,
      scannedAt: Date.now(),
      expectedWeightGrams: product.weightGrams,
      actualSensorWeightGrams: itemSensorWeight,
      weightVerified: isVerified,
      weightDeltaGrams: itemSensorWeight - product.weightGrams,
      tamperFlag: !isVerified && Math.abs(itemSensorWeight - product.weightGrams) > product.weightToleranceGrams * 2
    };
    updatedItems = [...currentState.items, newItem];
  }

  const totals = calculateTotals(updatedItems);
  const newSensorTotal = currentState.scaleSensorWeightGrams + itemSensorWeight;
  const weightMetrics = calculateWeightMetrics(updatedItems, newSensorTotal);

  const checksum = await calculateCartChecksum(
    currentState.cartId,
    currentState.shopperId,
    updatedItems,
    totals.total
  );

  return {
    ...currentState,
    items: updatedItems,
    subtotal: totals.subtotal,
    taxAmount: totals.taxAmount,
    discountAmount: totals.discountAmount,
    total: totals.total,
    loyaltyPointsEarned: totals.loyaltyPoints,
    totalWeightGrams: weightMetrics.expectedTotalWeightGrams,
    scaleSensorWeightGrams: newSensorTotal,
    weightDiscrepancyGrams: weightMetrics.weightDiscrepancyGrams,
    shrinkageRiskScore: weightMetrics.shrinkageRiskScore,
    fraudFlags: weightMetrics.fraudFlags,
    cartChecksum: checksum
  };
}

/**
 * Pure state reducer to remove or decrement an item from the cart
 */
export async function removeItemFromCart(
  currentState: SmartCartState,
  productId: string
): Promise<SmartCartState> {
  const targetItem = currentState.items.find(i => i.product.id === productId);
  if (!targetItem) return currentState;

  let updatedItems: CartItem[];
  const weightToRemove = targetItem.product.weightGrams;

  if (targetItem.quantity > 1) {
    updatedItems = currentState.items.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity - 1;
        return {
          ...item,
          quantity: newQty,
          expectedWeightGrams: item.product.weightGrams * newQty,
          actualSensorWeightGrams: Math.max(0, item.actualSensorWeightGrams - weightToRemove)
        };
      }
      return item;
    });
  } else {
    updatedItems = currentState.items.filter(item => item.product.id !== productId);
  }

  const totals = calculateTotals(updatedItems);
  const newSensorTotal = Math.max(0, currentState.scaleSensorWeightGrams - weightToRemove);
  const weightMetrics = calculateWeightMetrics(updatedItems, newSensorTotal);

  const checksum = await calculateCartChecksum(
    currentState.cartId,
    currentState.shopperId,
    updatedItems,
    totals.total
  );

  return {
    ...currentState,
    items: updatedItems,
    subtotal: totals.subtotal,
    taxAmount: totals.taxAmount,
    discountAmount: totals.discountAmount,
    total: totals.total,
    loyaltyPointsEarned: totals.loyaltyPoints,
    totalWeightGrams: weightMetrics.expectedTotalWeightGrams,
    scaleSensorWeightGrams: newSensorTotal,
    weightDiscrepancyGrams: weightMetrics.weightDiscrepancyGrams,
    shrinkageRiskScore: weightMetrics.shrinkageRiskScore,
    fraudFlags: weightMetrics.fraudFlags,
    cartChecksum: checksum
  };
}
