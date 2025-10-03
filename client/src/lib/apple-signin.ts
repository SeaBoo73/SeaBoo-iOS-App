import { SignInWithApple, SignInWithAppleResponse, SignInWithAppleOptions } from '@capacitor-community/apple-sign-in';
import { Capacitor } from '@capacitor/core';

export interface AppleAuthResult {
  success: boolean;
  user?: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    userType?: string;
  };
  error?: string;
}

/**
 * Perform Apple Sign In using Capacitor plugin
 * This will open the native Apple Sign In UI on iOS
 */
export async function signInWithApple(): Promise<AppleAuthResult> {
  try {
    // Check if running on iOS
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      return {
        success: false,
        error: 'Apple Sign In è disponibile solo su iOS'
      };
    }

    // Configure Apple Sign In options
    const options: SignInWithAppleOptions = {
      clientId: 'it.seaboo.app', // Your app bundle ID
      redirectURI: 'https://seaboo.it/auth/apple/callback',
      scopes: 'email name',
      state: Math.random().toString(36).substring(7), // Random state for security
      nonce: Math.random().toString(36).substring(7)  // Random nonce
    };

    // Open Apple Sign In native UI
    const result: SignInWithAppleResponse = await SignInWithApple.authorize(options);

    // Extract the identity token
    const identityToken = result.response.identityToken;
    const authorizationCode = result.response.authorizationCode;

    if (!identityToken) {
      return {
        success: false,
        error: 'Nessun token ricevuto da Apple'
      };
    }

    // Send token to backend for verification
    const response = await fetch('/api/auth/apple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        identityToken,
        authorizationCode,
        user: result.response.user // Contains firstName, lastName if first sign in
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Errore durante l\'autenticazione con Apple'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      user: data.user
    };

  } catch (error: any) {
    console.error('Apple Sign In error:', error);
    
    // Handle user cancellation
    if (error.code === 'ERR_CANCELED') {
      return {
        success: false,
        error: 'Login annullato'
      };
    }

    return {
      success: false,
      error: error.message || 'Errore durante l\'autenticazione con Apple'
    };
  }
}

/**
 * Check if Apple Sign In is available on this device
 */
export async function isAppleSignInAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return false;
  }

  try {
    // The plugin will throw if not available
    await SignInWithApple.authorize({
      clientId: 'it.seaboo.app',
      redirectURI: 'https://seaboo.it',
      scopes: 'email',
      state: 'check',
      nonce: 'check'
    });
    return true;
  } catch {
    return false;
  }
}
