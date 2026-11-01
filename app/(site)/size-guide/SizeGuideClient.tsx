'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Settings } from '@/lib/types';

interface PanelSpec {
  count: number;
  id: string;
  name: string;
  badge: string;
  totalSize: string;
  totalSizeCm: string;
  breakdown: string;
  bestFor: string;
  recommendedWall: string;
  startingPrice: string;
  description: string;
  heights: number[]; // relative heights for SVG diagram
}

const PANELS_DATA: PanelSpec[] = [
  {
    count: 1,
    id: 'panel-1',
    name: '1 Panel Solid Canvas',
    badge: 'Classic Single',
    totalSize: '24" × 36"',
    totalSizeCm: '60 × 90 cm',
    breakdown: '1 Panel @ 24" × 36"',
    bestFor: 'Entryway, bedroom accent wall, office study desk',
    recommendedWall: '4 to 6 ft wide wall space',
    startingPrice: 'Rs. 700',
    description: 'A timeless single focal piece. Seamless and clean, letting portrait shots, family pictures, or landscape paintings take center stage without interruption.',
    heights: [100],
  },
  {
    count: 2,
    id: 'panel-2',
    name: '2 Panel Diptych Pair',
    badge: 'Modern Balance',
    totalSize: '36" × 24" Total',
    totalSizeCm: '90 × 60 cm',
    breakdown: '2 Panels @ 18" × 24" each',
    bestFor: 'Narrow hallways, twin bed headboards, balanced desk walls',
    recommendedWall: '5 to 7 ft wide wall space',
    startingPrice: 'Rs. 1,400',
    description: 'Symmetrical two-piece layout. Excellent for couple photos, dual nature scenery, or complementary portraits creating a clean modern gallery feel.',
    heights: [90, 90],
  },
  {
    count: 3,
    id: 'panel-3',
    name: '3 Panel Split Triptych',
    badge: 'Most Popular',
    totalSize: '48" × 24" Total',
    totalSizeCm: '120 × 60 cm',
    breakdown: '3 Panels @ 16" × 24" each',
    bestFor: 'Standard 3-seater living room sofas, dining table feature wall',
    recommendedWall: '6 to 8 ft wide wall space',
    startingPrice: 'Rs. 2,100',
    description: 'Nepal’s most popular canvas layout! Fills the width of standard living room sofas with perfect 2/3 visual balance without overpowering the room.',
    heights: [95, 95, 95],
  },
  {
    count: 4,
    id: 'panel-4',
    name: '4 Panel Quad Split',
    badge: 'Artistic Modern',
    totalSize: '60" × 30" Total',
    totalSizeCm: '150 × 75 cm',
    breakdown: '4 Panels @ 15" × 30" each',
    bestFor: 'Wide living rooms, contemporary loft walls, stairwell landings',
    recommendedWall: '7 to 9 ft wide wall space',
    startingPrice: 'Rs. 2,800',
    description: 'Even four-way split creating a rhythmic, gallery-style sequence. Works especially well for continuous skyline views, rivers, and modern art.',
    heights: [95, 95, 95, 95],
  },
  {
    count: 5,
    id: 'panel-5',
    name: '5 Panel Chevron Pentaptych',
    badge: 'Grand Centerpiece',
    totalSize: '60" × 32" Total',
    totalSizeCm: '150 × 80 cm',
    breakdown: 'Graduated: Center 12×32", Mid 12×28", Outer 12×24"',
    bestFor: 'Living room main feature wall, master suite bed wall',
    recommendedWall: '8 to 11 ft wide wall space',
    startingPrice: 'Rs. 3,500',
    description: 'The iconic stepped chevron curve. The tallest center panel anchors the eye while outer panels taper down, creating unmatched architectural drama.',
    heights: [65, 85, 100, 85, 65],
  },
  {
    count: 6,
    id: 'panel-6',
    name: '6 Panel Hexaptych',
    badge: 'Wide Panoramic',
    totalSize: '72" × 36" Total',
    totalSizeCm: '180 × 90 cm',
    breakdown: '6 Panels @ 12" × 36" each',
    bestFor: 'Long conference rooms, luxury hotel lobbies, wide corridors',
    recommendedWall: '9 to 12 ft wide wall space',
    startingPrice: 'Rs. 4,200',
    description: 'Expansive multi-panel sequence designed for extra-long walls. Turns any wide wall into a museum-worthy installation with crisp continuity.',
    heights: [95, 95, 95, 95, 95, 95],
  },
  {
    count: 7,
    id: 'panel-7',
    name: '7 Piece Panoramic Vastu Statement',
    badge: 'Ultimate Panorama',
    totalSize: '84" × 36" Total',
    totalSizeCm: '210 × 90 cm',
    breakdown: '7 Panels @ 12" × 36" each (or graduated curve)',
    bestFor: 'Huge feature walls, 7 Running Horses Vastu, Himalayan panoramas',
    recommendedWall: '10 to 14+ ft wide wall space',
    startingPrice: 'Rs. 4,900',
    description: 'The ultimate canvas wall art. Revered across Nepal for 7 Running Horses Vastu and breathtaking Mt. Everest panoramas spanning over 7 feet across.',
    heights: [60, 75, 90, 100, 90, 75, 60],
  },
];

