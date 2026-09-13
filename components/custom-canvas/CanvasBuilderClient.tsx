'use client';

import { useMemo, useState } from 'react';
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

export function CanvasBuilderClient({
  panelTypes,
  sizes,
  frames,
  finishes,
  settings,
}: CanvasBuilderClientProps) {
  const [selectedCanvasType, setSelectedCanvasType] = useState('portrait');
  const [uploadedPhoto, setUploadedPhoto] = useState<UploadedPhoto | null>(null);
  const [panelTypeId, setPanelTypeId] = useState<string | null>(
    panelTypes[0]?.id ?? null
  );
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [frameId, setFrameId] = useState<string | null>(null);
  const [finishId, setFinishId] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cropData, setCropData] = useState<PanelCropData[]>([]);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const sizesForPanelType = useMemo(
    () => (panelTypeId ? sizes.filter((s) => s.panel_type_id === panelTypeId) : sizes),
    [sizes, panelTypeId]
  );

  const selectedPanelType = panelTypes.find((p) => p.id === panelTypeId) ?? null;
  const selectedSize = sizesForPanelType.find((s) => s.id === sizeId) ?? sizes[0] ?? null;
  const selectedFrame = frames.find((f) => f.id === frameId) ?? null;
  const selectedFinish = finishes.find((f) => f.id === finishId) ?? null;

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

  const disabledReason = !uploadedPhoto
    ? 'Upload a photo to preview & order your canvas.'
    : !selectedSize
    ? 'Select a canvas size to continue.'
    : null;

  const whatsappHref =
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

  async function saveConfiguration(): Promise<string | null> {
    if (!uploadedPhoto || !selectedSize) return null;

    const res = await fetch('/api/canvas/configure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uploadedImageUrl: uploadedPhoto.url,
        uploadedImageMeta: {
          width: uploadedPhoto.width,
          height: uploadedPhoto.height,
          size_bytes: uploadedPhoto.sizeBytes,
          quality_rating: qualityRating,
          canvas_type: selectedCanvasType,
          custom_text: customText,
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
        imageUrl: uploadedPhoto?.url,
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
      {/* Left Column: 7-Step Controls */}
      <div className="space-y-8">
        {/* Step 1: Canvas Type */}
        <div className="rounded-xl border border-border p-5 bg-surface/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">1</span>
            <h2 className="text-base font-semibold">Choose Canvas Type</h2>
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

        {/* Step 2: Upload Photo */}
        <div className="rounded-xl border border-border p-5 bg-surface/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">2</span>
            <h2 className="text-base font-semibold">Upload Your Photo</h2>
          </div>
          <PhotoUpload
            onUploaded={setUploadedPhoto}
            maxUploadSizeMb={settings.max_upload_size_mb}
          />

          {qualityRating && (
            <div
              className={`mt-3 p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
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

        {/* Step 3: Panel & Canvas Size */}
        <div className="rounded-xl border border-border p-5 bg-surface/50 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">3</span>
            <h2 className="text-base font-semibold">Select Panel Layout &amp; Size</h2>
          </div>

          {panelTypes.length > 0 && (
            <OptionSelector
              label="Layout Style"
              options={panelTypes.map((p) => ({ id: p.id, label: p.name }))}
              selectedId={panelTypeId}
              onSelect={(id) => {
                setPanelTypeId(id);
              }}
            />
          )}

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

        {/* Step 4: Frame & Finish Options */}
        <div className="rounded-xl border border-border p-5 bg-surface/50 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">4</span>
            <h2 className="text-base font-semibold">Frame &amp; Canvas Finish</h2>
          </div>

          <OptionSelector
            label="Frame Option"
            options={
              frames.length > 0
                ? frames.map((f) => ({
                    id: f.id,
                    label: `${f.name} ${f.price_paisa > 0 ? `(+Rs. ${f.price_paisa / 100})` : ''}`,
                  }))
                : [
                    { id: 'f0', label: 'Unframed (Wrapped Canvas)' },
                    { id: 'f1', label: 'Black Floating Frame (+Rs. 500)' },
                    { id: 'f2', label: 'White Floating Frame (+Rs. 500)' },
                    { id: 'f3', label: 'Natural Wood Frame (+Rs. 700)' },
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

        {/* Step 5: Custom Text Overlay (Optional) */}
        <div className="rounded-xl border border-border p-5 bg-surface/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">5</span>
            <h2 className="text-base font-semibold">Custom Text Overlay (Optional)</h2>
          </div>
          <p className="text-xs text-muted mb-3">
            Add a personal title, date, or heartfelt message to print on your canvas margin or front.
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

      {/* Right Column: Live Interactive Konva Preview & Step 6-7 Summary */}
      <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-border p-5 bg-surface shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">6</span>
              <h2 className="text-base font-semibold">Interactive Live Preview</h2>
            </div>
            {selectedSize && (
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                {selectedSize.name}
              </span>
            )}
          </div>

          {uploadedPhoto ? (
            <CanvasEditor
              imageUrl={uploadedPhoto.url}
              panelCount={selectedPanelType?.panel_count ?? 1}
              aspectRatio={aspectRatio}
              panelGapMm={settings.default_panel_gap_mm}
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

        {/* Step 7: Summary & Actions */}
        <div className="rounded-xl border border-border p-5 bg-surface shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">7</span>
            <h2 className="text-base font-semibold">Order Summary &amp; Instant Action</h2>
          </div>

          <PriceSummary
            pricePaisa={price}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAddToCart={handleAddToCart}
            onSendInquiry={() => setShowInquiryForm(true)}
            whatsappHref={whatsappHref}
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
        Upload your photo in Step 2 to see instant live preview &amp; split panel alignment.
      </p>
    </div>
  );
}
