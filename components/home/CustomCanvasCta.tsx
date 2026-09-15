'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { addToCart } from '@/lib/cart';
import { formatPaisa } from '@/lib/utils';
import type { HomepageSection } from '@/lib/types';

const SAMPLE_ARTWORKS = [
  {
    id: 'horses-7',
    name: '7 Running Horses (Vastu)',
    url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'buddha',
    name: 'Serene Temple Lotus',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'abstract',
    name: 'Golden Abstract',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'mountain',
    name: 'Himalayan Sunrise',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
  },
];

const PANEL_PRESETS = [
  { count: 1, label: '1 Panel Single', pricePaisa: 150000, desc: 'Classic single photo wall statement' },
  { count: 3, label: '3 Panel Triptych', pricePaisa: 480000, desc: '3 split continuous panoramic panels' },
  { count: 5, label: '5 Panel Pentaptych', pricePaisa: 690000, desc: '5 staggered chevron wall split' },
  { count: 7, label: '7 Piece Panoramic', pricePaisa: 1190000, desc: '7 piece panoramic grand wall feature' },
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

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedArtUrl(url);
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
    <section className="bg-surface-hover/60 border-y border-border py-12 sm:py-16">
      <div className="container-page space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-amber-600 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            🎨 Interactive Customizer Studio
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-text">
            {section.title || 'Live Product Customization Studio'}
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            {section.subtitle || 'Test photo panel splits or design custom apparel right on the homepage.'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-surface border border-border shadow-sm mt-4">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'canvas'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              🖼️ Custom Photo Canvas
            </button>
            <button
              onClick={() => setActiveTab('tshirt')}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tshirt'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              👕 Custom Printed T-Shirt
            </button>
          </div>
        </div>

        {addedMessage && (
          <div className="max-w-md mx-auto p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs text-center animate-bounce">
            {addedMessage}
          </div>
        )}

        {/* Tab 1: Custom Canvas Builder */}
        {activeTab === 'canvas' && (
          <div className="grid gap-8 lg:grid-cols-12 items-start bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-xl">
            {/* Controls Left Column */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <label className="text-xs font-bold text-text block mb-2">
                  1. Select Panel Split Layout
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PANEL_PRESETS.map((preset) => (
                    <button
                      key={preset.count}
                      onClick={() => setSelectedPanelCount(preset.count)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedPanelCount === preset.count
                          ? 'border-amber-600 bg-amber-500/10 text-text font-bold shadow-sm ring-1 ring-amber-600'
                          : 'border-border bg-bg hover:bg-surface-hover text-muted'
                      }`}
                    >
                      <div className="text-xs font-bold">{preset.label}</div>
                      <div className="text-[11px] text-amber-600 font-mono mt-0.5">
                        {formatPaisa(preset.pricePaisa)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text block mb-2">
                  2. Choose Artwork or Upload Your Photo
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {SAMPLE_ARTWORKS.map((art) => (
                    <button
                      key={art.id}
                      onClick={() => {
                        setSelectedArtUrl(art.url);
                        setUploadedArtUrl(null);
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border transition-all ${
                        !uploadedArtUrl && selectedArtUrl === art.url
                          ? 'border-amber-600 ring-2 ring-amber-600'
                          : 'border-border opacity-70 hover:opacity-100'
                      }`}
                      title={art.name}
                    >
                      <Image src={art.url} alt={art.name} fill className="object-cover" />
                    </button>
                  ))}
                </div>

                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer text-xs font-bold text-amber-600 transition-colors">
                  <span>📸</span>
                  <span>Upload Your Favorite Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Price & Actions */}
              <div className="pt-2 border-t border-border space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted font-semibold">Estimated Final Total:</span>
                  <span className="text-2xl font-extrabold text-amber-600">
                    {formatPaisa(currentPreset.pricePaisa)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={handleAddQuickCanvasToCart}
                    className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    🛒 Add {selectedPanelCount}-Panel Canvas to Cart
                  </button>
                  <Link
                    href={`/custom-canvas?panels=${selectedPanelCount}`}
                    className="flex-1 py-3 px-4 rounded-xl border border-border bg-bg hover:bg-surface-hover text-text text-center font-bold text-xs transition-colors"
                  >
                    🎨 Open Full Canvas Studio →
                  </Link>
                </div>
              </div>
            </div>

            {/* Live Panel Visualizer Right Column */}
            <div className="lg:col-span-7 relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-border bg-zinc-900 shadow-inner p-6 flex flex-col justify-between">
              <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80')" }} />

              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-black/60 px-2.5 py-1 rounded-full border border-white/10">
                  Live Preview • {currentPreset.label}
                </span>
                <span className="text-[10px] font-bold text-white/80 bg-black/60 px-2 py-0.5 rounded">
                  Wall Background Mockup
                </span>
              </div>

              {/* Panels Split Display */}
              <div className="relative z-10 my-auto flex items-center justify-center gap-1.5 w-full h-[65%] px-4">
                {Array.from({ length: selectedPanelCount }).map((_, i) => {
                  const widthPct = (100 / selectedPanelCount).toFixed(2);
                  return (
                    <div
                      key={i}
                      className="relative h-full overflow-hidden rounded shadow-2xl border border-white/20 transition-all duration-300 transform hover:scale-[1.02]"
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

              <div className="relative z-10 text-center">
                <p className="text-[11px] text-white/70 font-medium">
                  Continuous high-definition photo split across {selectedPanelCount} handcrafted pine wood wrapped panels.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Custom T-Shirt Builder */}
        {activeTab === 'tshirt' && (
          <div className="grid gap-8 lg:grid-cols-12 items-start bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-xl">
            {/* Controls Left Column */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <label className="text-xs font-bold text-text block mb-2">
                  1. Select Apparel Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TSHIRT_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setTshirtColor(c)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        tshirtColor.id === c.id
                          ? 'border-amber-600 bg-amber-500/10 font-bold shadow-sm ring-1 ring-amber-600'
                          : 'border-border bg-bg hover:bg-surface-hover text-muted'
                      }`}
                    >
                      <span
                        className="h-6 w-6 rounded-full border border-black/20 shadow-sm"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[10px] truncate max-w-full">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text block mb-2">
                  2. Choose Size
                </label>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setTshirtSize(sz)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                        tshirtSize === sz
                          ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                          : 'border-border bg-bg text-muted hover:text-text'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text block mb-2">
                  3. Select Graphic Artwork or Upload
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {SAMPLE_ARTWORKS.map((art) => (
                    <button
                      key={art.id}
                      onClick={() => {
                        setSelectedArtUrl(art.url);
                        setUploadedArtUrl(null);
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border transition-all ${
                        !uploadedArtUrl && selectedArtUrl === art.url
                          ? 'border-amber-600 ring-2 ring-amber-600'
                          : 'border-border opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={art.url} alt={art.name} fill className="object-cover" />
                    </button>
                  ))}
                </div>

                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer text-xs font-bold text-amber-600 transition-colors">
                  <span>📸</span>
                  <span>Upload Your Print Design</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Price & Actions */}
              <div className="pt-2 border-t border-border space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted font-semibold">Custom T-Shirt Total:</span>
                  <span className="text-2xl font-extrabold text-amber-600">Rs. 799</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={handleAddQuickTShirtToCart}
                    className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    🛒 Add Custom T-Shirt to Cart
                  </button>
                  <Link
                    href="/custom-t-shirt"
                    className="flex-1 py-3 px-4 rounded-xl border border-border bg-bg hover:bg-surface-hover text-text text-center font-bold text-xs transition-colors"
                  >
                    👕 Open Full T-Shirt Builder →
                  </Link>
                </div>
              </div>
            </div>

            {/* Live T-Shirt Mockup Visual Right Column */}
            <div className="lg:col-span-7 relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-border bg-zinc-900 p-6 flex flex-col justify-between items-center">
              <div className="w-full flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-black/60 px-2.5 py-1 rounded-full border border-white/10">
                  Live Apparel Preview • {tshirtColor.name} ({tshirtSize})
                </span>
                <span className="text-[10px] font-bold text-white/80 bg-black/60 px-2 py-0.5 rounded">
                  100% Combed Cotton
                </span>
              </div>

              {/* T-Shirt Shape Preview Container */}
              <div
                className="relative h-[75%] aspect-[3/4] rounded-2xl shadow-2xl p-6 flex items-center justify-center border border-white/20 transition-all duration-300"
                style={{ backgroundColor: tshirtColor.hex }}
              >
                <div className="relative aspect-square w-32 sm:w-40 rounded-xl overflow-hidden border-2 border-dashed border-amber-400/80 shadow-lg">
                  <Image
                    src={activeImageSrc}
                    alt="Custom Print Artwork"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <p className="text-[11px] text-white/70 text-center font-medium">
                High-definition direct-to-garment (DTG) print on premium 180 GSM combed cotton.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
