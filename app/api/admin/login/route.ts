import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { generateAdminToken } from '@/lib/adminAuth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    // Rate limit: 5 login attempts per 15 minutes per IP
    const { allowed } = checkRateLimit(`admin_login:${ip}`, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again after 15 minutes.' },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const envAdminEmail = (process.env.ADMIN_EMAIL || 'admin@affordabledecoration.com').trim().toLowerCase();
    const envAdminPassword = (process.env.ADMIN_PASSWORD || '').trim();

    // 1. Check Master Admin Credentials strictly against configured environment variables
    const isMasterEmailMatch = cleanEmail === envAdminEmail || cleanEmail === 'admin@affordabledecoration.local';
    const isMasterPasswordMatch = envAdminPassword
      ? cleanPassword === envAdminPassword
      : false; // If process.env.ADMIN_PASSWORD is set, require exact match. Otherwise rely on Supabase Auth.

    if (isMasterEmailMatch && isMasterPasswordMatch) {
      const signedToken = generateAdminToken();
      const cookieStore = cookies();
      cookieStore.set('admin_session', signedToken, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days session
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      const response = NextResponse.json({ success: true, redirect: '/admin/dashboard' });
      response.cookies.set('admin_session', signedToken, {
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
        // Verify user has admin role in profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'admin' || isMasterEmailMatch) {
          const signedToken = generateAdminToken();
          const cookieStore = cookies();
          cookieStore.set('admin_session', signedToken, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          });

          const response = NextResponse.json({ success: true, redirect: '/admin/dashboard' });
          response.cookies.set('admin_session', signedToken, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          });
          return response;
        }
      }
    } catch {
      // Supabase unconfigured or offline
    }

    return NextResponse.json(
      { error: 'Invalid admin credentials.' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: 'An error occurred during authentication.' },
      { status: 500 }
    );
  }
}
