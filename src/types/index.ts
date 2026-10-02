/**
 * NovaCart Types & Domain Models
 * Enterprise-grade Type Definitions for Autonomous Smart Cart Platform
 */

export type UserRole = 'shopper' | 'loss_prevention' | 'store_manager' | 'qa_assessor';

export type Allergen = 'gluten' | 'peanuts' | 'tree_nuts' | 'dairy' | 'eggs' | 'soy' | 'shellfish' | 'fish';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: 'Produce' | 'Bakery' | 'Dairy & Refrigerated' | 'Meat & Seafood' | 'Pantry & Grains' | 'Beverages' | 'Snacks' | 'Household';
  price: number;
  weightGrams: number;
  weightToleranceGrams: number; // Acceptable scale variance
  aisle: string;
  shelf: string;
  coordinates: { x: number; y: number }; // For 2D store map navigation
  image: string;
  allergens: Allergen[];
  dietaryTags: ('Vegan' | 'Vegetarian' | 'Gluten-Free' | 'Organic' | 'Non-GMO' | 'Keto' | 'Low-Sodium')[];
  calories: number;
  carbonScoreKg: number; // Environmental impact (kg CO2e)
  stockLevel: number;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  scannedAt: number;
  expectedWeightGrams: number;
  actualSensorWeightGrams: number;
  weightVerified: boolean;
  weightDeltaGrams: number;
  tamperFlag: boolean;
  manualOverrideByStaff?: boolean;
}

export interface SmartCartState {
  cartId: string;
  shopperId: string;
  status: 'active' | 'locked' | 'checkout_pending' | 'completed';
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  loyaltyPointsEarned: number;
  totalWeightGrams: number;
  scaleSensorWeightGrams: number;
  weightDiscrepancyGrams: number;
  shrinkageRiskScore: number; // 0 - 100
  fraudFlags: string[];
  batteryPercent: number;
  cartChecksum: string; // HMAC/SHA-256 integrity hash
  dietaryProfile: {
    allergens: Allergen[];
    budgetCap: number;
    dietPreference: string;
  };
}

export interface StoreAisle {
  id: string;
  name: string;
  category: string;
  number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface CartFleetUnit {
  cartId: string;
  assignedShopper: string;
  battery: number;
  currentAisle: string;
  itemCount: number;
  totalValue: number;
  riskScore: number; // 0 - 100
  status: 'active' | 'flagged' | 'locked' | 'docked';
  lastPingTime: number;
  weightVarianceGrams: number;
  activeAnomalies: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'security_alert' | 'critical';
  cartId?: string;
  tamperDetected?: boolean;
}

export interface TestResultItem {
  id: string;
  category: 'Code Quality' | 'Security & OWASP' | 'Efficiency & Speed' | 'Accessibility (a11y)' | 'Business Logic' | 'Google Services';
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'running';
  executionTimeMs: number;
  details: string;
}

export interface AssessmentRubricScore {
  criterion: string;
  score: number; // 0 - 100
  weight: number;
  status: 'Optimal' | 'Exceeds Expectations' | 'Compliant';
  highlights: string[];
}
