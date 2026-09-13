'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { PhotoUpload, type UploadedPhoto } from './PhotoUpload';
import { OptionSelector } from './OptionSelector';
import { PriceSummary } from './PriceSummary';
import { InquiryForm, type InquiryFormValues } from './InquiryForm';
import { calculatePrice, estimateImageQuality } from '@/lib/pricing';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { addToCart } from '@/lib/cart';
import type {
  CanvasSize,
  Finish,
  Frame,
  PanelCropData,
  PanelType,
  Settings,
} from '@/lib/types';

const CanvasEditor = dynamic(
  () => import('./CanvasEditor').then((m) => m.CanvasEditor),
  { ssr: false, loading: () => <PreviewPlaceholder /> }
);

interface CanvasBuilderClientProps {
  panelTypes: PanelType[];
  sizes: CanvasSize[];
  frames: Frame[];
  finishes: Finish[];
  settings: Settings;
}

const CANVAS_TYPES = [
  { id: 'portrait', name: 'Personal Portrait', icon: '👤' },
  { id: 'family', name: 'Family & Memories', icon: '👨‍👩‍👧‍👦' },
  { id: 'couple', name: 'Couple & Romance', icon: '❤️' },
  { id: 'pet', name: 'Pet Portrait', icon: '🐾' },
  { id: 'wedding', name: 'Wedding & Anniversary', icon: '💍' },
  { id: 'memorial', name: 'Tribute & Memorial', icon: '🕊️' },
  { id: 'landscape', name: 'Landscape & Art', icon: '🏞️' },
  { id: 'other', name: 'Other Custom Design', icon: '✨' },
];

const ROOM_MOCKUPS = [
  { id: 'none', name: 'Canvas Only', url: null },
  {
    id: 'living',
    name: 'Living Room Wall',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'office',
    name: 'Modern Office',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  },
];

