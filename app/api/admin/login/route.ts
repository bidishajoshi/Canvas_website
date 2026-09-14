import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    // 1. Check local development demo credentials or fallback master credential
    if (
      (cleanEmail === 'admin@affordabledecoration.local' || cleanEmail === 'admin@affordabledecoration.com.np') &&
      (cleanPassword === 'Admin@12345' || cleanPassword === 'admin')
    ) {
      // Set session cookie directly on cookies() helper as well as response headers
      const cookieStore = cookies();
      cookieStore.set('admin_dev_session', 'true', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
      });

      const response = NextResponse.json({ success: true, redirect: '/admin/dashboard' });
      response.cookies.set('admin_dev_session', 'true', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });
      return response;
    }

    // 2. Otherwise try Supabase login
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Invalid admin email or password.' },
        { status: 401 }
      );
    }

    // Set fallback dev session for easy local authentication persistence
    const cookieStore = cookies();
    cookieStore.set('admin_dev_session', 'true', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    const response = NextResponse.json({ success: true, redirect: '/admin/dashboard' });
    response.cookies.set('admin_dev_session', 'true', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });
    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Login failed.' },
      { status: 500 }
    );
  }
}
