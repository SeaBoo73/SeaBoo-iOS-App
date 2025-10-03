/**
 * iOS In-App Purchase (StoreKit) Integration
 * Uses Capacitor bridge to call native Swift code
 * 
 * IMPORTANT: Requires native iOS Swift implementation in the Xcode project
 */

import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';

export interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceValue: number;
  currency: string;
}

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  productId?: string;
  receipt?: string;
  error?: string;
}

// Define the plugin interface
interface StoreKitPlugin {
  getProducts(options: { productIds: string[] }): Promise<{ products: IAPProduct[] }>;
  purchase(options: { productId: string }): Promise<PurchaseResult>;
  restorePurchases(): Promise<{ transactions: any[] }>;
  finishTransaction(options: { transactionId: string }): Promise<void>;
}

// Register the plugin (will be implemented in native iOS code)
const StoreKit = registerPlugin<StoreKitPlugin>('StoreKit');

/**
 * Check if In-App Purchase is available (iOS only)
 */
export function isIAPAvailable(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

/**
 * Fetch available products from StoreKit
 */
export async function fetchProducts(productIds: string[]): Promise<IAPProduct[]> {
  if (!isIAPAvailable()) {
    throw new Error('In-App Purchase non disponibile su questa piattaforma');
  }

  try {
    const response = await StoreKit.getProducts({ productIds });
    return response.products;
  } catch (error: any) {
    console.error('Error fetching products:', error);
    throw new Error('Impossibile caricare i prodotti disponibili');
  }
}

/**
 * Purchase a product using StoreKit
 * @param productId - The product identifier (e.g., "it.seaboo.rental.basic")
 * @param bookingId - The booking ID to associate with this purchase
 */
export async function purchaseProduct(
  productId: string, 
  bookingId: number
): Promise<PurchaseResult> {
  if (!isIAPAvailable()) {
    return {
      success: false,
      error: 'In-App Purchase non disponibile su questa piattaforma'
    };
  }

  try {
    // Call native StoreKit purchase
    const purchaseResponse = await StoreKit.purchase({ productId });
    
    if (!purchaseResponse.receipt) {
      return {
        success: false,
        error: 'Nessuna ricevuta ricevuta da Apple'
      };
    }

    const transactionId = purchaseResponse.transactionId!;
    const receipt = purchaseResponse.receipt;

    // Verify receipt with backend
    const verifyResponse = await fetch('/api/verify-purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        receipt,
        transactionId,
        productId,
        bookingId: bookingId.toString()
      })
    });

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json();
      
      // Finish the transaction even if backend verification fails
      try {
        await StoreKit.finishTransaction({ transactionId });
      } catch (e) {
        console.error('Failed to finish transaction:', e);
      }
      
      return {
        success: false,
        error: error.error || 'Verifica pagamento fallita'
      };
    }

    const result = await verifyResponse.json();

    // Finish the transaction successfully
    await StoreKit.finishTransaction({ transactionId });

    return {
      success: true,
      transactionId,
      productId
    };

  } catch (error: any) {
    console.error('Purchase error:', error);
    
    // Handle user cancellation
    if (error.code === 'ERR_PAYMENT_CANCELLED' || error.message?.includes('cancelled')) {
      return {
        success: false,
        error: 'Acquisto annullato'
      };
    }

    return {
      success: false,
      error: error.message || 'Errore durante l\'acquisto'
    };
  }
}

/**
 * Restore previous purchases (required by Apple App Store guidelines)
 */
export async function restorePurchases(): Promise<{ count: number; error?: string }> {
  if (!isIAPAvailable()) {
    return {
      count: 0,
      error: 'In-App Purchase non disponibile su questa piattaforma'
    };
  }

  try {
    const response = await StoreKit.restorePurchases();
    
    if (response.transactions && response.transactions.length > 0) {
      // Process each restored transaction
      for (const transaction of response.transactions) {
        try {
          await fetch('/api/restore-purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              transactionId: transaction.transactionId,
              productId: transaction.productId,
              receipt: transaction.receipt
            })
          });
        } catch (error) {
          console.error('Error restoring transaction:', transaction.transactionId, error);
        }
      }
      
      return { count: response.transactions.length };
    }
    
    return { count: 0 };
  } catch (error: any) {
    console.error('Restore purchases error:', error);
    return {
      count: 0,
      error: 'Errore durante il ripristino acquisti'
    };
  }
}

/**
 * Product IDs for SeaBoo experiences/bookings
 * These MUST match the products configured in App Store Connect
 */
export const SEABOO_PRODUCTS = {
  BOAT_RENTAL_BASIC: 'it.seaboo.rental.basic',
  BOAT_RENTAL_PREMIUM: 'it.seaboo.rental.premium',
  EXPERIENCE_SUNSET: 'it.seaboo.experience.sunset',
  EXPERIENCE_DIVING: 'it.seaboo.experience.diving',
  EXPERIENCE_FISHING: 'it.seaboo.experience.fishing',
} as const;

/**
 * Get product ID for a booking based on price
 * This maps SeaBoo booking prices to App Store product IDs
 */
export function getProductIdForBooking(totalPrice: number): string {
  // Map price ranges to product IDs
  if (totalPrice <= 100) {
    return SEABOO_PRODUCTS.BOAT_RENTAL_BASIC;
  } else if (totalPrice <= 500) {
    return SEABOO_PRODUCTS.BOAT_RENTAL_PREMIUM;
  } else {
    // For higher prices, use premium
    return SEABOO_PRODUCTS.BOAT_RENTAL_PREMIUM;
  }
}