export function CanvasBuilderClient({
  panelTypes,
  sizes,
  frames,
  finishes,
  settings,
}: CanvasBuilderClientProps) {
  const defaultDemoUrl =
    settings.demo_photo_url ||
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80';

  const [selectedCanvasType, setSelectedCanvasType] = useState('portrait');
  const [uploadedPhoto, setUploadedPhoto] = useState<UploadedPhoto | null>(null);
  const [isUsingDemo, setIsUsingDemo] = useState(true);

  const [panelTypeId, setPanelTypeId] = useState<string | null>(
    panelTypes[0]?.id ?? null
  );
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [frameId, setFrameId] = useState<string | null>(null);
  const [finishId, setFinishId] = useState<string | null>(null);
  const [selectedMockupId, setSelectedMockupId] = useState('none');

  const [customText, setCustomText] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cropData, setCropData] = useState<PanelCropData[]>([]);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Initialize photo state with Demo Photo
  const currentPhotoUrl = uploadedPhoto?.url || (isUsingDemo ? defaultDemoUrl : '');

  const sizesForPanelType = useMemo(
    () => (panelTypeId ? sizes.filter((s) => s.panel_type_id === panelTypeId) : sizes),
    [sizes, panelTypeId]
  );

  const selectedPanelType = panelTypes.find((p) => p.id === panelTypeId) ?? panelTypes[0] ?? null;
  const selectedSize = sizesForPanelType.find((s) => s.id === sizeId) ?? sizesForPanelType[0] ?? sizes[0] ?? null;
  const selectedFrame = frames.find((f) => f.id === frameId) ?? null;
  const selectedFinish = finishes.find((f) => f.id === finishId) ?? null;
  const selectedMockup = ROOM_MOCKUPS.find((m) => m.id === selectedMockupId)?.url || null;

  const aspectRatio = selectedSize ? selectedSize.width / selectedSize.height : 4 / 3;

  const qualityRating = useMemo(() => {
    if (!uploadedPhoto || !selectedSize) return null;
    return estimateImageQuality(
      uploadedPhoto.width,
      uploadedPhoto.height,
      selectedSize.width,
      selectedSize.height,
      settings.min_recommended_dpi
    );
  }, [uploadedPhoto, selectedSize, settings.min_recommended_dpi]);

  const price = useMemo(() => {
    if (!selectedSize) return null;
    return calculatePrice({
      basePricePaisa: 0,
      canvasSize: selectedSize,
      frame: selectedFrame,
      finish: selectedFinish,
      quantity,
    });
  }, [selectedSize, selectedFrame, selectedFinish, quantity]);

  const disabledReason = !currentPhotoUrl
    ? 'Upload a photo or use demo photo to preview.'
    : !selectedSize
    ? 'Select a canvas size to continue.'
    : null;

  const formattedPriceRs = price != null ? `Rs. ${Math.round(price / 100).toLocaleString()}` : '';

  const customWhatsappQuery =
    settings.whatsapp_number && selectedSize && price != null
      ? buildWhatsAppLink(settings.whatsapp_number, {
          panelTypeName: selectedPanelType?.name || 'Custom Canvas',
          sizeName: selectedSize.name,
          frameName: selectedFrame?.name,
          finishName: selectedFinish?.name,
          estimatedPricePaisa: price,
          quantity,
        })
      : null;

  function handlePhotoUpload(photo: UploadedPhoto | null) {
    if (photo) {
      setUploadedPhoto(photo);
      setIsUsingDemo(false);
    }
  }

  function handleRestoreDemoPhoto() {
    setUploadedPhoto(null);
    setIsUsingDemo(true);
  }

  async function saveConfiguration(): Promise<string | null> {
    if (!currentPhotoUrl || !selectedSize) return null;

    const res = await fetch('/api/canvas/configure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uploadedImageUrl: currentPhotoUrl,
        uploadedImageMeta: {
          width: uploadedPhoto?.width || 1200,
          height: uploadedPhoto?.height || 800,
          size_bytes: uploadedPhoto?.sizeBytes || 500000,
          quality_rating: qualityRating || 'good',
          canvas_type: selectedCanvasType,
          custom_text: customText,
          is_demo_photo: isUsingDemo,
        },
        panelTypeId: selectedPanelType?.id ?? null,
        canvasSizeId: selectedSize.id,
        frameId: selectedFrame?.id ?? null,
        finishId: selectedFinish?.id ?? null,
        panelGapMm: settings.default_panel_gap_mm,
        cropData,
        quantity,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.id as string;
  }

  async function handleAddToCart() {
    setSubmitting(true);
    setFeedback(null);
    try {
      const configurationId = await saveConfiguration();
      if (!configurationId || !selectedSize || price == null) {
        setFeedback('Something went wrong saving your design. Please try again.');
        return;
      }
      addToCart({
        type: 'custom_canvas',
        name: `Custom Canvas — ${selectedSize.name}`,
        imageUrl: currentPhotoUrl,
        sizeLabel: selectedSize.name,
        frameLabel: selectedFrame?.name || 'Unframed',
        finishLabel: selectedFinish?.name || 'Standard Finish',
        quantity,
        unitPricePaisa: Math.round(price / quantity),
        canvasConfigurationId: configurationId,
      });
      setFeedback('✓ Custom canvas added to your cart successfully!');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleInquirySubmit(values: InquiryFormValues) {
    setSubmitting(true);
    setFeedback(null);
    try {
      const configurationId = await saveConfiguration();
      const res = await fetch('/api/canvas/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canvasConfigurationId: configurationId,
          customerName: values.name,
          customerPhone: values.phone,
          customerEmail: values.email || null,
          message: values.message || null,
        }),
      });

      if (!res.ok) {
        setFeedback('Could not send your inquiry. Please try WhatsApp instead.');
        return;
      }

      const data = await res.json();
      setFeedback(
        `✓ Your custom canvas request has been sent! Reference ID: ${data.inquiryNumber}`
      );
      setShowInquiryForm(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Left Column: Interactive Guided Options */}
      <div className="space-y-8">
        {/* Notice for Demo Photo */}
        {isUsingDemo && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎨</span>
              <div>
                <p className="font-bold text-amber-700 dark:text-amber-300">
                  Testing with Sample Demo Photo
                </p>
                <p className="text-xs text-muted">
                  Test 1, 3, or 5 Panel splits, sizes &amp; frame borders below. Upload your photo when ready!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Canvas Type */}
        <div className="rounded-xl border border-border p-5 bg-surface/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">1</span>
            <h2 className="text-base font-semibold">Choose Canvas Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CANVAS_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedCanvasType(type.id)}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all ${
                  selectedCanvasType === type.id
                    ? 'border-amber-600 bg-amber-500/10 text-amber-600 font-semibold shadow-sm'
                    : 'border-border bg-surface hover:border-text/30'
                }`}
              >
                <span className="text-xl">{type.icon}</span>
                <span className="text-center">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Upload Photo & Demo Toggle */}
        <div className="rounded-xl border border-border p-5 bg-surface/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">2</span>
              <h2 className="text-base font-semibold">Upload Your Photo</h2>
            </div>
            {!isUsingDemo && (
              <button
                type="button"
                onClick={handleRestoreDemoPhoto}
                className="text-xs text-amber-600 hover:underline font-semibold"
              >
                ↺ Try Sample Demo Photo
              </button>
            )}
          </div>

          <PhotoUpload
            onUploaded={handlePhotoUpload}
            maxUploadSizeMb={settings.max_upload_size_mb}
          />

          {qualityRating && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
                qualityRating === 'excellent'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : qualityRating === 'good'
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300'
              }`}
            >
              <span className="text-base">
                {qualityRating === 'excellent' ? '🌟' : qualityRating === 'good' ? '👍' : '⚠️'}
              </span>
              <div>
                <p className="font-semibold uppercase tracking-wider text-[11px]">
                  Quality Indicator: {qualityRating.replace('_', ' ')}
                </p>
                <p className="text-[12px] opacity-90">
                  {qualityRating === 'excellent' && 'Your photo has high resolution and will print sharply on canvas.'}
                  {qualityRating === 'good' && 'Your image resolution is good for this canvas size.'}
                  {qualityRating === 'low_resolution' &&
                    'Your photo may appear less detailed at this size. We recommend higher resolution if available.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Select 1, 3, or 5 Panels & Size */}
        <div className="rounded-xl border border-border p-5 bg-surface/50 space-y-5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">3</span>
            <h2 className="text-base font-semibold">Select Panel Layout &amp; Size</h2>
          </div>

          {/* Panel Selector (1, 3, 5 Panels) */}
          <div>
            <label className="text-xs font-semibold text-muted mb-2 block uppercase tracking-wider">
              Canvas Panel Split Layout
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(panelTypes.length > 0
                ? panelTypes
                : [
                    { id: 'p1', name: '1 Panel (Single)', panel_count: 1 },
                    { id: 'p3', name: '3 Panels (Triptych)', panel_count: 3 },
                    { id: 'p5', name: '5 Panels (Polyptych)', panel_count: 5 },
                  ]
              ).map((p) => {
                const isSelected = selectedPanelType?.id === p.id || selectedPanelType?.panel_count === p.panel_count;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPanelTypeId(p.id);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'border-amber-600 bg-amber-500/10 text-amber-600 font-bold shadow-sm'
                        : 'border-border bg-surface hover:border-text/30 hover:-translate-y-0.5'
                    }`}
                  >
                    <span className="text-xs font-semibold">{p.name}</span>
                    <span className="text-[10px] text-muted mt-0.5">
                      {p.panel_count === 1 ? '1 Solid Canvas' : `${p.panel_count} Split Panels`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selector */}
          <OptionSelector
            label="Canvas Size (Inches)"
            options={sizesForPanelType.map((s) => ({
              id: s.id,
              label: `${s.name} ${s.is_recommended ? '⭐ Recommended' : ''}`,
            }))}
            selectedId={selectedSize?.id ?? null}
            onSelect={setSizeId}
            emptyMessage="Choose a size for your canvas."
          />
        </div>

        {/* Step 4: Frame & Finish Selection */}
        <div className="rounded-xl border border-border p-5 bg-surface/50 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">4</span>
            <h2 className="text-base font-semibold">Frame &amp; Canvas Finish</h2>
          </div>

          <OptionSelector
            label="Frame Option (Visual Border)"
            options={
              frames.length > 0
                ? frames.map((f) => ({
                    id: f.id,
                    label: `${f.name} ${f.price_paisa > 0 ? `(+Rs. ${f.price_paisa / 100})` : ''}`,
                  }))
                : [
                    { id: 'f0', label: 'Unframed (Wrapped Edge Canvas)' },
                    { id: 'f1', label: 'Black Floating Frame (+Rs. 500)' },
                    { id: 'f2', label: 'White Floating Frame (+Rs. 500)' },
                    { id: 'f3', label: 'Natural Wood Frame (+Rs. 700)' },
                    { id: 'f4', label: 'Luxury Gold Frame (+Rs. 900)' },
                  ]
            }
            selectedId={frameId}
            onSelect={(id) => setFrameId(id === frameId ? null : id)}
          />

          <OptionSelector
            label="Finish Style"
            options={
              finishes.length > 0
                ? finishes.map((fn) => ({ id: fn.id, label: fn.name }))
                : [
                    { id: 'fn1', label: 'Matte Finish (Non-reflective)' },
                    { id: 'fn2', label: 'Satin Gloss Finish (Vibrant)' },
                  ]
            }
            selectedId={finishId}
            onSelect={(id) => setFinishId(id === finishId ? null : id)}
          />
        </div>

        {/* Step 5: Custom Text Overlay */}
        <div className="rounded-xl border border-border p-5 bg-surface/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">5</span>
            <h2 className="text-base font-semibold">Custom Text Overlay (Optional)</h2>
          </div>
          <p className="text-xs text-muted mb-3">
            Add a personal title, date, or message to print on your canvas.
          </p>
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="e.g., 'The Shrestha Family - 2026' or 'Happy Anniversary My Love'"
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
      </div>

      {/* Right Column: Live Interactive Konva Preview & Room Mockup */}
      <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-border p-5 bg-surface shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">6</span>
              <h2 className="text-base font-semibold">Live Real-Time Preview</h2>
            </div>
            {selectedSize && (
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                {selectedSize.name}
              </span>
            )}
          </div>

          {/* Room Mockup Selector Bar */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 text-xs">
            <span className="text-muted font-semibold shrink-0">View:</span>
            {ROOM_MOCKUPS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMockupId(m.id)}
                className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors shrink-0 ${
                  selectedMockupId === m.id
                    ? 'border-amber-600 bg-amber-500/10 text-amber-600 font-semibold'
                    : 'border-border bg-bg hover:border-text/30'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>

          {/* Konva Stage Editor Component */}
          {currentPhotoUrl ? (
            <CanvasEditor
              imageUrl={currentPhotoUrl}
              panelCount={selectedPanelType?.panel_count ?? 1}
              aspectRatio={aspectRatio}
              panelGapMm={settings.default_panel_gap_mm}
              frameName={selectedFrame?.name}
              mockupUrl={selectedMockup}
              onChange={setCropData}
            />
          ) : (
            <PreviewPlaceholder />
          )}

          {customText && (
            <div className="mt-3 p-2.5 rounded border border-border bg-surface-hover text-center">
              <p className="text-[11px] text-muted uppercase tracking-wider font-semibold">Text Overlay Preview</p>
              <p className="text-sm font-display italic text-amber-600 mt-0.5">"{customText}"</p>
            </div>
          )}
        </div>

        {/* Step 7: Order Summary & Actions */}
        <div className="rounded-xl border border-border p-5 bg-surface shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">7</span>
              <h2 className="text-base font-semibold">Configuration Summary</h2>
            </div>
            <span className="text-lg font-bold text-amber-600">{formattedPriceRs}</span>
          </div>

          <div className="space-y-2 text-xs text-muted">
            <div className="flex justify-between">
              <span>Layout:</span>
              <span className="font-semibold text-text">{selectedPanelType?.name || '1 Panel'}</span>
            </div>
            <div className="flex justify-between">
              <span>Canvas Size:</span>
              <span className="font-semibold text-text">{selectedSize?.name || '16 × 24'}</span>
            </div>
            <div className="flex justify-between">
              <span>Frame:</span>
              <span className="font-semibold text-text">{selectedFrame?.name || 'Unframed'}</span>
            </div>
            <div className="flex justify-between">
              <span>Finish:</span>
              <span className="font-semibold text-text">{selectedFinish?.name || 'Matte'}</span>
            </div>
          </div>

          <PriceSummary
            pricePaisa={price}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAddToCart={handleAddToCart}
            onSendInquiry={() => setShowInquiryForm(true)}
            whatsappHref={customWhatsappQuery}
            disabledReason={disabledReason}
            submitting={submitting}
          />

          {feedback && (
            <div
              role="status"
              className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-medium"
            >
              {feedback}
            </div>
          )}

          {showInquiryForm && (
            <InquiryForm
              onSubmit={handleInquirySubmit}
              onCancel={() => setShowInquiryForm(false)}
              submitting={submitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewPlaceholder() {
  return (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-hover p-6 text-center text-muted">
      <span className="text-3xl mb-2">🖼️</span>
      <p className="text-sm font-medium text-text">Live Canvas Preview</p>
      <p className="text-xs text-muted mt-1">
        Select your photo or use our demo sample to preview panel splits.
      </p>
    </div>
  );
}
