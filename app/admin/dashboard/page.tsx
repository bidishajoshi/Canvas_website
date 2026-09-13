import { createAdminClient } from '@/lib/supabase/admin';
import { formatPaisa } from '@/lib/utils';

async function getCount(table: string, filters?: Record<string, unknown>) {
  const supabase = createAdminClient();
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
  }
  const { count } = await query;
  return count ?? 0;
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [
    totalOrders,
    pendingOrders,
    newInquiries,
    totalProducts,
    totalCustomers,
    { data: revenueRows },
  ] = await Promise.all([
    getCount('orders'),
    getCount('orders', { status: 'pending' }),
    getCount('canvas_inquiries', { status: 'new' }),
    getCount('products'),
    getCount('profiles', { role: 'customer' }),
    supabase.from('orders').select('total_paisa'),
  ]);

  const totalSalesPaisa = (revenueRows ?? []).reduce(
    (sum, row) => sum + (row.total_paisa ?? 0),
    0
  );

  const cards = [
    { label: 'Total Sales', value: formatPaisa(totalSalesPaisa) },
    { label: 'Total Orders', value: totalOrders },
    { label: 'Pending Orders', value: pendingOrders },
    { label: 'New Custom Inquiries', value: newInquiries },
    { label: 'Products', value: totalProducts },
    { label: 'Customers', value: totalCustomers },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-card border border-border p-5">
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
