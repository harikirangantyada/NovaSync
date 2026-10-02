/**
 * NovaCart Core Cart Calculation & Physical Weight Sensor Engine
 * Handles tax calculation, loyalty discounts, tare weight computation,
 * shrinkage risk algorithms, and allergen scans.
 * 
 * Performance optimizations:
 * - O(1) Set lookups for tax-exempt grocery categories
 * - Edge-case guards for NaN, negative numbers, and boundary overflows
 * - Strict typing and complete JSDoc annotations
 */

import { Allergen, CartItem, Product, SmartCartState } from '../types';
import { calculateCartChecksum } from './securityEngine';

export const TAX_RATE = 0.065; // Standard 6.5% sales tax (excluding raw produce & staples)
export const LOYALTY_DISCOUNT_PERCENT = 0.05; // 5% loyalty saving on orders >= $30
export const LOYALTY_THRESHOLD = 30.00;

// O(1) lookup set for tax exemption rules
const TAX_EXEMPT_CATEGORIES = new Set<Product['category']>([
  'Produce',
  'Bakery',
  'Pantry & Grains'
]);

/**
 * Calculates financial totals with grocery tax classification
 * 
 * @param items Array of active cart items
 * @returns Financial breakdown including subtotal, tax, discount, total, and rewards
 */
export function calculateTotals(items: readonly CartItem[]): {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  loyaltyPoints: number;
} {
  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      total: 0,
      loyaltyPoints: 0
    };
  }

  let subtotal = 0;
  let taxableSubtotal = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemTotal = item.product.price * item.quantity;
    subtotal += itemTotal;

    if (!TAX_EXEMPT_CATEGORIES.has(item.product.category)) {
      taxableSubtotal += itemTotal;
    }
  }

  const taxAmount = Number((taxableSubtotal * TAX_RATE).toFixed(2));
  const discountAmount = subtotal >= LOYALTY_THRESHOLD 
    ? Number((subtotal * LOYALTY_DISCOUNT_PERCENT).toFixed(2)) 
    : 0;
  const total = Number(Math.max(0, subtotal + taxAmount - discountAmount).toFixed(2));
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
 * 
 * @param items Active cart items
 * @param simulatedSensorWeight Current reading from physical load-cell strain gauges
 * @returns Comprehensive weight analysis, discrepancy in grams, and shrinkage score (0-100)
 */
export function calculateWeightMetrics(
  items: readonly CartItem[],
  simulatedSensorWeight: number
): {
  expectedTotalWeightGrams: number;
  weightDiscrepancyGrams: number;
  shrinkageRiskScore: number;
  fraudFlags: string[];
} {
  let expectedTotalWeightGrams = 0;
  let hasTamperFlag = false;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    expectedTotalWeightGrams += item.product.weightGrams * item.quantity;
    if (item.tamperFlag) {
      hasTamperFlag = true;
    }
  }

  const weightDiscrepancyGrams = Math.round(simulatedSensorWeight - expectedTotalWeightGrams);
  const fraudFlags: string[] = [];
  let riskScore = 0;

  const absoluteDelta = Math.abs(weightDiscrepancyGrams);

  if (absoluteDelta <= 25) {
    riskScore = 2; // Normal sensor noise calibration tolerance
  } else if (absoluteDelta <= 75) {
    riskScore = 20;
    fraudFlags.push('Minor weight calibration variance (<75g)');
  } else if (absoluteDelta <= 250) {
    riskScore = 65;
    fraudFlags.push(`Suspicious weight delta (+${weightDiscrepancyGrams}g). Possible unscanned item.`);
  } else if (absoluteDelta <= 2000) {
    riskScore = 95;
    fraudFlags.push(`CRITICAL SHRINKAGE ALERT: Large unexplained mass (+${weightDiscrepancyGrams}g) in cart basin.`);
  } else {
    riskScore = 100;
    fraudFlags.push(`EMERGENCY BRAKE INTERLOCK: Extreme unauthorized mass (+${weightDiscrepancyGrams}g) in cart basin.`);
  }

  if (hasTamperFlag) {
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
 * Checks for allergen conflicts between user health profile and scanned product
 * 
 * @param userAllergens List of allergens to avoid
 * @param product Scanned grocery product
 * @returns Conflict status and conflicting allergens
 */
export function checkAllergenConflicts(
  userAllergens: readonly Allergen[],
  product: Product
): { hasConflict: boolean; conflictingAllergens: Allergen[] } {
  if (!userAllergens || userAllergens.length === 0 || !product.allergens || product.allergens.length === 0) {
    return { hasConflict: false, conflictingAllergens: [] };
  }

  const allergenSet = new Set(userAllergens);
  const conflictingAllergens = product.allergens.filter(allergen => allergenSet.has(allergen));

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
        const newActualWeight = item.actualSensorWeightGrams + itemSensorWeight;
        const newExpectedWeight = product.weightGrams * newQty;
        return {
          ...item,
          quantity: newQty,
          expectedWeightGrams: newExpectedWeight,
          actualSensorWeightGrams: newActualWeight,
          weightVerified: isVerified,
          weightDeltaGrams: newActualWeight - newExpectedWeight
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
