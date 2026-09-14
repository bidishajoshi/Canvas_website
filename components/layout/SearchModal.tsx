'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPaisa } from '@/lib/utils';
import type { Product } from '@/lib/types';

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <div className="relative min-h-screen flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24">
        <div className="relative w-full max-w-2xl bg-bg border border-border rounded-3xl shadow-2xl overflow-hidden z-10 animate-scaleUp">
          {/* Search Header */}
          <div className="p-4 sm:p-6 border-b border-border bg-surface flex items-center gap-3">
            <span className="text-xl text-amber-600">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search canvas prints, 7-horse art, t-shirts, frames..."
              className="flex-1 bg-transparent text-text text-base sm:text-lg font-medium focus:outline-none placeholder:text-muted"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs text-muted hover:text-text px-2 py-1 rounded bg-surface-hover"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-text hover:border-amber-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Body Results */}
          <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-3">
            {loading && (
              <div className="py-8 text-center text-xs font-semibold text-amber-600 animate-pulse">
                Searching wall art &amp; customized apparel...
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="py-8 text-center text-muted text-xs">
                No matching decor products found for &ldquo;<span className="text-text font-bold">{query}</span>&rdquo;.
                <div className="mt-3">
                  <Link
                    href="/custom-canvas"
                    onClick={onClose}
                    className="inline-block px-4 py-2 rounded-lg bg-amber-600 text-white font-bold text-xs"
                  >
                    Build Custom Canvas Instead →
                  </Link>
                </div>
              </div>
            )}

            {!loading && !query && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-3">
                  Popular Searches
                </span>
                <div className="flex flex-wrap gap-2">
                  {['7 Horse Canvas', 'Buddha Painting', '3 Panel Wall Art', 'Customized T-Shirt', 'Mountain Skyline'].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setQuery(tag)}
                        className="px-3 py-1.5 rounded-full border border-border bg-surface text-xs font-semibold text-text hover:border-amber-600 hover:text-amber-600 transition-colors"
                      >
                        🏷️ {tag}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2">
                  Found {results.length} Products
                </span>
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 rounded-2xl border border-border bg-surface hover:border-amber-600 hover:shadow-md transition-all group"
                  >
                    <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-neutral-900 border border-border">
                      {product.main_image_url && (
                        <Image
                          src={product.main_image_url}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-text group-hover:text-amber-600 transition-colors truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-muted truncate">
                        {product.short_description || 'High quality canvas wall decor'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-600 text-sm block">
                        {formatPaisa(product.discount_price_paisa || product.base_price_paisa)}
                      </span>
                      {product.discount_price_paisa && (
                        <span className="text-[10px] text-muted line-through block">
                          {formatPaisa(product.base_price_paisa)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
