'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { addToCart } from '@/lib/cart';
import { formatPaisa } from '@/lib/utils';
import type { HomepageSection } from '@/lib/types';
import { optimizeImage } from '@/lib/imageOptimizer';

const SAMPLE_ARTWORKS = [
  {
    id: 'horses-7',
    name: '7 Running Horses (Vastu)',
    url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1000&q=80',
    badge: '🐎 Vastu Best Seller',
  },
  {
    id: 'buddha',
    name: 'Serene Temple Lotus',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    badge: '🪷 Spiritual',
  },
  {
    id: 'abstract',
    name: 'Golden Abstract',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
    badge: '✨ Luxury',
  },
  {
    id: 'mountain',
    name: 'Himalayan Sunrise',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    badge: '🏔️ Nature',
  },
];

const PANEL_PRESETS = [
  { count: 1, label: '1 Panel Single', pricePaisa: 70000, desc: 'Classic focal photo wall print' },
  { count: 3, label: '3 Panel Triptych', pricePaisa: 180000, desc: '3 split continuous panoramic panels' },
  { count: 5, label: '5 Panel Pentaptych', pricePaisa: 240000, desc: '5 staggered chevron wall statement' },
  { count: 7, label: '7 Piece Panoramic', pricePaisa: 300000, desc: '7 piece expansive grand wall feature' },
];

const TSHIRT_COLORS = [
  { id: 'white', name: 'Crisp White', hex: '#FFFFFF', border: true },
  { id: 'black', name: 'Pitch Black', hex: '#18181B' },
  { id: 'navy', name: 'Deep Navy', hex: '#1E293B' },
  { id: 'maroon', name: 'Vintage Maroon', hex: '#800020' },
];

