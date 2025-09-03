'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  isAzureConfigured,
  initializeMsal,
  getAzureAuthState,
  signInWithAzure,
  signOutFromAzure,
  getCurrentAzureAccount,
  getUserProfile,
  handleAzureCallback,
  clearAzureCache,
  type AzureAuthState,
} from '@/lib/azure-auth';
import type { AccountInfo } from '@azure/msal-browser';
import { telemetry } from '@/lib/telemetry';

export interface UseAzureAuthReturn {
  // State
  isConfigured: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  account: AccountInfo | null;
  userProfile: any | null;

  // Actions
  signIn: () => Promise<{ success: boolean; error?: Error }>;
  signOut: () => Promise<{ success: boolean; error?: Error }>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
  clearCache: () => Promise<{ success: boolean; error?: Error }>;
}

export function useAzureAuth(): UseAzureAuthReturn {
  const [state, setState] = useState<AzureAuthState>({
    isConfigured: false,
    isInitialized: false,
    hasAccount: false,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);

  // Load user profile
  const loadUserProfile = useCallback(async () => {
    try {
      const { profile, error } = await getUserProfile();
      if (error) {
        telemetry.trackError(error, 'azure_profile_load');
        setState(prev => ({ ...prev, error }));
      } else {
        setUserProfile(profile);
      }
    } catch (error) {
      const err = error as Error;
      telemetry.trackError(err, 'azure_profile_load');
      setState(prev => ({ ...prev, error: err }));
    }
  }, []);

  // Initialize Azure auth
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);

      const isConfigured = isAzureConfigured();
      if (!isConfigured) {
        setState(prev => ({
          ...prev,
          isConfigured: false,
          isInitialized: false,
        }));
        return;
      }

      const initialized = await initializeMsal();
      if (!initialized) {
        const error = new Error('Failed to initialize Azure AD');
        setState(prev => ({
          ...prev,
          isConfigured: true,
          isInitialized: false,
          error,
        }));
        return;
      }

      // Handle redirect callback if needed
      const callbackResult = await handleAzureCallback();
      if (callbackResult.success && callbackResult.account) {
        setAccount(callbackResult.account);
      }

      // Get current state
      const authState = getAzureAuthState();
      setState(authState);

      if (authState.hasAccount) {
        const currentAccount = getCurrentAzureAccount();
        setAccount(currentAccount);

        // Load user profile
        await loadUserProfile();
      }
    } catch (error) {
      const err = error as Error;
      telemetry.trackError(err, 'azure_auth_initialize');
      setState(prev => ({ ...prev, error: err }));
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  // Sign in
  const signIn = useCallback(async (): Promise<{
    success: boolean;
    error?: Error;
  }> => {
    try {
      setIsLoading(true);
      setState(prev => ({ ...prev, error: null }));

      const result = await signInWithAzure();
      if (result.success && result.account) {
        setAccount(result.account);
        setState(prev => ({ ...prev, hasAccount: true, error: null }));
        await loadUserProfile();
      } else if (result.error) {
        setState(prev => ({ ...prev, error: result.error! }));
      }

      return result;
    } catch (error) {
      const err = error as Error;
      telemetry.trackError(err, 'azure_auth_signin');
      setState(prev => ({ ...prev, error: err }));
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  // Sign out
  const signOut = useCallback(async (): Promise<{
    success: boolean;
    error?: Error;
  }> => {
    try {
      setIsLoading(true);
      setState(prev => ({ ...prev, error: null }));

      const result = await signOutFromAzure();
      if (result.success) {
        setAccount(null);
        setUserProfile(null);
        setState(prev => ({ ...prev, hasAccount: false, error: null }));
      } else if (result.error) {
        setState(prev => ({ ...prev, error: result.error! }));
      }

      return result;
    } catch (error) {
      const err = error as Error;
      telemetry.trackError(err, 'azure_auth_signout');
      setState(prev => ({ ...prev, error: err }));
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    await loadUserProfile();
  }, [loadUserProfile]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Clear cache
  const clearCache = useCallback(async (): Promise<{
    success: boolean;
    error?: Error;
  }> => {
    try {
      const result = await clearAzureCache();
      if (result.success) {
        setAccount(null);
        setUserProfile(null);
        setState(prev => ({ ...prev, hasAccount: false, error: null }));
      }
      return result;
    } catch (error) {
      const err = error as Error;
      telemetry.trackError(err, 'azure_auth_clear_cache');
      return { success: false, error: err };
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // State
    isConfigured: state.isConfigured,
    isInitialized: state.isInitialized,
    isAuthenticated: state.hasAccount,
    isLoading,
    error: state.error,
    account,
    userProfile,

    // Actions
    signIn,
    signOut,
    refreshProfile,
    clearError,
    clearCache,
  };
}
