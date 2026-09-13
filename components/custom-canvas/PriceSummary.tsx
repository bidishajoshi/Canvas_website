'use client';

import { formatPaisa } from '@/lib/utils';

interface PriceSummaryProps {
  pricePaisa: number | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onSendInquiry: () => void;
  whatsappHref: string | null;
  disabledReason: string | null;
  submitting?: boolean;
}

export function PriceSummary({
  pricePaisa,
  quantity,
  onQuantityChange,
  onAddToCart,
  onSendInquiry,
  whatsappHref,
  disabledReason,
  submitting,
}: PriceSummaryProps) {
  const disabled = disabledReason != null || pricePaisa == null;

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">Estimated Price</span>
        <span className="text-2xl font-semibold">
          {pricePaisa != null ? formatPaisa(pricePaisa) : '—'}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm">
          Quantity
        </label>
        <div className="flex items-center rounded-card border border-border">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="px-3 py-1 text-lg"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span id="quantity" className="w-8 text-center text-sm">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            className="px-3 py-1 text-lg"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {disabledReason && (
        <p className="mt-3 text-xs text-muted">{disabledReason}</p>
      )}

      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          disabled={disabled || submitting}
          onClick={onAddToCart}
          className="rounded-card bg-accent-yellow px-4 py-3 text-sm font-semibold text-[color:var(--color-accent-yellow-contrast)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to Cart
        </button>
        <button
          type="button"
          disabled={disabled || submitting}
          onClick={onSendInquiry}
          className="rounded-card border border-border px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send Inquiry
        </button>
        {whatsappHref && (
          <a
            href={disabled ? undefined : whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={disabled}
            className={`rounded-card bg-[#25D366] px-4 py-3 text-center text-sm font-semibold text-white ${
              disabled ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            Ask on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