export function CustomCanvasCta({ section }: { section: HomepageSection }) {
  const [activeTab, setActiveTab] = useState<'canvas' | 'tshirt'>('canvas');

  // Canvas state
  const [selectedPanelCount, setSelectedPanelCount] = useState<number>(3);
  const [selectedArtUrl, setSelectedArtUrl] = useState<string>(SAMPLE_ARTWORKS[0].url);
  const [uploadedArtUrl, setUploadedArtUrl] = useState<string | null>(null);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  // T-Shirt state
  const [tshirtColor, setTshirtColor] = useState(TSHIRT_COLORS[0]);
  const [tshirtSize, setTshirtSize] = useState('L');

  const currentPreset = PANEL_PRESETS.find((p) => p.count === selectedPanelCount) || PANEL_PRESETS[1];
  const activeImageSrc = uploadedArtUrl || selectedArtUrl;

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await optimizeImage(file, { preset: activeTab === 'canvas' ? 'canvas' : 'tshirt' });
        setUploadedArtUrl(result.previewUrl);
      } catch (err) {
        console.warn('Optimization notice, using fallback URL:', err);
        const url = URL.createObjectURL(file);
        setUploadedArtUrl(url);
      }
    }
  }

  function handleAddQuickCanvasToCart() {
    addToCart({
      type: 'custom_canvas',
      name: `Custom ${selectedPanelCount}-Panel Wall Canvas`,
      imageUrl: activeImageSrc,
      sizeLabel: `${currentPreset.label}`,
      frameLabel: 'Wrapped Canvas',
      quantity: 1,
      unitPricePaisa: currentPreset.pricePaisa,
    });
    setAddedMessage(`✓ Added ${selectedPanelCount}-Panel Canvas to Cart!`);
    setTimeout(() => setAddedMessage(null), 3000);
  }

  function handleAddQuickTShirtToCart() {
    addToCart({
      type: 'custom_tshirt',
      name: `Custom Apparel T-Shirt (${tshirtColor.name})`,
      imageUrl: activeImageSrc,
      sizeLabel: tshirtSize,
      colorLabel: tshirtColor.name,
      quantity: 1,
      unitPricePaisa: 79900,
    });
    setAddedMessage(`✓ Added Custom ${tshirtColor.name} T-Shirt to Cart!`);
    setTimeout(() => setAddedMessage(null), 3000);
  }

  return (
    <section className="relative bg-gradient-to-b from-surface/60 via-bg to-surface/40 border-y border-border/80 py-12 sm:py-20 overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container-page relative z-10 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase font-extrabold tracking-widest text-amber-600 dark:text-amber-400 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Studio Customizer</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-text tracking-tight">
            {section.title || 'Live Product Customization Studio'}
          </h2>

          <p className="text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed">
            {section.subtitle || 'Preview photo panel splits or design custom apparel in real-time right here.'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="inline-flex p-1.5 rounded-2xl bg-surface/90 border border-border/80 shadow-md backdrop-blur-sm mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('canvas')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'canvas'
                  ? 'bg-amber-600 text-white shadow-md scale-[1.02]'
                  : 'text-muted hover:text-text hover:bg-surface-hover/50'
              }`}
            >
              <span>🖼️</span>
              <span>Custom Photo Canvas</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tshirt')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'tshirt'
                  ? 'bg-amber-600 text-white shadow-md scale-[1.02]'
                  : 'text-muted hover:text-text hover:bg-surface-hover/50'
              }`}
            >
              <span>👕</span>
              <span>Custom Printed T-Shirt</span>
            </button>
          </div>
        </div>

        {/* Floating Success Toast Notice */}
        {addedMessage && (
          <div className="max-w-md mx-auto p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm text-center shadow-lg animate-bounce flex items-center justify-center gap-2">
            <span>✨</span>
            <span>{addedMessage}</span>
          </div>
        )}

        {/* Tab 1: Custom Canvas Builder */}
        {activeTab === 'canvas' && (
          <div className="grid gap-8 lg:grid-cols-12 items-stretch bg-surface/90 backdrop-blur-md p-6 sm:p-10 rounded-3xl border border-border/80 shadow-2xl transition-all">
            {/* Controls Left Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-text">
                      1. Select Panel Split Layout
                    </label>
                    <span className="text-[11px] text-amber-600 font-semibold">1 to 7 Panels Available</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {PANEL_PRESETS.map((preset) => {
                      const isSelected = selectedPanelCount === preset.count;
                      return (
                        <button
                          key={preset.count}
                          type="button"
                          onClick={() => setSelectedPanelCount(preset.count)}
                          className={`p-3.5 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'border-amber-600 bg-amber-500/10 text-text font-bold shadow-md ring-2 ring-amber-600/40'
                              : 'border-border/80 bg-bg/80 hover:bg-surface-hover text-muted hover:text-text'
                          }`}
                        >
                          <div className="text-xs font-bold text-text flex items-center justify-between">
                            <span>{preset.label}</span>
                            {isSelected && <span className="text-amber-600 text-xs">✓</span>}
                          </div>
                          <div className="text-xs text-amber-600 font-mono font-extrabold mt-1">
                            {formatPaisa(preset.pricePaisa)}
                          </div>
                          <div className="text-[10px] text-muted truncate mt-0.5">{preset.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text block mb-2.5">
                    2. Choose Sample Art or Upload Photo
                  </label>
                  <div className="grid grid-cols-4 gap-2.5 mb-3">
                    {SAMPLE_ARTWORKS.map((art) => (
                      <button
                        key={art.id}
                        type="button"
                        onClick={() => {
                          setSelectedArtUrl(art.url);
                          setUploadedArtUrl(null);
                        }}
                        className={`relative aspect-square rounded-2xl overflow-hidden border transition-all ${
                          !uploadedArtUrl && selectedArtUrl === art.url
                            ? 'border-amber-600 ring-2 ring-amber-600/50 shadow-md scale-[1.03]'
                            : 'border-border/80 opacity-75 hover:opacity-100'
                        }`}
                        title={art.name}
                      >
                        <Image src={art.url} alt={art.name} fill className="object-cover" />
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer text-xs font-bold text-amber-600 transition-all shadow-xs group">
                    <span className="group-hover:scale-110 transition-transform">📸</span>
                    <span>Upload Your Custom Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="pt-4 border-t border-border/80 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted font-bold uppercase tracking-wider">Estimated Total:</span>
                  <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
                    {formatPaisa(currentPreset.pricePaisa)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleAddQuickCanvasToCart}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>🛒</span>
                    <span>Add {selectedPanelCount}-Panel to Cart</span>
                  </button>
                  <Link
                    href={`/custom-canvas?panels=${selectedPanelCount}`}
                    className="flex-1 py-3.5 px-4 rounded-xl border border-border bg-bg/80 hover:bg-surface-hover text-text text-center font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>🎨 Open Studio</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Live Panel Visualizer Right Column */}
            <div className="lg:col-span-7 relative min-h-[340px] sm:min-h-[420px] w-full rounded-2xl overflow-hidden border border-border/80 bg-zinc-950 shadow-2xl p-6 flex flex-col justify-between">
              <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80')" }} />

              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-md">
                  Live Preview • {currentPreset.label}
                </span>
                <span className="text-[10px] font-bold text-white/80 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                  Wall Background Mockup
                </span>
              </div>

              {/* Panels Split Display */}
              <div className="relative z-10 my-auto flex items-center justify-center gap-1.5 sm:gap-2 w-full h-[68%] px-2">
                {Array.from({ length: selectedPanelCount }).map((_, i) => {
                  const widthPct = (100 / selectedPanelCount).toFixed(2);
                  return (
                    <div
                      key={i}
                      className="relative h-full overflow-hidden rounded-lg shadow-2xl border border-white/20 transition-all duration-300 transform hover:scale-[1.02]"
                      style={{ width: `${widthPct}%` }}
                    >
                      <Image
                        src={activeImageSrc}
                        alt="Canvas Panel Split Preview"
                        fill
                        className="object-cover"
                        style={{
                          objectPosition: `${(i / Math.max(1, selectedPanelCount - 1)) * 100}% center`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="relative z-10 text-center bg-black/60 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                <p className="text-[11px] text-white/80 font-medium">
                  Continuous high-definition photo split across {selectedPanelCount} handcrafted pine wood wrapped canvas panels.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Custom T-Shirt Builder */}
        {activeTab === 'tshirt' && (
          <div className="grid gap-8 lg:grid-cols-12 items-stretch bg-surface/90 backdrop-blur-md p-6 sm:p-10 rounded-3xl border border-border/80 shadow-2xl transition-all">
            {/* Controls Left Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text block mb-2.5">
                    1. Select Apparel Color
                  </label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {TSHIRT_COLORS.map((c) => {
                      const isSelected = tshirtColor.id === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setTshirtColor(c)}
                          className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                            isSelected
                              ? 'border-amber-600 bg-amber-500/10 font-bold shadow-md ring-2 ring-amber-600/40'
                              : 'border-border/80 bg-bg/80 hover:bg-surface-hover text-muted'
                          }`}
                        >
                          <span
                            className="h-6 w-6 rounded-full border border-black/20 shadow-sm"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-[10px] font-semibold truncate max-w-full">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text block mb-2.5">
                    2. Choose Size
                  </label>
                  <div className="flex gap-2">
                    {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setTshirtSize(sz)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          tshirtSize === sz
                            ? 'border-amber-600 bg-amber-600 text-white shadow-md scale-[1.02]'
                            : 'border-border/80 bg-bg/80 text-muted hover:text-text'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text block mb-2.5">
                    3. Select Artwork or Upload Graphic
                  </label>
                  <div className="grid grid-cols-4 gap-2.5 mb-3">
                    {SAMPLE_ARTWORKS.map((art) => (
                      <button
                        key={art.id}
                        type="button"
                        onClick={() => {
                          setSelectedArtUrl(art.url);
                          setUploadedArtUrl(null);
                        }}
                        className={`relative aspect-square rounded-2xl overflow-hidden border transition-all ${
                          !uploadedArtUrl && selectedArtUrl === art.url
                            ? 'border-amber-600 ring-2 ring-amber-600/50 shadow-md scale-[1.03]'
                            : 'border-border/80 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <Image src={art.url} alt={art.name} fill className="object-cover" />
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer text-xs font-bold text-amber-600 transition-all shadow-xs group">
                    <span className="group-hover:scale-110 transition-transform">📸</span>
                    <span>Upload Print Design</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="pt-4 border-t border-border/80 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted font-bold uppercase tracking-wider">Custom T-Shirt Total:</span>
                  <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
                    Rs. 799
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleAddQuickTShirtToCart}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>🛒</span>
                    <span>Add Custom T-Shirt to Cart</span>
                  </button>
                  <Link
                    href="/custom-t-shirt"
                    className="flex-1 py-3.5 px-4 rounded-xl border border-border bg-bg/80 hover:bg-surface-hover text-text text-center font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>👕 Full Builder</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Live T-Shirt Mockup Visual Right Column */}
            <div className="lg:col-span-7 relative min-h-[340px] sm:min-h-[420px] w-full rounded-2xl overflow-hidden border border-border/80 bg-zinc-950 p-6 flex flex-col justify-between items-center shadow-2xl">
              <div className="w-full flex items-center justify-between z-10">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-md">
                  Live Apparel Preview • {tshirtColor.name} ({tshirtSize})
                </span>
                <span className="text-[10px] font-bold text-white/80 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                  180 GSM Combed Cotton
                </span>
              </div>

              {/* T-Shirt Shape Preview Container */}
              <div
                className="relative h-[75%] aspect-[3/4] rounded-3xl shadow-2xl p-6 flex items-center justify-center border border-white/20 transition-all duration-300 my-auto"
                style={{ backgroundColor: tshirtColor.hex }}
              >
                <div className="relative aspect-square w-32 sm:w-44 rounded-2xl overflow-hidden border-2 border-dashed border-amber-400/90 shadow-2xl">
                  <Image
                    src={activeImageSrc}
                    alt="Custom Print Artwork"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="relative z-10 text-center bg-black/60 backdrop-blur-md p-2.5 rounded-xl border border-white/10 w-full">
                <p className="text-[11px] text-white/80 font-medium">
                  High-definition direct-to-garment (DTG) print on 100% premium combed cotton.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

