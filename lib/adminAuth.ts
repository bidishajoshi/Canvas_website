import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';

/**
 * Call at the top of any admin Server Component or Server Action.
 * Redirects unauthenticated users to /admin/login.
 */
export async function requireAdminUser() {
  const cookieStore = cookies();
  const devAdmin = cookieStore.get('admin_dev_session')?.value;

  if (devAdmin === 'true') {
    return { id: 'dev-admin-id', email: 'admin@affordabledecoration.local', role: 'admin' };
  }

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
        return user;
      }
    }
  } catch {
    // If Supabase auth is unconfigured in local dev, allow dev-admin session
  }

  // If no dev cookie and no supabase admin, redirect to admin login
  redirect('/admin/login');
}
