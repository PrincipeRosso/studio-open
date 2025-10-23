// Re-export client-side Supabase utilities
export {
  createBrowserSupabaseClient,
  createClient,
  supabase,
  type Database
} from './supabase-client'

// Note: For server-side usage, import from './supabase-server'
// This file is safe to import in client components