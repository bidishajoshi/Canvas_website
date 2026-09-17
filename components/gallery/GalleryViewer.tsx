'use me';
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { GalleryItem, Category } from '@/lib/types';

interface GalleryViewerProps {
  initialItems: GalleryItem[];
  categories: Category[];
}

export function GalleryViewer({ initialItems, categories }: GalleryViewerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeLightboxImage, setActiveLightboxImage] = useState<GalleryItem | null>(null);

  const categoryNames = Array.from(
    new Set([
      ...categories.map((c) => c.name),
      'Single Canvas Prints',
      'Multi-Panel & Splits',
      'Aesthetic & Vastu Wall Art',
      'Customized T-Shirts & Apparel',
      'Personal & Family Photo Portraits',
      'Framed Art & Wall Decor',
    ])
  );

  const filteredItems =
    selectedCategory === 'all'
      ? initialItems
      : initialItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="space-y-10">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition-all ${
            selectedCategory === 'all'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-105'
              : 'bg-surface text-muted hover:text-text hover:bg-surface/80 border border-border'
          }`}
        >
          All Photos ({initialItems.length})
        </button>
        {categoryNames.map((catName) => {
          const count = initialItems.filter((i) => i.category === catName).length;
          return (
            <button
              key={catName}
              onClick={() => setSelectedCategory(catName)}
              className={`rounded-full px-4.5 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === catName
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-105'
                  : 'bg-surface text-muted hover:text-text hover:bg-surface/80 border border-border'
              }`}
            >
              {catName} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Photo Cards Masonry / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveLightboxImage(item)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-500/50"
          >
            {/* Photo Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900">
              <Image
                src={item.image_url}
                alt={item.caption || 'Gallery Photo'}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  {item.category || 'Photo Showcase'}
                </span>
                <p className="text-sm font-bold text-white line-clamp-2">
                  {item.caption || 'Click to view full photo'}
                </p>
                <div className="mt-2 flex items-center text-xs font-semibold text-amber-300 gap-1">
                  <span>View Full Photo</span>
                  <span>🔍</span>
                </div>
              </div>
            </div>

            {/* Bottom Card Bar */}
            <div className="p-4 flex items-center justify-between border-t border-border/40 bg-surface">
              <div>
                <span className="inline-block rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                  {item.category || 'Wall Decor'}
                </span>
                <p className="text-xs font-semibold text-text truncate max-w-[180px] mt-0.5">
                  {item.caption || 'Product Photo'}
                </p>
              </div>
              <span className="text-xs font-bold text-amber-500 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted border border-dashed border-border rounded-2xl bg-surface">
            <span className="text-4xl">🖼️</span>
            <p className="mt-3 text-base font-semibold text-text">No photos found in this category.</p>
            <p className="mt-1 text-xs text-muted">Select &apos;All Photos&apos; or check back soon.</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeLightboxImage && (
        <div
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 p-4 sm:p-6 shadow-2xl space-y-4"
          >
            <button
              onClick={() => setActiveLightboxImage(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-amber-500 hover:text-black font-bold text-lg transition-colors"
            >
              ✕
            </button>

            <div className="relative aspect-[16/10] max-h-[70vh] w-full overflow-hidden rounded-2xl bg-black">
              <Image
                src={activeLightboxImage.image_url}
                alt={activeLightboxImage.caption || 'Full Photo View'}
                fill
                className="object-contain"
                sizes="1200px"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/10 pt-4 text-white">
              <div>
                <span className="rounded-md bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-400">
                  {activeLightboxImage.category || 'Photo Showcase'}
                </span>
                <h3 className="font-display text-lg font-bold mt-1">
                  {activeLightboxImage.caption || 'Affordable Decoration Reference Photo'}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/custom-canvas"
                  className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition-all shadow-md"
                >
                  🎨 Custom Canvas Builder
                </Link>
                <Link
                  href="/shop"
                  className="rounded-xl border border-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition-all"
                >
                  🛍️ Shop Catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
