'use client';

import { useTransition } from 'react';
import { updateOrderStatus } from '@/app/admin/orders/actions';
import type { OrderStatus } from '@/lib/types';

const STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'designing',
  'preview_ready',
  'approved',
  'printing',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
];

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        startTransition(() => {
          updateOrderStatus(orderId, next);
        });
      }}
      className="rounded-card border border-border bg-bg px-2 py-1 text-xs capitalize"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace('_', ' ')}
        </option>
      ))}
    </select>
  );
}
