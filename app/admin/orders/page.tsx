import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPaisa } from '@/lib/utils';
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect';

export default async function AdminOrdersPage() {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        name_snapshot,
        image_snapshot_url,
        size_snapshot,
        frame_snapshot,
        quantity,
        subtotal_paisa
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Order Management</h1>
          <p className="text-xs text-muted mt-1">
            Track customer canvas orders, custom photo uploads, delivery addresses &amp; status updates.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-hover text-xs font-semibold uppercase tracking-wider text-muted border-b border-border">
            <tr>
              <th className="p-4">Order #</th>
              <th className="p-4">Customer Details</th>
              <th className="p-4">Items &amp; Customization</th>
              <th className="p-4">Total Price</th>
              <th className="p-4">Status Workflow</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(orders ?? []).map((order) => (
              <tr key={order.id} className="hover:bg-surface-hover/50 transition-colors">
                <td className="p-4 font-mono font-bold text-amber-600 text-sm">
                  {order.order_number}
                </td>
                <td className="p-4">
                  <p className="font-semibold text-text">{order.guest_name}</p>
                  <p className="text-xs text-muted">{order.guest_phone}</p>
                  {order.shipping_address && (
                    <p className="text-[11px] text-muted mt-1 max-w-[200px] truncate">
                      {[
                        order.shipping_address.tole_area,
                        order.shipping_address.municipality,
                        order.shipping_address.district,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                </td>
                <td className="p-4 space-y-1">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="text-xs flex items-center gap-2">
                      {item.image_snapshot_url && (
                        <a
                          href={item.image_snapshot_url}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 font-medium text-amber-600 hover:underline"
                        >
                          [Image 🖼️]
                        </a>
                      )}
                      <span className="font-medium text-text">{item.name_snapshot}</span>
                      <span className="text-muted">
                        ({item.size_snapshot || 'Default'} × {item.quantity})
                      </span>
                    </div>
                  ))}
                </td>
                <td className="p-4 font-bold text-text">
                  {formatPaisa(order.total_paisa)}
                </td>
                <td className="p-4">
                  <OrderStatusSelect orderId={order.id} status={order.status} />
                </td>
                <td className="p-4 text-xs text-muted">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">
                  No orders recorded in the system yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
