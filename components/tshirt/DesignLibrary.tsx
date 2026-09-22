'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { TShirtDesign } from '@/lib/types';

interface DesignLibraryProps {
  designs: TShirtDesign[];
  selectedDesignId?: string | null;
  onSelectDesign: (design: TShirtDesign | null) => void;
}

const THEME_FILTERS = [
  'All',
  'Couple Set',
  'Reference Photos',
  'Love',
  'Minimal',
  'Quotes',
  'Nepalese',
  'Gaming',
  'Anime',
  'Funny',
  'Travel',
];

export function DesignLibrary({
  designs,
  selectedDesignId,
  onSelectDesign,
}: DesignLibraryProps) {
  const [activeTheme, setActiveTheme] = useState('All');

  const filteredDesigns =
    activeTheme === 'All'
      ? designs
      : designs.filter((d) => {
          const t = (d.theme || '').toLowerCase();
          const target = activeTheme.toLowerCase();
          if (target === 'couple set') return t.includes('couple') || t.includes('matching') || t.includes('pair');
          if (target === 'reference photos') return t.includes('reference') || t.includes('photo') || t.includes('custom');
          return t.includes(target);
        });

  return (
    <div className="space-y-4">
      {/* Theme Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {THEME_FILTERS.map((theme) => (
          <button
            key={theme}
            type="button"
            onClick={() => setActiveTheme(theme)}
            className={`px-3 py-1.5 rounded-full border font-semibold transition-all shrink-0 ${
              activeTheme === theme
                ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                : 'border-border bg-bg text-text hover:border-amber-600'
            }`}
          >
            {theme}
          </button>
        ))}
      </div>

      {/* Design Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1">
        {filteredDesigns.map((design) => {
          const isSelected = selectedDesignId === design.id;
          return (
            <button
              key={design.id}
              type="button"
              onClick={() => onSelectDesign(isSelected ? null : design)}
              className={`group relative flex flex-col items-center p-3 rounded-xl border transition-all text-left ${
                isSelected
                  ? 'border-amber-600 bg-amber-500/10 ring-2 ring-amber-500/30'
                  : 'border-border bg-surface hover:border-amber-600/60 hover:-translate-y-0.5 shadow-sm'
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-surface-hover mb-2">
                <Image
                  src={design.image_url}
                  alt={design.name}
                  fill
                  className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <span className="line-clamp-1 text-xs font-semibold text-text group-hover:text-amber-600">
                {design.name}
              </span>
              <div className="flex items-center justify-between w-full mt-1 text-[10px]">
                <span className="text-muted">{design.theme}</span>
                <span className="font-bold text-amber-600">
                  {design.price_paisa > 0
                    ? `+Rs. ${design.price_paisa / 100}`
                    : 'Free'}
                </span>
              </div>

              {isSelected && (
                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-white text-[10px] font-bold shadow-sm">
                  ✓
                </span>
              )}
            </button>
          );
        })}

        {filteredDesigns.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-muted">
            No graphics found for this theme category.
          </div>
        )}
      </div>
    </div>
  );
}
