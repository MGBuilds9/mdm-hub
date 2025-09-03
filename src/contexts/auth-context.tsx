'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User, UserWithDivisions } from '@/types/database';

interface AuthContextType {
  user: UserWithDivisions | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
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
  const [user, setUser] = useState<UserWithDivisions | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (
    supabaseUserId: string
  ): Promise<UserWithDivisions | null> => {
    try {
      console.log('Fetching user profile for:', supabaseUserId);
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
        console.error('Error fetching user profile:', error);
        console.log(
          'This might be normal if the user profile does not exist yet'
        );
        return null;
      }

      console.log('User profile fetched successfully:', data);
      return data as unknown as UserWithDivisions;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  const refreshUser = async () => {
    if (supabaseUser) {
      const userProfile = await fetchUserProfile(supabaseUser.id);
      setUser(userProfile);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        const userProfile = await fetchUserProfile(data.user.id);
        setUser(userProfile);
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signInWithAzure = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<User>
  ) => {
    try {
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
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error };
      }

      // Refresh user data
      await refreshUser();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    console.log('Auth context initializing...');

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('Auth initialization timeout - forcing loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        console.log('Initial session check:', { session: !!session, error });
        clearTimeout(timeout);
        setSession(session);
        setSupabaseUser(session?.user ?? null);

        if (session?.user) {
          console.log('User found in session, fetching profile...');
          fetchUserProfile(session.user.id)
            .then(userProfile => {
              console.log('User profile fetched:', userProfile);
              setUser(userProfile);
              setLoading(false);
            })
            .catch(error => {
              console.error('Error fetching initial user profile:', error);
              setUser(null);
              setLoading(false);
            });
        } else {
          console.log('No user in session');
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Error getting initial session:', error);
        clearTimeout(timeout);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      setSession(session);
      setSupabaseUser(session?.user ?? null);

      if (session?.user) {
        try {
          const userProfile = await fetchUserProfile(session.user.id);
          setUser(userProfile);
        } catch (error) {
          console.error('Error fetching user profile on auth change:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    supabaseUser,
    session,
    loading,
    signInWithEmail,
    signInWithAzure,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
