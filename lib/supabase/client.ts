'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const url =
    rawUrl && rawUrl.startsWith('http')
      ? rawUrl
      : 'https://placeholder-project.supabase.co';
  const anonKey = rawKey || 'placeholder-anon-key';

  try {
    return createBrowserClient(url, anonKey);
  } catch {
    return createBrowserClient('https://placeholder-project.supabase.co', 'placeholder-anon-key');
  }
}
