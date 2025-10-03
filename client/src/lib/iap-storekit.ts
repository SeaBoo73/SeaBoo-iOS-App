/**
 * iOS In-App Purchase usando cordova-plugin-purchase
 * Compatibile con Capacitor, funziona su iOS
 */

import { Capacitor } from '@capacitor/core';

// Declare global CdvPurchase object (from cordova-plugin-purchase)
declare global {
  interface Window {
    CdvPurchase?: any;
  }
}

export interface IAPProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  priceMicros: number;
  currency: string;
}

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  productId?: string;
  error?: string;
}

/**
 * Initialize the purchase plugin
 */
export async function initializeIAP(): Promise<void> {
  if (!isIAPAvailable()) {
    return;
  }

  const { store, ProductType, Platform } = window.CdvPurchase;

  // Register products
  store.register([
    { id: SEABOO_PRODUCTS.BOAT_RENTAL_BASIC, type: ProductType.CONSUMABLE, platform: Platform.APPLE_APPSTORE },
    { id: SEABOO_PRODUCTS.BOAT_RENTAL_PREMIUM, type: ProductType.CONSUMABLE, platform: Platform.APPLE_APPSTORE },
    { id: SEABOO_PRODUCTS.EXPERIENCE_SUNSET, type: ProductType.CONSUMABLE, platform: Platform.APPLE_APPSTORE },
    { id: SEABOO_PRODUCTS.EXPERIENCE_DIVING, type: ProductType.CONSUMABLE, platform: Platform.APPLE_APPSTORE },
    { id: SEABOO_PRODUCTS.EXPERIENCE_FISHING, type: ProductType.CONSUMABLE, platform: Platform.APPLE_APPSTORE },
  ]);

  // Initialize the store
  await store.initialize([Platform.APPLE_APPSTORE]);
}

/**
 * Check if In-App Purchase is available
 */
export function isIAPAvailable(): boolean {
  return Capacitor.isNativePlatform() && 
         Capacitor.getPlatform() === 'ios' && 
         typeof window.CdvPurchase !== 'undefined';
}

/**
 * Get available products
 */
export async function fetchProducts(productIds: string[]): Promise<IAPProduct[]> {
  if (!isIAPAvailable()) {
    throw new Error('In-App Purchase non disponibile');
  }

  const { store } = window.CdvPurchase;
  const products: IAPProduct[] = [];

  for (const id of productIds) {
    const product = store.get(id);
    if (product && product.canPurchase) {
      products.push({
        id: product.id,
        title: product.title || id,
        description: product.description || '',
        price: product.pricing?.price || '€0.00',
        priceMicros: product.pricing?.priceMicros || 0,
        currency: product.pricing?.currency || 'EUR'
      });
    }
  }

  return products;
}

/**
 * Purchase a product
 */
export async function purchaseProduct(
  productId: string,
  bookingId: number
): Promise<PurchaseResult> {
  if (!isIAPAvailable()) {
    return {
      success: false,
      error: 'In-App Purchase non disponibile'
    };
  }

  return new Promise((resolve) => {
    const { store } = window.CdvPurchase;

    // Set up receipt validator
    store.validator = async (receipt: any) => {
      try {
        const response = await fetch('/api/verify-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            receipt: receipt.data,
            transactionId: receipt.id,
            productId,
            bookingId: bookingId.toString()
          })
        });

        if (!response.ok) {
          const error = await response.json();
          return {
            ok: false,
            error: { message: error.error || 'Verifica fallita' }
          };
        }

        return { ok: true };
      } catch (error: any) {
        return {
          ok: false,
          error: { message: error.message || 'Errore di rete' }
        };
      }
    };

    // Listen for purchase events
    store.when().approved((transaction: any) => {
      transaction.finish();
      resolve({
        success: true,
        transactionId: transaction.transactionId,
        productId: transaction.products[0]?.id
      });
    });

    store.when().cancelled(() => {
      resolve({
        success: false,
        error: 'Acquisto annullato'
      });
    });

    store.when().error((error: any) => {
      resolve({
        success: false,
        error: error.message || 'Errore durante l\'acquisto'
      });
    });

    // Start the purchase
    const offer = store.get(productId)?.getOffer();
    if (!offer) {
      resolve({
        success: false,
        error: 'Prodotto non disponibile'
      });
      return;
    }

    store.order(offer);
  });
}

/**
 * Restore purchases
 */
export async function restorePurchases(): Promise<{ count: number; error?: string }> {
  if (!isIAPAvailable()) {
    return { count: 0, error: 'IAP non disponibile' };
  }

  try {
    const { store } = window.CdvPurchase;
    await store.restorePurchases();
    return { count: 0 }; // Il plugin gestisce automaticamente il restore
  } catch (error: any) {
    return {
      count: 0,
      error: error.message || 'Errore durante il ripristino'
    };
  }
}

/**
 * Product IDs - devono corrispondere a quelli in App Store Connect
 */
export const SEABOO_PRODUCTS = {
  BOAT_RENTAL_BASIC: 'it.seaboo.rental.basic',
  BOAT_RENTAL_PREMIUM: 'it.seaboo.rental.premium',
  EXPERIENCE_SUNSET: 'it.seaboo.experience.sunset',
  EXPERIENCE_DIVING: 'it.seaboo.experience.diving',
  EXPERIENCE_FISHING: 'it.seaboo.experience.fishing',
} as const;

/**
 * Map booking price to product ID
 */
export function getProductIdForBooking(totalPrice: number): string {
  if (totalPrice <= 100) {
    return SEABOO_PRODUCTS.BOAT_RENTAL_BASIC;
  } else {
    return SEABOO_PRODUCTS.BOAT_RENTAL_PREMIUM;
  }
}
