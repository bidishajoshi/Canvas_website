'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Settings } from '@/lib/types';
import { ReviewSubmissionModal } from '@/components/home/ReviewSubmissionModal';

interface ReviewItem {
  id: string;
  customer_name: string;
  location?: string;
  rating: number;
  comment: string;
  product_category?: string;
  canvas_image_url?: string;
  created_at?: string;
}

export function ReviewsClient({
  settings,
  initialReviews,
}: {
  settings: Settings;
  initialReviews: ReviewItem[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', 'Custom Photo Canvas', 'Vastu & Multi-Panel', 'Custom T-Shirts', 'Corporate Bulk'];

  const filteredReviews = useMemo(() => {
    return initialReviews.filter((r) => {
      const matchRating = selectedRating === 'all' || r.rating === selectedRating;
      const matchCategory =
        selectedCategory === 'all' ||
        (r.product_category && r.product_category.toLowerCase() === selectedCategory.toLowerCase());
      const matchSearch =
        !searchQuery.trim() ||
        r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.location && r.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.comment.toLowerCase().includes(searchQuery.toLowerCase());

      return matchRating && matchCategory && matchSearch;
    });
  }, [initialReviews, selectedRating, selectedCategory, searchQuery]);

  return (
    <div className="container-page py-12 space-y-12 max-w-6xl">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-600 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          ⭐ Verified Customer Testimonials
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-text">
          Loved by Homes &amp; Offices Across Nepal
        </h1>
        <p className="text-sm sm:text-base text-muted leading-relaxed">
          Over 1,200+ custom photo canvases and personalized t-shirts printed and delivered to Kathmandu, Pokhara, Chitwan, Butwal, Biratnagar, and beyond.
        </p>
      </div>

      {/* Aggregate Score & Trust Summary Card */}
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm grid gap-8 md:grid-cols-12 items-center">
        {/* Left score big badge */}
        <div className="md:col-span-4 text-center md:border-r md:border-border md:pr-6 space-y-2">
          <div className="font-display text-5xl sm:text-6xl font-black text-amber-600">4.9</div>
          <div className="flex items-center justify-center gap-1 text-amber-500 text-lg">
            {'★★★★★'.split('').map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
          <p className="text-xs text-muted font-medium">Based on 1,240+ verified customer orders across Nepal</p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              ✍️ Write a Review
            </button>
          </div>
        </div>

        {/* Right rating bars & trust highlights */}
        <div className="md:col-span-8 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-bg border border-border space-y-1">
              <span className="text-amber-600 text-base">🛡️</span>
              <strong className="block text-text font-bold">100% Transit Guarantee</strong>
              <p className="text-[11px] text-muted">Free re-print replacement if damaged during shipping.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-bg border border-border space-y-1">
              <span className="text-emerald-600 text-base">📱</span>
              <strong className="block text-text font-bold">WhatsApp Proof First</strong>
              <p className="text-[11px] text-muted">Review digital split proof before we send to print.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-bg border border-border space-y-1">
              <span className="text-blue-600 text-base">🚚</span>
              <strong className="block text-text font-bold">Cash on Delivery</strong>
              <p className="text-[11px] text-muted">Express home delivery across all 77 districts.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category filters */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-surface hover:bg-surface-hover text-text border border-border'
                }`}
              >
                {cat === 'all' ? 'All Reviews' : cat}
              </button>
            ))}
          </div>

          {/* Rating filter */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-text outline-none focus:border-amber-600"
            >
              <option value="all">All Star Ratings</option>
              <option value="5">5 Stars Only ★★★★★</option>
              <option value="4">4 Stars &amp; Above ★★★★☆</option>
            </select>
          </div>
        </div>

        {/* Text search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews by name, city (e.g. Kathmandu, Pokhara), or keyword..."
            className="w-full px-4 py-2.5 pl-10 rounded-xl border border-border bg-surface text-text text-xs outline-none focus:border-amber-600"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-xs">🔍</span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Reviews Grid */}
      {filteredReviews.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredReviews.map((r) => (
            <div
              key={r.id}
              className="rounded-3xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500 text-sm">
                    {Array.from({ length: r.rating || 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  {r.product_category && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {r.product_category}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-text leading-relaxed font-normal">
                  &ldquo;{r.comment}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-text flex items-center gap-1">
                    <span>{r.customer_name}</span>
                    <span className="text-emerald-600 text-[11px]" title="Verified Buyer">✓</span>
                  </h4>
                  {r.location && <p className="text-[11px] text-muted">{r.location}</p>}
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl border border-border bg-surface p-8 space-y-3">
          <p className="text-sm font-semibold text-text">No reviews matched your filter.</p>
          <p className="text-xs text-muted">Try clearing the search query or selecting a different category.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedRating('all');
            }}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* CTA Bottom Banner */}
      <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 sm:p-10 text-center space-y-4">
        <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-text">
          Ready to Create Your Own Custom Canvas or T-Shirt?
        </h3>
        <p className="text-sm text-muted max-w-xl mx-auto">
          Upload your favorite photo now to test multi-panel splits in our live studio, or chat directly with our design team.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/custom-canvas"
            className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            🖼️ Start Custom Canvas
          </Link>
          <Link
            href="/custom-t-shirt"
            className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-surface hover:bg-surface-hover text-text border border-border font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            👕 Design Custom T-Shirt
          </Link>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/30 font-bold text-xs transition-all active:scale-95"
          >
            ✍️ Leave a Review
          </button>
        </div>
      </div>

      {/* Submission Modal */}
      <ReviewSubmissionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
