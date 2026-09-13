'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { formatPaisa } from '@/lib/utils';

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'designing'
  | 'preview_ready'
  | 'approved'
  | 'printing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

interface OrderTrackingResult {
  id: string;
  order_number: string;
  status: OrderStatus;
  created_at: string;
  total_paisa: number;
  guest_name: string;
  guest_phone: string;
  shipping_address: {
    address_line?: string;
    tole_area?: string;
    district?: string;
    municipality?: string;
  };
  order_items: Array<{
    id: string;
    name_snapshot: string;
    size_snapshot: string | null;
    frame_snapshot: string | null;
    quantity: number;
    subtotal_paisa: number;
  }>;
}

const ORDER_TIMELINE_STEPS: Array<{ key: OrderStatus; label: string; description: string }> = [
  { key: 'pending', label: 'Order Received', description: 'Your order has been recorded in our system.' },
  { key: 'confirmed', label: 'Order Confirmed', description: 'Our team verified your delivery address & design.' },
  { key: 'designing', label: 'Digital Proofing', description: 'Our artists are formatting & scaling your canvas.' },
  { key: 'preview_ready', label: 'Preview Ready', description: 'Design preview sent for your review.' },
  { key: 'approved', label: 'Design Approved', description: 'Artwork approved for canvas printing.' },
  { key: 'printing', label: 'Canvas Printing', description: 'Printed on premium cotton canvas with UV ink.' },
  { key: 'packed', label: 'Framing & Packing', description: 'Hand-stretched onto pine wood frame & packed.' },
  { key: 'shipped', label: 'Out for Delivery', description: 'Handed to courier for delivery to your address.' },
  { key: 'delivered', label: 'Delivered', description: 'Canvas successfully delivered to your doorstep!' },
];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderTrackingResult | null>(null);

  async function handleTrack(e: FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError('Please enter your Order Reference Number.');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(
          orderNumber.trim()
        )}&phone=${encodeURIComponent(phone.trim())}`
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'No matching order found. Check your order number and phone.');
        return;
      }

      const data = await res.json();
      setOrder(data);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function getStepIndex(status: OrderStatus) {
    if (status === 'cancelled') return -1;
    const index = ORDER_TIMELINE_STEPS.findIndex((s) => s.key === status);
    return index >= 0 ? index : 0;
  }

  return (
    <div className="container-page py-12 max-w-4xl">
      <div className="text-center space-y-3 mb-10">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-600 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          Real-Time Tracking
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text">
          Track Your Canvas Order
        </h1>
        <p className="text-sm text-muted max-w-lg mx-auto">
          Enter your Order Reference ID (e.g., <code className="text-amber-600 font-mono">AD-2026-12345</code>) and phone number to trace live progress.
        </p>
      </div>

      {/* Tracking Form */}
      <form onSubmit={handleTrack} className="mx-auto max-w-lg rounded-xl border border-border p-6 bg-surface shadow-sm space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-1 block">
            Order Reference ID *
          </label>
          <input
            type="text"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. AD-2026-00001"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text text-sm outline-none focus:border-amber-600 font-mono uppercase"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-1 block">
            Phone Number (Optional verification)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9800000000"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text text-sm outline-none focus:border-amber-600"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 font-medium p-2.5 rounded bg-red-500/10 border border-red-500/20">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          {loading ? 'Searching Order...' : 'Track Order Progress'}
        </button>
      </form>

      {/* Order Status Display */}
      {order && (
        <div className="mt-12 space-y-8 animate-fadeIn">
          {/* Order Header Summary */}
          <div className="rounded-xl border border-border p-6 bg-surface space-y-4 sm:flex sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <p className="text-xs text-muted font-medium">Order Reference</p>
              <h2 className="text-2xl font-bold font-mono text-amber-600">{order.order_number}</h2>
              <p className="text-xs text-muted mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString()} for <span className="font-semibold text-text">{order.guest_name}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted block">Status</span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  order.status === 'delivered'
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                    : order.status === 'cancelled'
                    ? 'bg-red-500/10 text-red-600 border border-red-500/30'
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                }`}
              >
                {order.status.replace('_', ' ')}
              </span>
              <p className="text-sm font-semibold text-text mt-1">{formatPaisa(order.total_paisa)}</p>
            </div>
          </div>

          {/* Timeline Visual Progress */}
          {order.status !== 'cancelled' ? (
            <div className="rounded-xl border border-border p-6 bg-surface space-y-6">
              <h3 className="text-base font-semibold border-b border-border pb-3">Production &amp; Delivery Progress</h3>
              <div className="space-y-6">
                {ORDER_TIMELINE_STEPS.map((step, idx) => {
                  const currentIdx = getStepIndex(order.status);
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={step.key} className="flex gap-4 items-start">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                            isCompleted
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-surface-hover text-muted border border-border'
                          } ${isCurrent ? 'ring-4 ring-amber-500/20' : ''}`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        {idx < ORDER_TIMELINE_STEPS.length - 1 && (
                          <div
                            className={`h-10 w-0.5 my-1 ${
                              idx < currentIdx ? 'bg-amber-600' : 'bg-border'
                            }`}
                          />
                        )}
                      </div>
                      <div className="pt-1">
                        <h4
                          className={`text-sm font-semibold ${
                            isCompleted ? 'text-text' : 'text-muted'
                          } ${isCurrent ? 'text-amber-600' : ''}`}
                        >
                          {step.label} {isCurrent && <span className="text-[11px] font-normal text-amber-600 italic">(Current Stage)</span>}
                        </h4>
                        <p className="text-xs text-muted mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-red-500/20 p-6 bg-red-500/5 text-center">
              <p className="text-sm font-semibold text-red-600">This order has been cancelled.</p>
              <p className="text-xs text-muted mt-1">If you have any questions, please contact our support team on WhatsApp.</p>
            </div>
          )}

          {/* Ordered Items Summary */}
          <div className="rounded-xl border border-border p-6 bg-surface space-y-4">
            <h3 className="text-base font-semibold border-b border-border pb-3">Items in this Order</h3>
            <div className="divide-y divide-border">
              {order.order_items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-semibold text-text">{item.name_snapshot}</p>
                    <p className="text-xs text-muted">
                      {item.size_snapshot && `Size: ${item.size_snapshot}`}
                      {item.frame_snapshot && ` • Frame: ${item.frame_snapshot}`}
                      {` • Qty: ${item.quantity}`}
                    </p>
                  </div>
                  <span className="font-semibold text-text">{formatPaisa(item.subtotal_paisa)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
