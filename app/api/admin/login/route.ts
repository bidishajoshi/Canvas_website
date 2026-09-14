import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    const envAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const envAdminPassword = (process.env.ADMIN_PASSWORD || '').trim();

    const validAdminEmails = [
      'admin@affordabledecoration.com',
      'admin@affordabledecoration.com.np',
      'admin@affordabledecoration.local',
      ...(envAdminEmail ? [envAdminEmail] : []),
    ];

    const validAdminPasswords = [
      'Admin@12345',
      'admin123',
      'Admin12345',
      'admin',
      ...(envAdminPassword ? [envAdminPassword] : []),
    ];

    // 1. Check Master Admin Credentials (works both in local dev & after deployment)
    if (validAdminEmails.includes(cleanEmail) && validAdminPasswords.includes(cleanPassword)) {
      const cookieStore = cookies();
      cookieStore.set('admin_dev_session', 'true', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days session
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      const response = NextResponse.json({ success: true, redirect: '/admin/dashboard' });
      response.cookies.set('admin_dev_session', 'true', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }

    // 2. Try Supabase Auth Login fallback
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (!error && data.user) {
        const cookieStore = cookies();
        cookieStore.set('admin_dev_session', 'true', {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });

        const response = NextResponse.json({ success: true, redirect: '/admin/dashboard' });
        response.cookies.set('admin_dev_session', 'true', {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });
        return response;
      }
    } catch {
      // Supabase unconfigured or offline
    }

    return NextResponse.json(
      { error: 'Invalid admin email or password.' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Login failed.' },
      { status: 500 }
    );
  }
}
