import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// SERVER-ONLY. Uses the service-role key, which bypasses Row Level
// Security entirely. Never import this file from a Client Component,
// and never send SUPABASE_SERVICE_ROLE_KEY to the browser.
//
// Use this exclusively inside app/api/admin/** route handlers, after
// verifying (via lib/supabase/server.ts + profiles.role) that the
// caller is actually an authenticated admin.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
