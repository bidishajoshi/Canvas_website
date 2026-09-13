'use client';

import { createBrowserClient } from '@supabase/ssr';

// Browser-side Supabase client. Uses the public anon key only —
// row level security policies enforce what an anonymous/customer
// session can read or write.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
