// src/lib/azure-auth.ts
import {
  PublicClientApplication,
  Configuration,
  AccountInfo,
  AuthenticationResult,
  SilentRequest,
  PopupRequest,
  RedirectRequest,
  InteractionRequiredAuthError,
  BrowserAuthError,
  LogLevel,
} from '@azure/msal-browser';

// Azure AD configuration validation with graceful handling
export interface AzureConfig {
  clientId: string;
  authority: string;
  redirectUri: string;
  tenantId?: string;
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Validate Azure AD configuration without throwing during build
export function validateAzureConfig(): {
  isValid: boolean;
  config: AzureConfig | null;
  errors: string[];
} {
  // Skip validation during build/SSR
  if (!isBrowser) {
    return {
      isValid: false,
      config: null,
      errors: ['Not in browser environment'],
    };
  }

  const errors: string[] = [];

  const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
  const authority = process.env.NEXT_PUBLIC_AZURE_AUTHORITY;
  const redirectUri = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI;
  const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID;

  if (!clientId) {
    errors.push('NEXT_PUBLIC_AZURE_CLIENT_ID is required');
  }

  if (!authority && !tenantId) {
    errors.push(
      'NEXT_PUBLIC_AZURE_AUTHORITY or NEXT_PUBLIC_AZURE_TENANT_ID is required'
    );
  }

  if (!redirectUri) {
    errors.push('NEXT_PUBLIC_AZURE_REDIRECT_URI is required');
  }

  const isValid = errors.length === 0;

  if (!isValid) {
    // Don't track errors during build
    if (isBrowser && typeof window !== 'undefined') {
      console.warn('Azure AD configuration incomplete:', errors);
    }
    return { isValid: false, config: null, errors };
  }

  // Construct authority from tenant ID if not provided
  const finalAuthority =
    authority ||
    (tenantId ? `https://login.microsoftonline.com/${tenantId}` : '');

  const config: AzureConfig = {
    clientId: clientId!,
    authority: finalAuthority,
    redirectUri: redirectUri!,
    ...(tenantId ? { tenantId } : {}),
  };

  return { isValid: true, config, errors: [] };
}

// Create MSAL instance with error handling
let msalInstance: PublicClientApplication | null = null;
let initializationPromise: Promise<boolean> | null = null;

export function getMsalInstance(): PublicClientApplication | null {
  return msalInstance;
}

export function isAzureConfigured(): boolean {
  if (!isBrowser) return false;
  return validateAzureConfig().isValid;
}

// Get Azure AD configuration
function getAzureConfig(): Configuration | null {
  const { isValid, config } = validateAzureConfig();

  if (!isValid || !config) {
    return null;
  }

  return {
    auth: {
      clientId: config.clientId,
      authority: config.authority,
      redirectUri: config.redirectUri,
    },
    cache: {
      cacheLocation: 'sessionStorage',
      storeAuthStateInCookie: false,
    },
    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) return;
          if (process.env.NODE_ENV === 'development') {
            console.log(`[MSAL ${level}]: ${message}`);
          }
        },
        piiLoggingEnabled: false,
        logLevel:
          process.env.NODE_ENV === 'development'
            ? LogLevel.Info
            : LogLevel.Error,
      },
    },
  };
}

// Scopes for Microsoft Graph API
export const graphScopes = [
  'https://graph.microsoft.com/User.Read',
  'https://graph.microsoft.com/User.ReadBasic.All',
];

// Initialize MSAL with proper error handling
export const initializeMsal = async (): Promise<boolean> => {
  // Skip initialization if not in browser
  if (!isBrowser) {
    return false;
  }

  // Return existing promise if already initializing
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      const config = getAzureConfig();
      if (!config) {
        console.warn('Azure AD configuration is not available');
        return false;
      }

      msalInstance = new PublicClientApplication(config);
      await msalInstance.initialize();

      return true;
    } catch (error) {
      console.error('Failed to initialize MSAL:', error);
      msalInstance = null;
      return false;
    }
  })();

  return initializationPromise;
};

// Get current Azure AD account with error handling
export const getCurrentAzureAccount = (): AccountInfo | null => {
  if (!msalInstance) {
    return null;
  }

  try {
    const accounts = msalInstance.getAllAccounts();
    return accounts[0] ?? null;
  } catch (error) {
    console.error('Failed to get current account:', error);
    return null;
  }
};

// Check if user is authenticated with Azure AD
export const isAzureAuthenticated = (): boolean => {
  return getCurrentAzureAccount() !== null;
};

