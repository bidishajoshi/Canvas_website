'use client';

import { useState } from 'react';
import type { Faq } from '@/lib/types';

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="divide-y divide-border rounded-card border border-border">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium"
            >
              {faq.question}
              <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <p className="px-4 pb-4 text-sm text-muted">{faq.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
