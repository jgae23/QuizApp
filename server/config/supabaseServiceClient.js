// config/supabaseServiceClient.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,  // Prevents storing session in local storage
      autoRefreshToken: false,  // Disables automatic token refresh
      detectSessionInUrl: false  // Prevents parsing auth tokens from URL
    },
    // Optional additional configurations
    global: {
      headers: {
        // Use the service role authorization header
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    }
  }
);

export default supabase;
