import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = createClient();
  let user: { id: string; email: string } | null = null;

  try {
    const {
      data: { user: sbUser },
    } = await supabase.auth.getUser();
    if (sbUser && sbUser.email) {
      user = { id: sbUser.id, email: sbUser.email };
    }
  } catch {}

  if (!user) {
    const cookieStore = cookies();
    const demoEmail = cookieStore.get('ad_demo_user')?.value;
    if (demoEmail) {
      user = { id: 'demo-user', email: decodeURIComponent(demoEmail) };
    }
  }

  if (!user) redirect('/login?redirect=/account');

  let profile: any = null;
  let recentOrders: any[] | null = null;

  try {
    const [profileRes, ordersRes] = await Promise.all([
      supabase.from('profiles').select('full_name, phone').eq('id', user.id).single(),
      supabase.from('orders').select('order_number, status, total_paisa, created_at').eq('customer_id', user.id).order('created_at', { ascending: false }).limit(5),
    ]);
    profile = profileRes.data;
    recentOrders = ordersRes.data;
  } catch {}

  return (
    <div className="container-page py-10 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          👤 Customer Dashboard
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight text-text mt-2">
          My Account
        </h1>
        <p className="mt-1 text-sm text-muted">
          Signed in as <span className="font-bold text-text">{profile?.full_name || user.email}</span>
          {profile?.phone ? ` — ${profile.phone}` : ''}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/account/orders"
          className="rounded-2xl border border-border bg-surface p-5 shadow-sm hover:border-amber-600 transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <h2 className="font-bold text-text group-hover:text-amber-600 transition-colors">Orders</h2>
              <p className="text-xs text-muted mt-0.5">Track and view your past orders</p>
            </div>
          </div>
        </Link>
        <Link
          href="/account/inquiries"
          className="rounded-2xl border border-border bg-surface p-5 shadow-sm hover:border-amber-600 transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🖼️</span>
            <div>
              <h2 className="font-bold text-text group-hover:text-amber-600 transition-colors">Canvas Inquiries</h2>
              <p className="text-xs text-muted mt-0.5">See custom photo proof status</p>
            </div>
          </div>
        </Link>
        <Link
          href="/wishlist"
          className="rounded-2xl border border-border bg-surface p-5 shadow-sm hover:border-pink-500 transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">❤️</span>
            <div>
              <h2 className="font-bold text-text group-hover:text-pink-600 transition-colors">Wishlist</h2>
              <p className="text-xs text-muted mt-0.5">Items you&apos;ve saved for later</p>
            </div>
          </div>
        </Link>
      </div>

      {recentOrders && recentOrders.length > 0 && (
        <div className="space-y-3 pt-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Recent Orders</h2>
          <ul className="space-y-2">
            {recentOrders.map((order) => (
              <li key={order.order_number}>
                <Link
                  href={`/account/orders/${order.order_number}`}
                  className="flex justify-between rounded-xl border border-border bg-surface p-4 text-sm hover:bg-surface-hover transition-colors"
                >
                  <span className="font-bold font-mono text-text">{order.order_number}</span>
                  <span className="capitalize text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md">
                    {order.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
