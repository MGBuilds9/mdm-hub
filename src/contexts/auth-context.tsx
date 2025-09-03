'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User, UserWithDivisions } from '@/types/database';
import {
  retry,
  retryAuth as performRetryAuth,
  isAuthRetryableError,
} from '@/lib/retry';
import {
  telemetry,
  trackAuthInit,
  trackAuthSuccess,
  trackAuthFailure,
  trackAuthRetry,
} from '@/lib/telemetry';

export interface AuthState {
  user: UserWithDivisions | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  retryCount: number;
  isRetrying: boolean;
}

interface AuthContextType extends AuthState {
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signInWithAzure: () => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    userData: Partial<User>
  ) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  retryAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    supabaseUser: null,
    session: null,
    loading: true,
    error: null,
    retryCount: 0,
    isRetrying: false,
  });

  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => {
    updateAuthState({ error: null });
  }, [updateAuthState]);

  const fetchUserProfile = useCallback(
    async (supabaseUserId: string): Promise<UserWithDivisions | null> => {
      try {
        console.log('Fetching user profile for:', supabaseUserId);

        const result = await performRetryAuth(async () => {
          const { data, error } = await supabase
            .from('users')
            .select(
              `
            *,
            user_divisions (
              *,
              division (*)
            )
          `
            )
            .eq('supabase_user_id', supabaseUserId)
            .single();

          if (error) {
            throw new Error(`Failed to fetch user profile: ${error.message}`);
          }

          return data as unknown as UserWithDivisions;
        });

        if (result.success) {
          console.log('User profile fetched successfully:', result.data);
          return (result.data ?? null) as UserWithDivisions | null;
        } else {
          console.error(
            'Error fetching user profile after retries:',
            result.error
          );
          return null;
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
        return null;
      }
    },
    []
  );

  const refreshUser = useCallback(async () => {
    if (authState.supabaseUser) {
      const userProfile = await fetchUserProfile(authState.supabaseUser.id);
      updateAuthState({ user: userProfile ?? null });
    }
  }, [authState.supabaseUser, fetchUserProfile, updateAuthState]);

  const initializeAuth: () => Promise<void> = useCallback(async () => {
    const startTime = Date.now();
    trackAuthInit('session_check');

    try {
      const result = await performRetryAuth(async () => {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw new Error(`Failed to get session: ${error.message}`);
        }

        return session;
      });

      if (result.success) {
        const session = result.data;
        updateAuthState({
          session: session ?? null,
          supabaseUser: session?.user ?? null,
          error: null,
        });

        if (session?.user) {
          console.log('User found in session, fetching profile...');
          const userProfile = await fetchUserProfile(session.user.id);
          updateAuthState({ user: userProfile });
        } else {
          console.log('No user in session');
          updateAuthState({ user: null });
        }

        const duration = Date.now() - startTime;
        trackAuthSuccess(duration, 'session_check');
        updateAuthState({ loading: false, isRetrying: false });
      } else {
        throw result.error || new Error('Failed to initialize authentication');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      trackAuthFailure(error as Error, 'session_check');
      updateAuthState({
        error: error as Error,
        loading: false,
        isRetrying: false,
      });
    }
  }, [fetchUserProfile, updateAuthState]);

  const retryAuthFlow: () => Promise<void> = useCallback(async () => {
    if (authState.isRetrying) return;

    updateAuthState({
      isRetrying: true,
      retryCount: authState.retryCount + 1,
      error: null,
    });

    trackAuthRetry(authState.retryCount + 1);

    try {
      await initializeAuth();
    } catch (error) {
      updateAuthState({
        error: error as Error,
        isRetrying: false,
      });
    }
  }, [
    authState.isRetrying,
    authState.retryCount,
    updateAuthState,
    initializeAuth,
  ]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        clearError();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { error };
        }

        if (data.user) {
          const userProfile = await fetchUserProfile(data.user.id);
          updateAuthState({
            user: userProfile,
            supabaseUser: data.user,
            session: data.session,
          });
        }

        return { error: null };
      } catch (error) {
        updateAuthState({ error: error as Error });
        return { error };
      }
    },
    [clearError, fetchUserProfile, updateAuthState]
  );

  const signInWithAzure = useCallback(async () => {
    try {
      clearError();

      // Import Azure auth functions dynamically to avoid SSR issues
      const { signInWithAzure: azureSignIn } = await import('@/lib/azure-auth');

      const result = await azureSignIn();

      if (result.success && result.account) {
        // Create or update user profile in Supabase
        // This would typically involve calling your backend API
        // to sync the Azure AD user with your Supabase user
        console.log('Azure AD sign in successful:', result.account);

        // For now, we'll just return success
        // In a real implementation, you'd want to:
        // 1. Get the Azure user profile
        // 2. Create/update the user in your Supabase users table
        // 3. Set up the session

        return { error: null };
      } else {
        return { error: result.error || new Error('Azure AD sign in failed') };
      }
    } catch (error) {
      updateAuthState({ error: error as Error });
      return { error };
    }
  }, [clearError, updateAuthState]);

  const signUp = useCallback(
    async (email: string, password: string, userData: Partial<User>) => {
      try {
        clearError();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: userData.first_name,
              last_name: userData.last_name,
              phone: userData.phone,
              is_internal: userData.is_internal || false,
            },
          },
        });

        if (error) {
          return { error };
        }

        if (data.user) {
          // Create user profile in our custom users table
          const { error: profileError } = await supabase.from('users').insert({
            email: userData.email || email,
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            phone: userData.phone || null,
            is_internal: userData.is_internal || false,
            supabase_user_id: data.user.id,
          });

          if (profileError) {
            console.error('Error creating user profile:', profileError);
          }
        }

        return { error: null };
      } catch (error) {
        updateAuthState({ error: error as Error });
        return { error };
      }
    },
    [clearError, updateAuthState]
  );

  const signOut = useCallback(async () => {
    try {
      clearError();
      const { error } = await supabase.auth.signOut();
      updateAuthState({
        user: null,
        supabaseUser: null,
        session: null,
      });
      return { error };
    } catch (error) {
      updateAuthState({ error: error as Error });
      return { error };
    }
  }, [clearError, updateAuthState]);

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!authState.user) {
        return { error: new Error('No user logged in') };
      }

      try {
        clearError();
        const { error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', authState.user.id);

        if (error) {
          return { error };
        }

        // Refresh user data
        await refreshUser();
        return { error: null };
      } catch (error) {
        updateAuthState({ error: error as Error });
        return { error };
      }
    },
    [authState.user, clearError, refreshUser, updateAuthState]
  );

  useEffect(() => {
    console.log('Auth context initializing...');

    // Initialize authentication
    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);

      updateAuthState({
        session,
        supabaseUser: session?.user ?? null,
      });

      if (session?.user) {
        try {
          const userProfile = await fetchUserProfile(session.user.id);
          updateAuthState({ user: userProfile });
        } catch (error) {
          console.error('Error fetching user profile on auth change:', error);
          updateAuthState({
            user: null,
            error: error as Error,
          });
        }
      } else {
        updateAuthState({ user: null });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, fetchUserProfile, updateAuthState]);

  const value: AuthContextType = {
    ...authState,
    signInWithEmail,
    signInWithAzure,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
    clearError,
    retryAuth: retryAuthFlow,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
