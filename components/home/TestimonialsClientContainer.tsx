'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ReviewSubmissionModal } from './ReviewSubmissionModal';

interface TestimonialItem {
  id: string;
  customer_name: string;
  customer_location?: string;
  quote?: string;
  comment?: string;
  rating?: number;
  customer_image_url?: string;
}

export function TestimonialsClientContainer({
  title,
  subtitle,
  testimonials,
}: {
  title: string;
  subtitle: string;
  testimonials: TestimonialItem[];
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="container-page py-16 border-t border-border">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block">
            Verified Customer Reviews
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
            {title}
          </h2>
          <p className="text-muted text-xs sm:text-sm">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
        >
          <span>✍️</span> Write a Customer Review
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.id}
            className="rounded-2xl border border-border p-6 bg-surface shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-600/40 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500 text-sm">
                {'★'.repeat(t.rating || 5)}
              </div>
              <blockquote className="text-sm text-text leading-relaxed font-medium">
                &ldquo;{t.quote || t.comment}&rdquo;
              </blockquote>
            </div>

            <figcaption className="flex items-center gap-3 pt-3 border-t border-border/60">
              {t.customer_image_url ? (
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-amber-600/30">
                  <Image
                    src={t.customer_image_url}
                    alt={t.customer_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 font-bold flex items-center justify-center text-sm">
                  {t.customer_name.charAt(0)}
                </div>
              )}
              <div>
                <span className="text-sm font-bold block text-text">{t.customer_name}</span>
                {t.customer_location && (
                  <span className="text-xs text-muted block">{t.customer_location}, Nepal</span>
                )}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      <ReviewSubmissionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
