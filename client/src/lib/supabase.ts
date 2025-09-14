import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    // Validate URL format before creating client
    new URL(SUPABASE_URL); // This will throw if URL is invalid
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    console.log("Frontend Supabase client initialized successfully");
  } catch (error) {
    console.warn("Failed to initialize frontend Supabase client:", error instanceof Error ? error.message : error);
    console.warn("Application will continue without Supabase authentication");
  }
} else {
  console.warn("Supabase environment variables not found. Application will continue without authentication");
}

// Export the supabase client (can be null)
export { supabase };
