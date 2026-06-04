import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ override: true });

let cachedClient: any = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabase() {
  // Reload environment variables so we get any updates made at runtime with override true
  dotenv.config({ override: true });

  let supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
  // Strip quotes if present
  if (supabaseUrl.startsWith('"') && supabaseUrl.endsWith('"')) supabaseUrl = supabaseUrl.slice(1, -1);
  if (supabaseUrl.startsWith("'") && supabaseUrl.endsWith("'")) supabaseUrl = supabaseUrl.slice(1, -1);
  // Remove trailing slash if present
  if (supabaseUrl.endsWith('/')) {
    supabaseUrl = supabaseUrl.slice(0, -1);
  }

  let supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim();
  // Strip quotes if present
  if (supabaseServiceKey.startsWith('"') && supabaseServiceKey.endsWith('"')) supabaseServiceKey = supabaseServiceKey.slice(1, -1);
  if (supabaseServiceKey.startsWith("'") && supabaseServiceKey.endsWith("'")) supabaseServiceKey = supabaseServiceKey.slice(1, -1);

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  const isPlaceholderUrl = supabaseUrl.includes('your-project-id') || !supabaseUrl.includes('supabase.co');
  const isPlaceholderKey = supabaseServiceKey.includes('your_anon_key') || supabaseServiceKey.includes('your_service_role_key');

  if (isPlaceholderUrl || isPlaceholderKey) {
    return null;
  }

  // Cache instance unless the configured URL or Key has changed
  if (!cachedClient || cachedUrl !== supabaseUrl || cachedKey !== supabaseServiceKey) {
    try {
      cachedUrl = supabaseUrl;
      cachedKey = supabaseServiceKey;
      cachedClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false
        }
      });
      console.log("Supabase Client initialized/updated with URL:", supabaseUrl);
    } catch (e) {
      console.error("Failed to create Supabase Client:", e);
      return null;
    }
  }

  return cachedClient;
}

// Keep a fallback supabase variable for compatibility
export const supabase = getSupabase();
