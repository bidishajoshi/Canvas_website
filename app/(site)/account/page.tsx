import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/account');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .single();

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('order_number, status, total_paisa, created_at')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold">My Account</h1>
      <p className="mt-1 text-muted">
        {profile?.full_name ?? user.email}
        {profile?.phone ? ` — ${profile.phone}` : ''}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/account/orders" className="rounded-card border border-border p-5 hover:bg-surface">
          <h2 className="font-semibold">Orders</h2>
          <p className="mt-1 text-sm text-muted">Track and view your past orders</p>
        </Link>
        <Link href="/account/inquiries" className="rounded-card border border-border p-5 hover:bg-surface">
          <h2 className="font-semibold">Custom Canvas Inquiries</h2>
          <p className="mt-1 text-sm text-muted">See the status of your custom requests</p>
        </Link>
        <Link href="/account/wishlist" className="rounded-card border border-border p-5 hover:bg-surface">
          <h2 className="font-semibold">Wishlist</h2>
          <p className="mt-1 text-sm text-muted">Items you&apos;ve saved for later</p>
        </Link>
      </div>

      {recentOrders && recentOrders.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold">Recent Orders</h2>
          <ul className="mt-3 space-y-2">
            {recentOrders.map((order) => (
              <li key={order.order_number}>
                <Link
                  href={`/account/orders/${order.order_number}`}
                  className="flex justify-between rounded-card border border-border p-3 text-sm hover:bg-surface"
                >
                  <span>{order.order_number}</span>
                  <span className="capitalize text-muted">{order.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
