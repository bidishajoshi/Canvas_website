import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatPaisa } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  designing: 'Designing',
  preview_ready: 'Preview Ready',
  approved: 'Approved',
  printing: 'Printing',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const dynamic = 'force-dynamic';

export default async function OrderConfirmationPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const supabase = createClient();
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_number', params.orderNumber)
    .single();

  if (!order) notFound();

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-2xl font-semibold">Thank you for your order!</h1>
      <p className="mt-1 text-muted">Order {order.order_number}</p>

      <div className="mt-6 inline-block rounded-full bg-accent-yellow/20 px-4 py-1 text-sm font-medium">
        {STATUS_LABELS[order.status] ?? order.status}
      </div>

      <div className="mt-8 space-y-3">
        {order.order_items?.map((item: any) => (
          <div
            key={item.id}
            className="flex justify-between rounded-card border border-border p-4 text-sm"
          >
            <div>
              <p className="font-medium">{item.name_snapshot}</p>
              <p className="text-xs text-muted">
                {[item.size_snapshot, item.frame_snapshot, item.finish_snapshot]
                  .filter(Boolean)
                  .join(' • ')}{' '}
                × {item.quantity}
              </p>
            </div>
            <span>{formatPaisa(item.subtotal_paisa)}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-1 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Subtotal</span>
          <span>{formatPaisa(order.subtotal_paisa)}</span>
        </div>
        {order.discount_paisa > 0 && (
          <div className="flex justify-between">
            <span className="text-muted">Discount</span>
            <span>-{formatPaisa(order.discount_paisa)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted">Shipping</span>
          <span>{formatPaisa(order.shipping_paisa)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatPaisa(order.total_paisa)}</span>
        </div>
      </div>
    </div>
  );
}
