import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const url =
    rawUrl && rawUrl.startsWith('http')
      ? rawUrl
      : 'https://placeholder-project.supabase.co';
  const anonKey = rawKey || 'placeholder-anon-key';

  let cookieStore: any;
  try {
    cookieStore = cookies();
  } catch {
    cookieStore = { get: () => undefined, set: () => {}, remove: () => {} };
  }

  try {
    return createServerClient(url, anonKey, {
      cookies: {
        get(name: string) {
          try {
            return cookieStore.get(name)?.value;
          } catch {
            return undefined;
          }
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {}
        },
      },
    });
  } catch {
    return createServerClient('https://placeholder-project.supabase.co', 'placeholder-anon-key', {
      cookies: {
        get() {
          return undefined;
        },
        set() {},
        remove() {},
      },
    });
  }
}
