import { createClient } from '@supabase/supabase-js'

// Safely load environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://avyvigkmcdqawzaydoan.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2eXZpZ2ttY2RxYXd6YXlkb2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDU3ODksImV4cCI6MjA3Njg4MTc4OX0.oo2CotdfNJAQ8ZesoyP4gfJ9pyWoq8CMA4xtWPW4vd0'

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is required but not found in environment variables')
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is required but not found in environment variables')
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
}

// Log successful configuration
console.log('✅ Supabase client configured successfully')
console.log('📍 Supabase URL:', supabaseUrl)

// Create the main Supabase client for general use
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for middleware and server components
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Edge runtime compatible client for middleware
export const createEdgeClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}







