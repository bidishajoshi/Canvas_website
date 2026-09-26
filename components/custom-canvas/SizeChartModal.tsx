'use client';

import { useState } from 'react';
import type { SizeChartItem } from '@/lib/types';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizeChartItems?: SizeChartItem[];
}

const DEFAULT_CHART: SizeChartItem[] = [
  {
    panel_count: 1,
    size_label: 'Single Large (24 x 36 in / 60 x 90 cm)',
    each_panel_size: '1 Panel @ 24 x 36 in (60 x 90 cm)',
    recommended_room: 'Bedrooms, Entryways, Small Accent Walls',
    description: 'Classic single piece canvas. Perfect focal point for compact walls.',
  },
  {
    panel_count: 2,
    size_label: 'Diptych Pair (36 x 24 in / 90 x 60 cm total)',
    each_panel_size: '2 Panels @ 18 x 24 in (45 x 60 cm) each',
    recommended_room: 'Hallways, Office Desk Walls, Sideboards',
    description: 'Modern two-piece split artwork for balanced symmetrical walls.',
  },
  {
    panel_count: 3,
    size_label: 'Triptych Classic (48 x 24 in / 120 x 60 cm total)',
    each_panel_size: '3 Panels @ 16 x 24 in (40 x 60 cm) each',
    recommended_room: 'Standard Living Room Sofas, Dining Tables',
    description: 'Our most popular 3-piece layout. Fills medium living room walls beautifully.',
  },
  {
    panel_count: 4,
    size_label: 'Quad Split (60 x 30 in / 150 x 75 cm total)',
    each_panel_size: '4 Panels @ 15 x 30 in (37.5 x 75 cm) each',
    recommended_room: 'Large Living Rooms, Wide Sofas, Staircase Landing',
    description: 'Dramatic 4-piece split for wide wall coverage and modern artistic vibe.',
  },
  {
    panel_count: 5,
    size_label: 'Grand Pentaptych (60 x 32 in / 150 x 80 cm total)',
    each_panel_size: 'Graduated height: Center 12x32", Mid 12x28", Outer 12x24"',
    recommended_room: 'Feature Living Room Sofa Walls, Master Suites',
    description: 'Eye-catching 5-piece chevron height arrangement for maximum visual impact.',
  },
  {
    panel_count: 6,
    size_label: 'Hexaptych Panorama (72 x 36 in / 180 x 90 cm total)',
    each_panel_size: '6 Panels @ 12 x 36 in (30 x 90 cm) each',
    recommended_room: 'Wide Living Rooms, Conference Rooms, Executive Suites',
    description: 'Seamless 6-piece layout for expansive wall coverage.',
  },
  {
    panel_count: 7,
    size_label: 'Panoramic Multi-Piece (84 x 36 in / 210 x 90 cm total)',
    each_panel_size: '7 Panels @ 12 x 36 in (30 x 90 cm) each',
    recommended_room: 'Extra Wide Living Room Walls, Hallways, Commercial Spaces',
    description: 'Ultimate 7-piece gallery installation. Expansive wall transformation.',
  },
];

export function SizeChartModal({ isOpen, onClose, sizeChartItems }: SizeChartModalProps) {
  const [selectedTab, setSelectedTab] = useState<number | 'all'>('all');

  if (!isOpen) return null;

  const items = sizeChartItems && sizeChartItems.length > 0 ? sizeChartItems : DEFAULT_CHART;
  const filtered = selectedTab === 'all' ? items : items.filter((i) => i.panel_count === selectedTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/80">
          <div>
            <h2 className="text-xl font-bold text-text flex items-center gap-2">
              <span>📏</span> Canvas Size Chart & Placement Guide
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Choose the ideal panel configuration and dimensions for your space.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-text hover:bg-surface-hover transition-colors font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Panel Count Filter Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-3 border-b border-border bg-surface-hover/30 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedTab === 'all'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-surface text-muted hover:text-text border border-border'
            }`}
          >
            All Layouts
          </button>
          {[1, 2, 3, 4, 5, 6, 7].map((pc) => (
            <button
              key={pc}
              type="button"
              onClick={() => setSelectedTab(pc)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedTab === pc
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'bg-surface text-muted hover:text-text border border-border'
              }`}
            >
              {pc} {pc === 1 ? 'Piece' : 'Pieces'}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-hover text-muted uppercase font-bold tracking-wider text-[11px] border-b border-border">
                <tr>
                  <th className="py-3 px-4">Panels</th>
                  <th className="py-3 px-4">Total Overall Size</th>
                  <th className="py-3 px-4">Individual Panel Size</th>
                  <th className="py-3 px-4">Best For Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface-hover/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-amber-500 flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded bg-pink-500/10 text-pink-600 border border-pink-500/20 flex items-center justify-center text-xs font-bold">
                        {item.panel_count ?? 1}P
                      </span>
                      <span>{item.panel_count ?? 1} Piece</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-text">{item.size_label || item.size_name || 'Standard Size'}</td>
                    <td className="py-3.5 px-4 font-mono text-muted">{item.each_panel_size || `${item.width}x${item.height} ${item.unit || 'inch'}`}</td>
                    <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-medium">
                      {item.recommended_room}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Wall Hanging & Gap Spacing Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
              <h4 className="font-bold text-amber-600 text-sm flex items-center gap-1.5">
                <span>📐</span> Panel Gap Guidelines
              </h4>
              <ul className="text-xs text-muted space-y-1 list-disc list-inside">
                <li><strong className="text-text">Small Canvas (12&quot; - 24&quot;):</strong> Leave 1cm to 2cm (10-20mm) between panels.</li>
                <li><strong className="text-text">Medium Canvas (36&quot; - 48&quot;):</strong> Leave 2cm to 3cm (20-30mm) between panels.</li>
                <li><strong className="text-text">Large Multi-Panel (60&quot;+):</strong> Leave 3cm to 5cm (30-50mm) for optimal visual flow.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-pink-500/20 bg-pink-500/5 space-y-2">
              <h4 className="font-bold text-pink-600 text-sm flex items-center gap-1.5">
                <span>🖼️</span> Hanging Height Rule
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Center point of the full artwork should be approximately <strong className="text-text">57 to 60 inches (145-150 cm)</strong> from the floor — standard museum eye level. Leave 6-10 inches above sofas or bed headboards.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface/80 flex items-center justify-between">
          <p className="text-[11px] text-muted">
            Need custom dimensions not listed above? Contact our design team for custom dimensions.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
