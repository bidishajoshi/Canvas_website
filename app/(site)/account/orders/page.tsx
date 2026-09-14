import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatPaisa } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AccountOrdersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/account/orders');

  const { data: orders } = await supabase
    .from('orders')
    .select('order_number, status, total_paisa, created_at')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-2xl font-semibold">My Orders</h1>

      <ul className="mt-6 space-y-2">
        {(orders ?? []).map((order) => (
          <li key={order.order_number}>
            <Link
              href={`/account/orders/${order.order_number}`}
              className="flex items-center justify-between rounded-card border border-border p-4 text-sm hover:bg-surface"
            >
              <span>{order.order_number}</span>
              <span className="capitalize text-muted">{order.status}</span>
              <span className="font-medium">{formatPaisa(order.total_paisa)}</span>
            </Link>
          </li>
        ))}
        {(!orders || orders.length === 0) && (
          <p className="text-sm text-muted">You haven&apos;t placed any orders yet.</p>
        )}
      </ul>
    </div>
  );
}
