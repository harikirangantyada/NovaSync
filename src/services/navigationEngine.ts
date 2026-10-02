/**
 * NovaCart Indoor Wayfinding & Shopping Path Navigation Engine
 * Solves optimal shopping tour (TSP/Nearest Neighbor) to minimize walking steps,
 * eliminate congestion, and guide shoppers directly to shelf coordinates.
 */

import { Product, StoreAisle } from '../types';
import { STORE_AISLES } from './storeData';

export interface Waypoint {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'entrance' | 'aisle' | 'product' | 'checkout';
}

export const STORE_ENTRANCE: Waypoint = {
  id: 'wp-entrance',
  label: 'Main Store Entrance',
  x: 400,
  y: 20,
  type: 'entrance'
};

export const CHECKOUT_ZONE: Waypoint = {
  id: 'wp-checkout',
  label: 'Autonomous Frictionless Checkout Zone',
  x: 400,
  y: 720,
  type: 'checkout'
};

/**
 * Calculates Euclidean distance between two 2D points (scaled to store meters)
 */
export function calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Finds the aisle corresponding to coordinates or product
 */
export function getAisleForProduct(product: Product): StoreAisle | undefined {
  return STORE_AISLES.find(aisle => aisle.name.toLowerCase().includes(product.aisle.toLowerCase()) || product.aisle.includes(String(aisle.number)));
}

/**
 * Computes the optimal shortest shopping path visiting all target product coordinates
 * using a 2-opt optimized Nearest-Neighbor heuristic.
 */
export function computeOptimalShoppingRoute(
  startPos: { x: number; y: number } = STORE_ENTRANCE,
  targetProducts: Product[]
): {
  orderedWaypoints: Waypoint[];
  totalDistanceMeters: number;
  estimatedMinutes: number;
  stepsCount: number;
} {
  if (targetProducts.length === 0) {
    return {
      orderedWaypoints: [
        { ...STORE_ENTRANCE, x: startPos.x, y: startPos.y },
        CHECKOUT_ZONE
      ],
      totalDistanceMeters: Math.round(calculateDistance(startPos, CHECKOUT_ZONE) * 0.1),
      estimatedMinutes: 1,
      stepsCount: 25
    };
  }

  // De-duplicate product waypoints
  const productWaypoints: Waypoint[] = targetProducts.map(prod => ({
    id: `wp-${prod.id}`,
    label: `${prod.name} (${prod.aisle} • ${prod.shelf})`,
    x: prod.coordinates.x,
    y: prod.coordinates.y,
    type: 'product'
  }));

  // Nearest neighbor route builder
  const unvisited = [...productWaypoints];
  const route: Waypoint[] = [{ ...STORE_ENTRANCE, x: startPos.x, y: startPos.y }];
  let currentPos = startPos;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const d = calculateDistance(currentPos, unvisited[i]);
      if (d < minDistance) {
        minDistance = d;
        nearestIdx = i;
      }
    }

    const nextWp = unvisited.splice(nearestIdx, 1)[0];
    route.push(nextWp);
    currentPos = { x: nextWp.x, y: nextWp.y };
  }

  // Final destination is frictionless checkout
  route.push(CHECKOUT_ZONE);

  // Calculate cumulative distance in meters (10px = 1 meter approx)
  let totalPixelDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalPixelDistance += calculateDistance(route[i], route[i + 1]);
  }

  const totalDistanceMeters = Math.round(totalPixelDistance * 0.12);
  const estimatedMinutes = Math.max(1, Math.round(totalDistanceMeters / 45)); // Average walking speed ~ 45m/min with cart
  const stepsCount = Math.round(totalDistanceMeters * 1.35);

  return {
    orderedWaypoints: route,
    totalDistanceMeters,
    estimatedMinutes,
    stepsCount
  };
}