const TSHIRT_SIZES = [
  { size: 'S', chestIn: '38"', chestCm: '96 cm', lengthIn: '26"', lengthCm: '66 cm', shoulderIn: '16.5"', fit: 'Slim / Regular', weightKg: '45 – 55 kg' },
  { size: 'M', chestIn: '40"', chestCm: '101 cm', lengthIn: '27"', lengthCm: '69 cm', shoulderIn: '17.5"', fit: 'Standard Regular', weightKg: '55 – 68 kg' },
  { size: 'L', chestIn: '42"', chestCm: '106 cm', lengthIn: '28"', lengthCm: '71 cm', shoulderIn: '18.5"', fit: 'Standard / Comfort', weightKg: '68 – 78 kg' },
  { size: 'XL', chestIn: '44"', chestCm: '112 cm', lengthIn: '29"', lengthCm: '74 cm', shoulderIn: '19.5"', fit: 'Relaxed / Oversized', weightKg: '78 – 90 kg' },
  { size: 'XXL', chestIn: '46"', chestCm: '117 cm', lengthIn: '30"', lengthCm: '76 cm', shoulderIn: '20.5"', fit: 'Extra Relaxed', weightKg: '90 – 105 kg' },
];

export function SizeGuideClient({ settings }: { settings: Settings }) {
  const [activeTab, setActiveTab] = useState<'panels' | 'furniture' | 'frames' | 'tshirt'>('panels');
  const [selectedPanelCount, setSelectedPanelCount] = useState<number>(3);

  const currentPanel = PANELS_DATA.find((p) => p.count === selectedPanelCount) || PANELS_DATA[2];

  return (
    <div className="container-page py-12 space-y-12 max-w-6xl">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-600 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          📐 Dimensions &amp; Sizing Guide
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-text">
          Find the Perfect Size for Your Wall &amp; Space
        </h1>
        <p className="text-sm sm:text-base text-muted leading-relaxed">
          Need help picking between 1, 3, 5, or 7 panels? Follow our sofa hanging rules, dimension tables, and t-shirt fit charts handcrafted for homes across Nepal.
        </p>
      </div>

      {/* Navigation Tab Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-surface border border-border max-w-3xl mx-auto shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('panels')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'panels'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-text hover:text-amber-600 hover:bg-surface-hover'
          }`}
        >
          🖼️ Canvas Splits &amp; Dimensions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('furniture')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'furniture'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-text hover:text-amber-600 hover:bg-surface-hover'
          }`}
        >
          🛋️ Sofa &amp; Room Placement
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('frames')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'frames'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-text hover:text-amber-600 hover:bg-surface-hover'
          }`}
        >
          🪵 Framing &amp; Depths
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tshirt')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'tshirt'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-text hover:text-amber-600 hover:bg-surface-hover'
          }`}
        >
          👕 T-Shirt Measurements
        </button>
      </div>

      {/* TAB 1: Canvas Splits & Dimensions */}
      {activeTab === 'panels' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Panel count selector buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PANELS_DATA.map((p) => (
              <button
                key={p.count}
                type="button"
                onClick={() => setSelectedPanelCount(p.count)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedPanelCount === p.count
                    ? 'bg-amber-600 text-white shadow-md scale-105'
                    : 'bg-surface hover:bg-surface-hover text-text border border-border'
                }`}
              >
                <span>{p.count} {p.count === 1 ? 'Panel' : 'Panels'}</span>
                {p.count === 3 && <span className="ml-1 text-[10px] opacity-80">(#1 Pick)</span>}
              </button>
            ))}
          </div>

          {/* Active Panel Detailed Card */}
          <div className="rounded-3xl border border-border bg-surface p-6 sm:p-10 shadow-lg grid gap-8 lg:grid-cols-12 items-center">
            {/* Visual SVG Diagram */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-bg border border-border/70 min-h-[260px]">
              <div className="w-full flex items-end justify-center gap-2 h-44 mb-4">
                {currentPanel.heights.map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="flex-1 max-w-[54px] rounded-lg bg-gradient-to-t from-amber-600 to-amber-500 shadow-md border border-white/20 flex flex-col items-center justify-center transition-all duration-300 hover:brightness-110"
                  >
                    <span className="text-[10px] font-mono text-white font-bold opacity-80">
                      P{i + 1}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-center text-xs text-muted flex items-center justify-center gap-2">
                <span>Total Width: <strong className="text-text font-mono">{currentPanel.totalSize}</strong></span>
                <span>•</span>
                <span>({currentPanel.totalSizeCm})</span>
              </div>
            </div>

            {/* Specifications Info */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full border border-amber-500/20">
                  {currentPanel.badge}
                </span>
                <span className="text-xs text-muted font-mono">ID: {currentPanel.id}</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-text">
                {currentPanel.name}
              </h2>

              <p className="text-sm text-muted leading-relaxed">
                {currentPanel.description}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-surface-hover border border-border">
                  <span className="text-muted block text-[11px] font-medium">Panels Breakdown</span>
                  <strong className="text-text text-sm font-semibold">{currentPanel.breakdown}</strong>
                </div>
                <div className="p-3 rounded-xl bg-surface-hover border border-border">
                  <span className="text-muted block text-[11px] font-medium">Starting Price</span>
                  <strong className="text-amber-600 text-sm font-bold font-mono">{currentPanel.startingPrice}</strong>
                </div>
                <div className="p-3 rounded-xl bg-surface-hover border border-border">
                  <span className="text-muted block text-[11px] font-medium">Recommended Wall Size</span>
                  <strong className="text-text font-semibold">{currentPanel.recommendedWall}</strong>
                </div>
                <div className="p-3 rounded-xl bg-surface-hover border border-border">
                  <span className="text-muted block text-[11px] font-medium">Ideal Room Setting</span>
                  <strong className="text-text font-semibold">{currentPanel.bestFor}</strong>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/custom-canvas?panel=${currentPanel.id}`}
                  className="px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs text-center shadow-md transition-all active:scale-95"
                >
                  Customize {currentPanel.count} Panels Now →
                </Link>
                <a
                  href={`https://wa.me/${settings.whatsapp_number || '9779864029898'}?text=${encodeURIComponent(`Hello Affordable Decoration, I have a question about the ${currentPanel.name} (${currentPanel.totalSize}).`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3.5 rounded-xl border border-border hover:border-emerald-500 bg-surface text-emerald-600 text-center font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>💬</span> Ask on WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Quick Summary Reference Table */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm overflow-x-auto">
            <h3 className="font-display font-bold text-lg text-text mb-4">Complete Canvas Dimensions Quick Chart</h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-hover text-muted uppercase font-bold text-[10px] border-b border-border">
                <tr>
                  <th className="p-3">Panel Count</th>
                  <th className="p-3">Total Coverage</th>
                  <th className="p-3">Each Panel Spec</th>
                  <th className="p-3">Starting Price</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {PANELS_DATA.map((p) => (
                  <tr key={p.count} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="p-3 font-bold text-text">{p.count} {p.count === 1 ? 'Panel' : 'Panels'}</td>
                    <td className="p-3 text-amber-600 font-mono font-bold">{p.totalSize}</td>
                    <td className="p-3 text-muted">{p.breakdown}</td>
                    <td className="p-3 font-mono font-bold text-text">{p.startingPrice}</td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/custom-canvas?panel=${p.id}`}
                        className="text-amber-600 font-bold hover:underline"
                      >
                        Build →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Room & Furniture Placement */}
      {activeTab === 'furniture' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Golden Rules Grid */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-6 space-y-2 shadow-sm">
              <span className="text-2xl p-2 rounded-xl bg-amber-500/10 inline-block mb-2">🛋️</span>
              <h3 className="font-display font-bold text-base text-text">The 60–75% Couch Rule</h3>
              <p className="text-xs text-muted leading-relaxed">
                Your canvas wall art should measure approximately 60% to 75% of the total width of your sofa or headboard. If your sofa is 80 inches wide, choose a 48&quot; to 60&quot; canvas (such as our 3-panel or 5-panel set).
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 space-y-2 shadow-sm">
              <span className="text-2xl p-2 rounded-xl bg-amber-500/10 inline-block mb-2">👁️</span>
              <h3 className="font-display font-bold text-base text-text">Eye-Level Hanging (57&quot; Rule)</h3>
              <p className="text-xs text-muted leading-relaxed">
                Galleries and interior designers hang art so that the center of the canvas is 57 inches (approx. 145 cm) from the floor. When hanging above a sofa, leave 6 to 10 inches of breathing space between the couch back and bottom of the frame.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 space-y-2 shadow-sm">
              <span className="text-2xl p-2 rounded-xl bg-amber-500/10 inline-block mb-2">📏</span>
              <h3 className="font-display font-bold text-base text-text">Panel Gap Spacing (2–3 cm)</h3>
              <p className="text-xs text-muted leading-relaxed">
                For multi-panel triptychs and 5-piece chevron splits, keep a gap of 2 cm to 3 cm (20–30 mm) between each panel. This creates the optical illusion of continuous flow while maintaining distinct architectural depth.
              </p>
            </div>
          </div>

          {/* Furniture Specific Recommendations */}
          <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-display font-bold text-xl text-text">Recommended Size by Furniture Type</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-2xl bg-bg border border-border space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">2-Seater Sofa / Loveseat</span>
                <p className="font-bold text-sm text-text">1 Panel (24&quot;×36&quot;) or 2 Panels (36&quot;×24&quot;)</p>
                <p className="text-xs text-muted">Compact width keeps the small seating area feeling cozy without looking crowded.</p>
              </div>

              <div className="p-4 rounded-2xl bg-bg border border-border space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">3-Seater Living Room Sofa</span>
                <p className="font-bold text-sm text-text">3 Panels Triptych (48&quot;×24&quot;) #1 Best Pick</p>
                <p className="text-xs text-muted">Standard 7–8 ft sofa pairs impeccably with a 4-foot wide 3-panel split triptych.</p>
              </div>

              <div className="p-4 rounded-2xl bg-bg border border-border space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">L-Shaped Sectional Sofa</span>
                <p className="font-bold text-sm text-text">5 Panels Chevron (60&quot;×32&quot;) or 7 Panels</p>
                <p className="text-xs text-muted">Large sectionals require wide visual presence to anchor large open living spaces.</p>
              </div>

              <div className="p-4 rounded-2xl bg-bg border border-border space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Queen / King Bed Headboard</span>
                <p className="font-bold text-sm text-text">3 Panels (48&quot;×24&quot;) or 5 Panels (60&quot;×32&quot;)</p>
                <p className="text-xs text-muted">A Queen bed is 60&quot; wide; King is 76&quot; wide. Both match our 3-panel and 5-panel sets.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Framing & Stretcher Depths */}
      {activeTab === 'frames' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-3xl border border-border bg-surface p-6 space-y-3 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full">
                Standard Stretcher
              </span>
              <h3 className="font-display font-bold text-xl text-text">1.25&quot; Gallery Wrap</h3>
              <p className="text-xs text-muted leading-relaxed">
                Hand-stretched over 1.25-inch solid kiln-dried pine wood. Gives the canvas three-dimensional depth away from your wall without appearing bulky. Pre-installed brass sawtooth hangers included.
              </p>
              <div className="pt-2 text-xs font-semibold text-text">✓ Standard for all multi-panel sets</div>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-6 space-y-3 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full">
                Museum Profile
              </span>
              <h3 className="font-display font-bold text-xl text-text">1.75&quot; Deep Chunky Wrap</h3>
              <p className="text-xs text-muted leading-relaxed">
                Extra deep 1.75-inch solid timber bars. Designed for large statement artwork, grand 5-panel sets, and modern luxury interiors looking for gallery-grade depth.
              </p>
              <div className="pt-2 text-xs font-semibold text-text">✓ Extra rigidity &amp; shadow relief</div>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-6 space-y-3 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full">
                Floating Framing
              </span>
              <h3 className="font-display font-bold text-xl text-text">Floating Box Frame</h3>
              <p className="text-xs text-muted leading-relaxed">
                Available in Matt Black, Warm Oak, and Luxury Brushed Gold. Creates a 0.25&quot; floating shadow gap between the canvas and outer frame for an executive art finish.
              </p>
              <div className="pt-2 text-xs font-semibold text-text">✓ Matt Black, Oak, or Gold options</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: T-Shirt Measurements */}
      {activeTab === 'tshirt' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-xl text-text">Custom T-Shirt Size &amp; Fit Chart</h3>
                <p className="text-xs text-muted">100% Combed Cotton, Bio-Washed, 180–240 GSM. Pre-shrunk fabric made in Nepal.</p>
              </div>
              <Link
                href="/custom-t-shirt"
                className="px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Design Custom T-Shirt →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-hover text-muted uppercase font-bold text-[10px] border-b border-border">
                  <tr>
                    <th className="p-3">Size</th>
                    <th className="p-3">Chest Width (Inches)</th>
                    <th className="p-3">Chest Width (cm)</th>
                    <th className="p-3">Body Length (Inches)</th>
                    <th className="p-3">Body Length (cm)</th>
                    <th className="p-3">Shoulder</th>
                    <th className="p-3">Approx. Body Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {TSHIRT_SIZES.map((row) => (
                    <tr key={row.size} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="p-3 font-extrabold text-amber-600 text-sm">{row.size}</td>
                      <td className="p-3 font-mono font-bold text-text">{row.chestIn}</td>
                      <td className="p-3 font-mono text-muted">{row.chestCm}</td>
                      <td className="p-3 font-mono font-bold text-text">{row.lengthIn}</td>
                      <td className="p-3 font-mono text-muted">{row.lengthCm}</td>
                      <td className="p-3 text-muted">{row.shoulderIn}</td>
                      <td className="p-3 text-muted">{row.weightKg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-muted leading-relaxed space-y-1">
              <strong className="text-text block">💡 How to measure your best fitting t-shirt:</strong>
              <p>1. Lay your favorite t-shirt flat on a table.</p>
              <p>2. Measure from armpit to armpit across the chest to find your chest width.</p>
              <p>3. Measure from the highest point of the shoulder down to the bottom hem for body length.</p>
              <p>4. If in between sizes or if you prefer a modern streetwear oversized fit, order 1 size up.</p>
            </div>
          </div>
        </div>
      )}

      {/* Free WhatsApp Assistance Banner */}
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full">
            Free Interior Consultation
          </span>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-text mt-2">
            Want a Free Wall Mockup Before Ordering?
          </h3>
          <p className="text-xs sm:text-sm text-muted max-w-xl">
            Take a quick smartphone picture of your wall or sofa and send it to our WhatsApp. Our design team will digitally scale and place your photo canvas on your exact wall for free!
          </p>
        </div>

        <a
          href={`https://wa.me/${settings.whatsapp_number || '9779864029898'}?text=${encodeURIComponent('Hello Affordable Decoration, I would like a free mockup of a custom canvas on my wall.')}`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          <span>💬</span>
          <span>WhatsApp Wall Photo</span>
        </a>
      </div>
    </div>
  );
}