// Sign in with Azure AD using popup with redirect fallback
export const signInWithAzure = async (): Promise<{
  success: boolean;
  account?: AccountInfo;
  error?: Error;
}> => {
  try {
    // Ensure MSAL is initialized
    const initialized = await initializeMsal();
    if (!initialized || !msalInstance) {
      return {
        success: false,
        error: new Error(
          'Azure AD is not configured. Please contact your administrator.'
        ),
      };
    }

    const loginRequest: PopupRequest = {
      scopes: graphScopes,
      prompt: 'select_account',
    };

    try {
      // Try popup first
      const response = await msalInstance.loginPopup(loginRequest);
      return { success: true, account: response.account };
    } catch (popupError) {
      // Check if popup was blocked
      if (
        popupError instanceof BrowserAuthError &&
        (popupError.errorCode === 'popup_window_error' ||
          popupError.errorCode === 'user_cancelled' ||
          popupError.message.includes('popup'))
      ) {
        // Fallback to redirect
        const redirectRequest: RedirectRequest = {
          scopes: graphScopes,
          prompt: 'select_account',
        };

        await msalInstance.loginRedirect(redirectRequest);
        return { success: true };
      }

      // Re-throw other errors
      throw popupError;
    }
  } catch (error) {
    console.error('Azure AD sign in failed:', error);
    return { success: false, error: error as Error };
  }
};

// Sign out from Azure AD
export const signOutFromAzure = async (): Promise<{
  success: boolean;
  error?: Error;
}> => {
  try {
    if (!msalInstance) {
      return { success: true }; // Already signed out
    }

    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      return { success: true };
    }

    await msalInstance.logoutPopup({
      account: accounts[0] || null,
      postLogoutRedirectUri: window.location.origin,
    });

    return { success: true };
  } catch (error) {
    console.error('Azure AD sign out failed:', error);
    return { success: false, error: error as Error };
  }
};

// Get access token for Microsoft Graph
export const getAccessToken = async (): Promise<{
  token: string | null;
  error?: Error;
}> => {
  if (!msalInstance) {
    return { token: null, error: new Error('MSAL not initialized') };
  }

  const account = getCurrentAzureAccount();
  if (!account) {
    return { token: null, error: new Error('No authenticated account') };
  }

  const silentRequest: SilentRequest = {
    scopes: graphScopes,
    account,
  };

  try {
    const response = await msalInstance.acquireTokenSilent(silentRequest);
    return { token: response.accessToken };
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      try {
        const response = await msalInstance.acquireTokenPopup({
          scopes: graphScopes,
        });
        return { token: response.accessToken };
      } catch (popupError) {
        return { token: null, error: popupError as Error };
      }
    }
    return { token: null, error: error as Error };
  }
};

// Get user profile from Microsoft Graph
export const getUserProfile = async (): Promise<{
  profile: any | null;
  error?: Error;
}> => {
  const { token, error } = await getAccessToken();

  if (!token || error) {
    return { profile: null, error: error || new Error('No access token') };
  }

  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const profile = await response.json();
    return { profile };
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return { profile: null, error: error as Error };
  }
};

// Azure auth state interface
export interface AzureAuthState {
  isConfigured: boolean;
  isInitialized: boolean;
  hasAccount: boolean;
  error: Error | null;
}

// Get current Azure auth state
export const getAzureAuthState = (): AzureAuthState => {
  return {
    isConfigured: isAzureConfigured(),
    isInitialized: msalInstance !== null,
    hasAccount: isAzureAuthenticated(),
    error: null,
  };
};

// Handle Azure callback after redirect
export const handleAzureCallback = async (): Promise<{
  success: boolean;
  account?: AccountInfo;
  error?: Error;
}> => {
  try {
    const initialized = await initializeMsal();
    if (!initialized || !msalInstance) {
      return {
        success: false,
        error: new Error('Azure AD is not configured'),
      };
    }

    const response = await msalInstance.handleRedirectPromise();
    if (response) {
      return { success: true, account: response.account };
    }

    return { success: true };
  } catch (error) {
    console.error('Azure callback handling failed:', error);
    return { success: false, error: error as Error };
  }
};

// Clear Azure cache
export const clearAzureCache = async (): Promise<{
  success: boolean;
  error?: Error;
}> => {
  if (!msalInstance) {
    return { success: true };
  }

  try {
    // Clear all accounts by logging out
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      await msalInstance.logoutPopup({
        account: accounts[0] || null,
        postLogoutRedirectUri: window.location.origin,
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to clear Azure cache:', error);
    return { success: false, error: error as Error };
  }
};
