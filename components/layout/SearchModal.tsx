'use me';
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
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
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
    }, 120);

    return () => clearTimeout(timer);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto gpu-layer">
      {/* Hardware Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity duration-150 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative min-h-screen flex items-start justify-center p-4 sm:p-6 pt-14 sm:pt-20">
        <div className="relative w-full max-w-2xl bg-bg border border-border rounded-3xl shadow-2xl overflow-hidden z-10 transform transition-all duration-150 ease-out gpu-layer">
          {/* Search Header */}
          <div className="p-4 sm:p-5 border-b border-border bg-surface flex items-center gap-3">
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
                className="text-xs text-muted hover:text-text px-2.5 py-1 rounded-lg bg-surface-hover active:scale-90 transition-all duration-100"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-text hover:border-amber-600 transition-all duration-100 active:scale-90"
            >
              ✕
            </button>
          </div>

          {/* Body Results */}
          <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5 space-y-3">
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
                    prefetch={true}
                    onClick={onClose}
                    className="inline-block px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs active:scale-95 transition-all"
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
                        className="px-3 py-1.5 rounded-full border border-border bg-surface text-xs font-semibold text-text hover:border-amber-600 hover:text-amber-600 active:scale-90 transition-all duration-100"
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
                    prefetch={true}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 rounded-2xl border border-border bg-surface hover:border-amber-600/60 hover:shadow-md active:scale-[0.99] transition-all duration-100 group"
                  >
                    <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-neutral-900 border border-border">
                      {product.main_image_url && (
                        <Image
                          src={product.main_image_url}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
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
