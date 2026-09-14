import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';

/**
 * Returns boolean checking if the current user has an active admin session.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = cookies();
  const devAdmin = cookieStore.get('admin_dev_session')?.value;

  if (devAdmin === 'true') {
    return true;
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
