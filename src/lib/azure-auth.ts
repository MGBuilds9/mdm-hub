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
import { telemetry } from './telemetry';

// Azure AD configuration validation
export interface AzureConfig {
  clientId: string;
  authority: string;
  redirectUri: string;
  tenantId?: string;
}

export interface AzureAuthState {
  isConfigured: boolean;
  isInitialized: boolean;
  hasAccount: boolean;
  error: Error | null;
}

// Validate Azure AD configuration
export function validateAzureConfig(): {
  isValid: boolean;
  config: AzureConfig | null;
  errors: string[];
} {
  const errors: string[] = [];

  const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
  const authority = process.env.NEXT_PUBLIC_AZURE_AUTHORITY;
  const redirectUri = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI;
  const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID;

  if (!clientId) {
    errors.push('NEXT_PUBLIC_AZURE_CLIENT_ID is required');
  }

  if (!authority) {
    errors.push('NEXT_PUBLIC_AZURE_AUTHORITY is required');
  }

  if (!redirectUri) {
    errors.push('NEXT_PUBLIC_AZURE_REDIRECT_URI is required');
  }

  if (!tenantId) {
    errors.push('NEXT_PUBLIC_AZURE_TENANT_ID is required');
  }

  const isValid = errors.length === 0;

  if (!isValid) {
    telemetry.trackError(
      new Error(`Azure AD configuration invalid: ${errors.join(', ')}`),
      'azure_config_validation'
    );
    return { isValid: false, config: null, errors };
  }

  const config: AzureConfig = {
    clientId: clientId!,
    authority: authority!,
    redirectUri: redirectUri!,
    ...(tenantId ? { tenantId } : {}),
  } as AzureConfig;

  return { isValid: true, config, errors: [] };
}

// Check if Azure is configured using the configuration service
export function isAzureConfiguredFromService(): boolean {
  try {
    const { getAzureConfig } = require('@/services/config.service');
    const azureConfig = getAzureConfig();
    return azureConfig.enabled;
  } catch {
    // Fallback to direct validation if config service not available
    return isAzureConfigured();
  }
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

// Create MSAL instance with error handling
let msalInstance: PublicClientApplication | null = null;
let initializationPromise: Promise<boolean> | null = null;

export function getMsalInstance(): PublicClientApplication | null {
  return msalInstance;
}

export function isAzureConfigured(): boolean {
  return validateAzureConfig().isValid;
}

// Scopes for Microsoft Graph API
export const graphScopes = [
  'https://graph.microsoft.com/User.Read',
  'https://graph.microsoft.com/User.ReadBasic.All',
];

// Initialize MSAL with proper error handling
export const initializeMsal = async (): Promise<boolean> => {
  // Return existing promise if already initializing
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      const config = getAzureConfig();
      if (!config) {
        const error = new Error('Azure AD configuration is invalid');
        telemetry.trackError(error, 'azure_msal_init');
        throw error;
      }

      msalInstance = new PublicClientApplication(config);
      await msalInstance.initialize();

      telemetry.track({
        event: 'azure_msal_initialized',
        properties: { success: true },
      });

      return true;
    } catch (error) {
      telemetry.trackError(error as Error, 'azure_msal_init');
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
    // With noUncheckedIndexedAccess, accounts[0] can be undefined
    return accounts[0] ?? null;
  } catch (error) {
    telemetry.trackError(error as Error, 'azure_get_account');
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
      const error = new Error(
        'Azure AD is not properly configured or initialized'
      );
      telemetry.trackError(error, 'azure_signin_init');
      return { success: false, error };
    }

    const loginRequest: PopupRequest = {
      scopes: graphScopes,
      prompt: 'select_account',
    };

    telemetry.track({
      event: 'azure_signin_attempt',
      properties: { method: 'popup' },
    });

    try {
      // Try popup first
      const response = await msalInstance.loginPopup(loginRequest);

      telemetry.track({
        event: 'azure_signin_success',
        properties: { method: 'popup' },
      });

      return { success: true, account: response.account };
    } catch (popupError) {
      // Check if popup was blocked
      if (
        popupError instanceof BrowserAuthError &&
        (popupError.errorCode === 'popup_window_error' ||
          popupError.errorCode === 'user_cancelled' ||
          popupError.message.includes('popup'))
      ) {
        telemetry.track({
          event: 'azure_signin_popup_blocked',
          properties: { error: popupError.message },
        });

        // Fallback to redirect
        return await signInWithAzureRedirect();
      }

      // Re-throw other errors
      throw popupError;
    }
  } catch (error) {
    telemetry.trackError(error as Error, 'azure_signin');
    console.error('Azure AD sign in failed:', error);
    return { success: false, error: error as Error };
  }
};

