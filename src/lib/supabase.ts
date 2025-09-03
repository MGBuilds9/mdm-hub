import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Server-side Supabase client with service role key
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Helper function to set user context for RLS
export const setUserContext = async (userId: string) => {
  const { error } = await supabase.rpc('set_current_user', {
    user_id: userId
  })
  
  if (error) {
    console.error('Error setting user context:', error)
    throw error
  }
}

// Helper function to get user divisions
export const getUserDivisions = async (userId: string) => {
  const { data, error } = await supabase.rpc('get_user_divisions', {
    user_id: userId
  })
  
  if (error) {
    console.error('Error getting user divisions:', error)
    throw error
  }
  
  return data
}

// Helper function to check project access
export const checkProjectAccess = async (userId: string, projectId: string) => {
  const { data, error } = await supabase.rpc('user_has_project_access', {
    user_id: userId,
    project_id: projectId
  })
  
  if (error) {
    console.error('Error checking project access:', error)
    throw error
  }
  
  return data
}
