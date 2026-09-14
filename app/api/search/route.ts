import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q.trim()) {
    return NextResponse.json({ products: [] });
  }

  const supabase = createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${q}%,short_description.ilike.%${q}%,material.ilike.%${q}%`)
    .eq('status', 'published')
    .limit(10);

  return NextResponse.json({ products: products || [] });
}