// Sign in with Azure AD using redirect flow
export const signInWithAzureRedirect = async (): Promise<{
  success: boolean;
  account?: AccountInfo;
  error?: Error;
}> => {
  try {
    if (!msalInstance) {
      const error = new Error('Azure AD is not initialized');
      return { success: false, error };
    }

    const loginRequest: RedirectRequest = {
      scopes: graphScopes,
      prompt: 'select_account',
    };

    telemetry.track({
      event: 'azure_signin_attempt',
      properties: { method: 'redirect' },
    });

    await msalInstance.loginRedirect(loginRequest);

    // Redirect flow doesn't return immediately
    return { success: true };
  } catch (error) {
    telemetry.trackError(error as Error, 'azure_signin_redirect');
    console.error('Azure AD redirect sign in failed:', error);
    return { success: false, error: error as Error };
  }
};

// Sign out from Azure AD with popup/redirect fallback
export const signOutFromAzure = async (): Promise<{
  success: boolean;
  error?: Error;
}> => {
  try {
    if (!msalInstance) {
      const error = new Error('Azure AD is not initialized');
      return { success: false, error };
    }

    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      return { success: true };
    }

    telemetry.track({
      event: 'azure_signout_attempt',
      properties: { method: 'popup' },
    });

    try {
      // Try popup logout first
      await msalInstance.logoutPopup({
        account: accounts[0]!,
        postLogoutRedirectUri: window.location.origin,
      });

      telemetry.track({
        event: 'azure_signout_success',
        properties: { method: 'popup' },
      });

      return { success: true };
    } catch (popupError) {
      // Check if popup was blocked
      if (
        popupError instanceof BrowserAuthError &&
        (popupError.errorCode === 'popup_window_error' ||
          popupError.message.includes('popup'))
      ) {
        telemetry.track({
          event: 'azure_signout_popup_blocked',
          properties: { error: popupError.message },
        });

        // Fallback to redirect logout
        await msalInstance.logoutRedirect({
          account: accounts[0]!,
          postLogoutRedirectUri: window.location.origin,
        });

        return { success: true };
      }

      throw popupError;
    }
  } catch (error) {
    telemetry.trackError(error as Error, 'azure_signout');
    console.error('Azure AD sign out failed:', error);
    return { success: false, error: error as Error };
  }
};

