import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';

/**
 * Call at the top of any admin Server Component or Server Action.
 * Redirects unauthenticated users to /login, and non-admin users to /.
 * This is the defense-in-depth check that must happen BEFORE using
 * lib/supabase/admin.ts (the service-role client that bypasses RLS).
 */
export async function requireAdminUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin/dashboard');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  return user;
}
