'use client';

import { useAuth } from '@/contexts/auth-context';
import { ServerDashboard } from './server-dashboard';
import { supabase } from '@/lib/supabase';

export function ClientDashboard() {
  const { user, supabaseUser } = useAuth();

  // If Supabase user exists but no profile, show onboarding
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-50 via-white to-primary-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Welcome Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-primary-100 p-8 text-center">
            {/* Logo/Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>

            {/* Welcome Text */}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-3">
              Welcome to MDM
            </h1>
            <p className="text-charcoal-600 text-lg mb-2">
              Your construction project management platform
            </p>
            <p className="text-sm text-charcoal-500 mb-8">
              Let's set up your profile to get started
            </p>

            {/* User Info */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-4 mb-8 border border-primary-200">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-charcoal-900">
                    {supabaseUser?.email || 'User'}
                  </p>
                  <p className="text-sm text-charcoal-600">
                    Ready to get started
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={async () => {
                try {
                  console.log('Creating user profile...');

                  // Ensure we have required data
                  if (!supabaseUser?.email || !supabaseUser?.id) {
                    alert('Missing required user information');
                    return;
                  }

                  // Create user profile using regular client
                  const { data, error } = await supabase.from('users').insert({
                    id: supabaseUser.id, // Use the auth user ID as the primary key
                    email: supabaseUser.email,
                    first_name:
                      supabaseUser.user_metadata?.first_name || 'Michael',
                    last_name:
                      supabaseUser.user_metadata?.last_name || 'Guirguis',
                    is_internal: true,
                    is_active: true,
                  });

                  if (error) {
                    console.error('Error creating profile:', error);
                    alert('Error creating profile: ' + error.message);
                  } else {
                    console.log('Profile created successfully!');
                    window.location.reload();
                  }
                } catch (error) {
                  console.error('Error:', error);
                  alert('Error creating profile');
                }
              }}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
            >
              <span className="flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Create My Profile</span>
              </span>
            </button>

            {/* Features Preview */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="p-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p className="text-xs text-charcoal-600 font-medium">
                  Analytics
                </p>
              </div>
              <div className="p-3">
                <div className="w-8 h-8 bg-success-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-success-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className="text-xs text-charcoal-600 font-medium">Team</p>
              </div>
              <div className="p-3">
                <div className="w-8 h-8 bg-warning-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-warning-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-xs text-charcoal-600 font-medium">
                  Projects
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ServerDashboard />;
}