// Get access token for Microsoft Graph with proper caching and refresh
export const getAccessToken = async (): Promise<{
  token: string | null;
  error?: Error;
}> => {
  try {
    if (!msalInstance) {
      const error = new Error('Azure AD is not initialized');
      return { token: null, error };
    }

    const account = getCurrentAzureAccount();
    if (!account) {
      return { token: null, error: new Error('No Azure AD account found') };
    }

    const tokenRequest: SilentRequest = {
      scopes: graphScopes,
      account: account,
    };

    telemetry.track({
      event: 'azure_token_request',
      properties: { method: 'silent' },
    });

    try {
      // Try to get token silently first (from cache)
      const response = await msalInstance.acquireTokenSilent(tokenRequest);

      telemetry.track({
        event: 'azure_token_success',
        properties: { method: 'silent' },
      });

      return { token: response.accessToken };
    } catch (silentError) {
      // If silent token acquisition fails, try interactive
      if (silentError instanceof InteractionRequiredAuthError) {
        telemetry.track({
          event: 'azure_token_interactive_required',
          properties: { error: silentError.message },
        });

        try {
          // Try popup first
          const response = await msalInstance.acquireTokenPopup(tokenRequest);

          telemetry.track({
            event: 'azure_token_success',
            properties: { method: 'popup' },
          });

          return { token: response.accessToken };
        } catch (popupError) {
          // Check if popup was blocked
          if (
            popupError instanceof BrowserAuthError &&
            (popupError.errorCode === 'popup_window_error' ||
              popupError.message.includes('popup'))
          ) {
            telemetry.track({
              event: 'azure_token_popup_blocked',
              properties: { error: popupError.message },
            });

            // Fallback to redirect
            await msalInstance.acquireTokenRedirect(tokenRequest);
            return { token: null }; // Redirect doesn't return immediately
          }

          throw popupError;
        }
      }

      throw silentError;
    }
  } catch (error) {
    telemetry.trackError(error as Error, 'azure_token_acquisition');
    console.error('Failed to acquire token:', error);
    return { token: null, error: error as Error };
  }
};

// Get user profile from Microsoft Graph
export const getUserProfile = async (): Promise<{
  profile: any | null;
  error?: Error;
}> => {
  try {
    const { token, error } = await getAccessToken();
    if (error || !token) {
      return {
        profile: null,
        error: error || new Error('No access token available'),
      };
    }

    telemetry.track({
      event: 'azure_graph_request',
      properties: { endpoint: 'me' },
    });

    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = new Error(
        `Failed to fetch user profile: ${response.status} ${response.statusText}`
      );
      telemetry.trackError(error, 'azure_graph_request');
      return { profile: null, error };
    }

    const profile = await response.json();

    telemetry.track({
      event: 'azure_graph_success',
      properties: { endpoint: 'me' },
    });

    return { profile };
  } catch (error) {
    telemetry.trackError(error as Error, 'azure_graph_request');
    console.error('Failed to get user profile:', error);
    return { profile: null, error: error as Error };
  }
};

// Handle Azure AD callback for redirect flow
export const handleAzureCallback = async (): Promise<{
  success: boolean;
  account?: AccountInfo;
  error?: Error;
}> => {
  try {
    if (!msalInstance) {
      const error = new Error('Azure AD is not initialized');
      return { success: false, error };
    }

    telemetry.track({
      event: 'azure_callback_handling',
      properties: { method: 'redirect' },
    });

    const response = await msalInstance.handleRedirectPromise();
    if (response && response.account) {
      telemetry.track({
        event: 'azure_callback_success',
        properties: { method: 'redirect' },
      });
      return { success: true, account: response.account };
    }

    return { success: false };
  } catch (error) {
    telemetry.trackError(error as Error, 'azure_callback');
    console.error('Azure AD callback failed:', error);
    return { success: false, error: error as Error };
  }
};

// Get Azure AD authentication state
export const getAzureAuthState = (): AzureAuthState => {
  const isConfigured = isAzureConfigured();
  const isInitialized = msalInstance !== null;
  const hasAccount = isAzureAuthenticated();

  return {
    isConfigured,
    isInitialized,
    hasAccount,
    error: null,
  };
};

// Clear Azure AD cache
export const clearAzureCache = async (): Promise<{
  success: boolean;
  error?: Error;
}> => {
  try {
    if (!msalInstance) {
      return { success: true };
    }

    const accounts = msalInstance.getAllAccounts();
    for (const account of accounts) {
      const tokenCache: any = msalInstance.getTokenCache();
      if (typeof tokenCache.removeAccount === 'function') {
        await tokenCache.removeAccount(account);
      }
    }

    telemetry.track({
      event: 'azure_cache_cleared',
      properties: { accountCount: accounts.length },
    });

    return { success: true };
  } catch (error) {
    telemetry.trackError(error as Error, 'azure_cache_clear');
    return { success: false, error: error as Error };
  }
};
