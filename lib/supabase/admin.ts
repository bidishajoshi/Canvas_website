import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const url =
    rawUrl && rawUrl.startsWith('http')
      ? rawUrl
      : 'https://placeholder-project.supabase.co';
  const key = rawKey || 'placeholder-service-key';

  try {
    return createSupabaseClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch {
    return createSupabaseClient('https://placeholder-project.supabase.co', 'placeholder-service-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
}
