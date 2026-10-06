import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import crypto from 'crypto';

const AUTH_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'affordable-decoration-admin-hmac-secret-key-2026';

/**
 * Generates a cryptographically signed HMAC token for the admin session.
 */
export function generateAdminToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`admin:${timestamp}`)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

/**
 * Verifies an admin session token signature and checks freshness (30 days max age).
 */
export function verifyAdminToken(token?: string | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // 30 days validity
  const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAgeMs) return false;

  const expectedSignature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`admin:${timestampStr}`)
    .digest('hex');

  try {
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

/**
 * Returns boolean checking if the current user has an active, cryptographically verified admin session.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = cookies();
  const adminSessionToken = cookieStore.get('admin_session')?.value;

  // 1. Check signed HMAC token
  if (verifyAdminToken(adminSessionToken)) {
    return true;
  }

  // 2. Fallback check Supabase user profile role
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile && profile.role === 'admin') {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

/**
 * Call at the top of any admin Server Component or Server Action.
 * Redirects unauthenticated users to /admin/login.
 */
export async function requireAdminUser() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    redirect('/admin/login');
  }
  return { id: 'admin-id', email: 'admin@affordabledecoration.local', role: 'admin' };
}
