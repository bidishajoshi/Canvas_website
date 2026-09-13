import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Check local development demo credentials
    if (
      email?.trim() === 'admin@affordabledecoration.local' &&
      password === 'Admin@12345'
    ) {
      const response = NextResponse.json({ success: true, redirect: '/admin/dashboard' });
      response.cookies.set('admin_dev_session', 'true', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    }

    // 2. Otherwise try Supabase login
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Invalid admin email or password.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, redirect: '/admin/dashboard' });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Login failed.' },
      { status: 500 }
    );
  }
}
