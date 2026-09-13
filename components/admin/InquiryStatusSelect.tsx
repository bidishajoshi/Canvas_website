'use client';

import { useTransition } from 'react';
import { updateInquiryStatus } from '@/app/admin/inquiries/actions';
import type { InquiryStatus } from '@/lib/types';

const STATUSES: InquiryStatus[] = [
  'new',
  'contacted',
  'confirmed',
  'designing',
  'preview_sent',
  'approved',
  'printing',
  'ready',
  'delivered',
  'cancelled',
  'revision_requested',
];

export function InquiryStatusSelect({
  inquiryId,
  status,
}: {
  inquiryId: string;
  status: InquiryStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as InquiryStatus;
        startTransition(() => {
          updateInquiryStatus(inquiryId, next);
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
