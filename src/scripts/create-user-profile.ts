// Script to create user profile for authenticated users
// Run this in your browser console after logging in

import { supabase } from '@/lib/supabase';

export async function createUserProfile() {
  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('No authenticated user found');
      return;
    }

    console.log('Creating profile for user:', user.email);

    // Create user profile
    if (!user.email || !user.id) {
      console.error('Missing required user information');
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        email: user.email,
        first_name: user.user_metadata?.first_name || 'Michael',
        last_name: user.user_metadata?.last_name || 'Guirguis',
        supabase_user_id: user.id,
        is_internal: true,
        is_active: true,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      return;
    }

    console.log('User profile created:', profileData);

    // Assign to a division (you can modify this)
    const { data: divisionData, error: divisionError } = await supabase
      .from('divisions')
      .select('id')
      .eq('name', 'Group')
      .single();

    if (!divisionError && divisionData) {
      const { error: userDivisionError } = await supabase
        .from('user_divisions')
        .insert({
          user_id: profileData.id,
          division_id: divisionData.id,
          role: 'admin',
        });

      if (userDivisionError) {
        console.error('Error assigning division:', userDivisionError);
      } else {
        console.log('User assigned to division successfully');
      }
    }

    // Refresh the page to load the new profile
    window.location.reload();
  } catch (error) {
    console.error('Error in createUserProfile:', error);
  }
}

// Make it available globally for console use
(window as any).createUserProfile = createUserProfile;
