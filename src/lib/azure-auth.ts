import {
  PublicClientApplication,
  Configuration,
  AccountInfo,
} from '@azure/msal-browser';

// Azure AD configuration
const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
    authority:
      process.env.NEXT_PUBLIC_AZURE_AUTHORITY ||
      'https://login.microsoftonline.com/common',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Scopes for Microsoft Graph API
export const graphScopes = [
  'https://graph.microsoft.com/User.Read',
  'https://graph.microsoft.com/User.ReadBasic.All',
];

// Initialize MSAL
export const initializeMsal = async () => {
  try {
    await msalInstance.initialize();
    return true;
  } catch (error) {
    console.error('Failed to initialize MSAL:', error);
    return false;
  }
};

// Sign in with Azure AD
export const signInWithAzure = async () => {
  try {
    const loginRequest = {
      scopes: graphScopes,
      prompt: 'select_account',
    };

    const response = await msalInstance.loginPopup(loginRequest);
    return { success: true, account: response.account };
  } catch (error) {
    console.error('Azure AD sign in failed:', error);
    return { success: false, error };
  }
};

// Sign out from Azure AD
export const signOutFromAzure = async () => {
  try {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      await msalInstance.logoutPopup({
        account: accounts[0] || null,
        postLogoutRedirectUri: window.location.origin,
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Azure AD sign out failed:', error);
    return { success: false, error };
  }
};

// Get current Azure AD account
export const getCurrentAzureAccount = (): AccountInfo | null => {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0 ? accounts[0] || null : null;
};

// Get access token for Microsoft Graph
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const account = getCurrentAzureAccount();
    if (!account) {
      return null;
    }

    const tokenRequest = {
      scopes: graphScopes,
      account: account,
    };

    const response = await msalInstance.acquireTokenSilent(tokenRequest);
    return response.accessToken;
  } catch (error) {
    console.error('Failed to acquire token:', error);
    return null;
  }
};

// Get user profile from Microsoft Graph
export const getUserProfile = async (): Promise<any | null> => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return null;
    }

    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
};

// Check if user is authenticated with Azure AD
export const isAzureAuthenticated = (): boolean => {
  return getCurrentAzureAccount() !== null;
};

// Handle Azure AD callback
export const handleAzureCallback = async () => {
  try {
    const response = await msalInstance.handleRedirectPromise();
    if (response && response.account) {
      return { success: true, account: response.account };
    }
    return { success: false };
  } catch (error) {
    console.error('Azure AD callback failed:', error);
    return { success: false, error };
  }
};
