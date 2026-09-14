'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { PhotoUpload, type UploadedPhoto } from '@/components/custom-canvas/PhotoUpload';
import { OptionSelector } from '@/components/custom-canvas/OptionSelector';
import { DesignLibrary } from './DesignLibrary';
import { addToCart } from '@/lib/cart';
import { formatPaisa } from '@/lib/utils';
import type {
  TShirtType,
  TShirtColor,
  TShirtSize,
  PrintLocation,
  TShirtDesign,
  Settings,
} from '@/lib/types';

const TShirtEditor = dynamic(
  () => import('./TShirtEditor').then((m) => m.TShirtEditor),
  { ssr: false, loading: () => <EditorPlaceholder /> }
);

interface TShirtBuilderClientProps {
  tshirtTypes: TShirtType[];
  colors: TShirtColor[];
  sizes: TShirtSize[];
  printLocations: PrintLocation[];
  designs: TShirtDesign[];
  settings: Settings;
}

const DEFAULT_DEMO_DESIGN: TShirtDesign = {
  id: 'demo-art-1',
  name: 'Nepal Everest Skyline',
  theme: 'Nepalese',
  image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
  price_paisa: 0,
  active: true,
  sort_order: 1,
};

const FONTS = [
  'Plus Jakarta Sans',
  'Playfair Display',
  'Inter',
  'Courier New',
  'Impact',
];

const TEXT_COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#18181b' },
  { name: 'Gold', hex: '#d97706' },
  { name: 'Crimson', hex: '#e11d48' },
  { name: 'Navy', hex: '#1e3a8a' },
];

export function TShirtBuilderClient({
  tshirtTypes,
  colors,
  sizes,
  printLocations,
  designs,
  settings,
}: TShirtBuilderClientProps) {
  // Database fallbacks if unseeded
  const activeTypes =
    tshirtTypes.length > 0
      ? tshirtTypes
      : [
          {
            id: 't1',
            name: '100% Premium Cotton Crewneck',
            description: 'Soft, durable 180 GSM combed cotton',
            base_price_paisa: 69900,
            mockup_template_url: null,
            status: 'published' as const,
            sort_order: 1,
          },
          {
            id: 't2',
            name: 'Heavyweight Oversized Streetwear T-Shirt',
            description: '240 GSM drop shoulder streetwear fit',
            base_price_paisa: 89900,
            mockup_template_url: null,
            status: 'published' as const,
            sort_order: 2,
          },
        ];

  const activeColors =
    colors.length > 0
      ? colors
      : [
          { id: 'c1', name: 'White', color_hex: '#ffffff', additional_price_paisa: 0, active: true, sort_order: 1 },
          { id: 'c2', name: 'Charcoal Black', color_hex: '#18181b', additional_price_paisa: 0, active: true, sort_order: 2 },
          { id: 'c3', name: 'Heather Grey', color_hex: '#94a3b8', additional_price_paisa: 0, active: true, sort_order: 3 },
          { id: 'c4', name: 'Crimson Red', color_hex: '#991b1b', additional_price_paisa: 0, active: true, sort_order: 4 },
          { id: 'c5', name: 'Navy Blue', color_hex: '#1e3a8a', additional_price_paisa: 0, active: true, sort_order: 5 },
          { id: 'c6', name: 'Pastel Pink', color_hex: '#f472b6', additional_price_paisa: 0, active: true, sort_order: 6 },
        ];

  const activeSizes =
    sizes.length > 0
      ? sizes
      : [
          { id: 's1', name: 'Small (S)', code: 'S', price_adjustment_paisa: 0, active: true, sort_order: 1 },
          { id: 's2', name: 'Medium (M)', code: 'M', price_adjustment_paisa: 0, active: true, sort_order: 2 },
          { id: 's3', name: 'Large (L)', code: 'L', price_adjustment_paisa: 0, active: true, sort_order: 3 },
          { id: 's4', name: 'Extra Large (XL)', code: 'XL', price_adjustment_paisa: 0, active: true, sort_order: 4 },
          { id: 's5', name: 'Double XL (2XL)', code: 'XXL', price_adjustment_paisa: 10000, active: true, sort_order: 5 },
        ];

  const activePrintLocations =
    printLocations.length > 0
      ? printLocations
      : [
          { id: 'l1', name: 'Center Chest Print', code: 'center_front', additional_price_paisa: 0, active: true, sort_order: 1 },
          { id: 'l2', name: 'Left Chest Emblem', code: 'left_chest', additional_price_paisa: 0, active: true, sort_order: 2 },
          { id: 'l3', name: 'Full Front Print', code: 'full_front', additional_price_paisa: 0, active: true, sort_order: 3 },
          { id: 'l4', name: 'Upper Back Print', code: 'upper_back', additional_price_paisa: 0, active: true, sort_order: 4 },
          { id: 'l5', name: 'Full Back Print', code: 'full_back', additional_price_paisa: 0, active: true, sort_order: 5 },
          { id: 'l6', name: 'Left Sleeve Badge', code: 'sleeve_left', additional_price_paisa: 0, active: true, sort_order: 6 },
          { id: 'l7', name: 'Right Sleeve Badge', code: 'sleeve_right', additional_price_paisa: 0, active: true, sort_order: 7 },
        ];

  const activeDesigns = designs.length > 0 ? designs : [DEFAULT_DEMO_DESIGN];

  // Selection states
  const [selectedTypeId, setSelectedTypeId] = useState(activeTypes[0]?.id || 't1');
  const [selectedColorId, setSelectedColorId] = useState(activeColors[0]?.id || 'c1');
  const [selectedSizeId, setSelectedSizeId] = useState(activeSizes[1]?.id || 's2');
  const [selectedLocationId, setSelectedLocationId] = useState(activePrintLocations[0]?.id || 'l1');
  const [viewSide, setViewSide] = useState<'front' | 'back' | 'sleeve'>('front');

  // Artwork & Custom Text states
  const [designMode, setDesignMode] = useState<'catalog' | 'upload'>('catalog');
  const [selectedDesign, setSelectedDesign] = useState<TShirtDesign | null>(activeDesigns[0] || null);
  const [uploadedDesign, setUploadedDesign] = useState<UploadedPhoto | null>(null);

  const [customText, setCustomText] = useState('');
  const [textFont, setTextFont] = useState(FONTS[0]);
  const [textColor, setTextColor] = useState(TEXT_COLORS[0].hex);

  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedType = activeTypes.find((t) => t.id === selectedTypeId) || activeTypes[0];
  const selectedColor = activeColors.find((c) => c.id === selectedColorId) || activeColors[0];
  const selectedSize = activeSizes.find((s) => s.id === selectedSizeId) || activeSizes[0];
  const selectedLocation = activePrintLocations.find((l) => l.id === selectedLocationId) || activePrintLocations[0];

  const activeArtworkUrl =
    designMode === 'upload'
      ? uploadedDesign?.url
      : selectedDesign?.image_url || DEFAULT_DEMO_DESIGN.image_url;

  // Internal price calculation without exposing raw breakdown details
  const unitPricePaisa = useMemo(() => {
    const base = selectedType.base_price_paisa || 0;
    const colorAdd = selectedColor.additional_price_paisa || 0;
    const sizeAdd = selectedSize.price_adjustment_paisa || 0;
    const locationAdd = selectedLocation.additional_price_paisa || 0;
    const designAdd = designMode === 'catalog' ? selectedDesign?.price_paisa || 0 : 5000;
    const textAdd = customText.trim() ? 5000 : 0;
    return base + colorAdd + sizeAdd + locationAdd + designAdd + textAdd;
  }, [
    selectedType,
    selectedColor,
    selectedSize,
    selectedLocation,
    designMode,
    selectedDesign,
    customText,
  ]);

  const totalPricePaisa = unitPricePaisa * quantity;

  async function handleAddToCart() {
    setSubmitting(true);
    setFeedback(null);
    try {
      addToCart({
        type: 'custom_tshirt',
        name: `Custom T-Shirt (${selectedType.name})`,
        imageUrl: activeArtworkUrl,
        sizeLabel: selectedSize.name,
        colorLabel: selectedColor.name,
        printLocationLabel: selectedLocation.name,
        designLabel: selectedDesign?.name || 'Custom Uploaded Artwork',
        quantity,
        unitPricePaisa,
      });
      setFeedback('✓ Customized T-Shirt added to your shopping cart!');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Left Guided Customization Controls */}
      <div className="space-y-6">
        {/* Step 1: Model & Color Palette */}
        <div className="rounded-2xl border border-border p-5 bg-surface/50 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">1</span>
            <h2 className="text-base font-semibold">T-Shirt Model &amp; Color</h2>
          </div>

          <OptionSelector
            label="Select Apparel Model"
            options={activeTypes.map((t) => ({
              id: t.id,
              label: t.name,
            }))}
            selectedId={selectedTypeId}
            onSelect={setSelectedTypeId}
          />

          <div>
            <label className="text-xs font-semibold text-muted mb-2 block uppercase tracking-wider">
              T-Shirt Color Palette
            </label>
            <div className="flex flex-wrap gap-2.5">
              {activeColors.map((c) => {
                const isSelected = selectedColorId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColorId(c.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-amber-600 bg-amber-500/10 text-amber-600 font-semibold ring-2 ring-amber-500/30'
                        : 'border-border bg-surface hover:border-text/30'
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-black/20 shadow-inner"
                      style={{ backgroundColor: c.color_hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 2: Size & Printable Area Selection */}
        <div className="rounded-2xl border border-border p-5 bg-surface/50 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">2</span>
            <h2 className="text-base font-semibold">Size &amp; Printable Area</h2>
          </div>

          <OptionSelector
            label="Select Size"
            options={activeSizes.map((s) => ({
              id: s.id,
              label: s.name,
            }))}
            selectedId={selectedSizeId}
            onSelect={setSelectedSizeId}
          />

          <OptionSelector
            label="Print Area Location"
            options={activePrintLocations.map((l) => ({
              id: l.id,
              label: l.name,
            }))}
            selectedId={selectedLocationId}
            onSelect={(id) => {
              setSelectedLocationId(id);
              const loc = activePrintLocations.find((x) => x.id === id);
              if (loc?.code.includes('back')) setViewSide('back');
              else if (loc?.code.includes('sleeve')) setViewSide('sleeve');
              else setViewSide('front');
            }}
          />

          {/* View Perspective Switcher */}
          <div>
            <label className="text-xs font-semibold text-muted mb-2 block uppercase tracking-wider">
              Mockup View Perspective
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setViewSide('front')}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                  viewSide === 'front'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-surface border border-border text-muted hover:text-text'
                }`}
              >
                Front View
              </button>
              <button
                type="button"
                onClick={() => setViewSide('back')}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                  viewSide === 'back'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-surface border border-border text-muted hover:text-text'
                }`}
              >
                Back View
              </button>
              <button
                type="button"
                onClick={() => setViewSide('sleeve')}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                  viewSide === 'sleeve'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-surface border border-border text-muted hover:text-text'
                }`}
              >
                Sleeve View
              </button>
            </div>
          </div>
        </div>

        {/* Step 3: Choose Ready-Made Graphic OR Upload Custom Photo */}
        <div className="rounded-2xl border border-border p-5 bg-surface/50 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">3</span>
            <h2 className="text-base font-semibold">Choose Graphic Art OR Upload</h2>
          </div>

          <div className="flex rounded-xl border border-border bg-bg p-1 text-xs">
            <button
              type="button"
              onClick={() => setDesignMode('catalog')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                designMode === 'catalog'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              🎨 Ready-Made Designs
            </button>
            <button
              type="button"
              onClick={() => setDesignMode('upload')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                designMode === 'upload'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              📤 Upload Custom Photo
            </button>
          </div>

          {designMode === 'catalog' ? (
            <DesignLibrary
              designs={activeDesigns}
              selectedDesignId={selectedDesign?.id}
              onSelectDesign={setSelectedDesign}
            />
          ) : (
            <PhotoUpload
              onUploaded={setUploadedDesign}
              maxUploadSizeMb={settings.max_upload_size_mb}
            />
          )}
        </div>

        {/* Step 4: Custom Text Line Overlay (Optional) */}
        <div className="rounded-2xl border border-border p-5 bg-surface/50 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">4</span>
            <h2 className="text-base font-semibold">Custom Text Line (Optional)</h2>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted mb-1 block">Custom Text</label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. 'Kathmandu Originals' or 'EST 2026'"
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          {customText && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs text-muted mb-1 block">Font Style</label>
                <select
                  value={textFont}
                  onChange={(e) => setTextFont(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs"
                >
                  {FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted mb-1 block">Text Color</label>
                <div className="flex items-center gap-2 pt-1">
                  {TEXT_COLORS.map((tc) => (
                    <button
                      key={tc.name}
                      type="button"
                      onClick={() => setTextColor(tc.hex)}
                      className={`h-6 w-6 rounded-full border border-border ${
                        textColor === tc.hex ? 'ring-2 ring-amber-600' : ''
                      }`}
                      style={{ backgroundColor: tc.hex }}
                      title={tc.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Live Mockup Preview & Clean E-Commerce Order Summary */}
      <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-border p-5 bg-surface shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-text flex items-center gap-2">
              <span>👕</span> Realistic Product Mockup
            </h2>
            <span className="text-xs font-bold text-amber-600 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              {selectedColor.name} • {viewSide.toUpperCase()}
            </span>
          </div>

          <TShirtEditor
            colorHex={selectedColor.color_hex}
            colorName={selectedColor.name}
            designUrl={activeArtworkUrl}
            customText={customText}
            textFont={textFont}
            textColor={textColor}
            printAreaCode={selectedLocation.code}
            viewSide={viewSide}
          />
        </div>

        {/* Clean E-Commerce Summary (No Complicated Pricing Details) */}
        <div className="rounded-2xl border border-border p-5 bg-surface shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-bold text-text">Order Summary</h3>
            <span className="text-2xl font-extrabold text-amber-600">{formatPaisa(totalPricePaisa)}</span>
          </div>

          <div className="space-y-2 text-xs text-muted">
            <div className="flex justify-between">
              <span>Apparel Model:</span>
              <span className="font-bold text-text">{selectedType.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Selected Size:</span>
              <span className="font-bold text-text">{selectedSize.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Selected Color:</span>
              <span className="font-bold text-text">{selectedColor.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Print Location:</span>
              <span className="font-bold text-text">{selectedLocation.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Artwork / Design:</span>
              <span className="font-bold text-text">
                {designMode === 'catalog' ? selectedDesign?.name || 'Standard Graphic' : 'Custom Upload'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <label className="text-xs font-bold text-text">Quantity:</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-8 w-8 rounded-lg border border-border bg-bg font-bold hover:border-amber-600 active:scale-95"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="h-8 w-8 rounded-lg border border-border bg-bg font-bold hover:border-amber-600 active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {feedback && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              {feedback}
            </div>
          )}

          <button
            type="button"
            disabled={submitting}
            onClick={handleAddToCart}
            className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Adding to Cart…' : 'Add Custom T-Shirt to Cart 🛒'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditorPlaceholder() {
  return (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-hover p-6 text-center text-muted">
      <span className="text-3xl mb-2">👕</span>
      <p className="text-sm font-medium text-text">Loading T-Shirt Customizer Mockup…</p>
    </div>
  );
}
