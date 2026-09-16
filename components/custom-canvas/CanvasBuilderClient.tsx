'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { PhotoUpload, type UploadedPhoto } from './PhotoUpload';
import { OptionSelector } from './OptionSelector';
import { PriceSummary } from './PriceSummary';
import { InquiryForm, type InquiryFormValues } from './InquiryForm';
import { SizeChartModal } from './SizeChartModal';
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
  SizeChartItem,
} from '@/lib/types';

const CanvasEditor = dynamic(
  () => import('./CanvasEditor').then((m) => m.CanvasEditor),
  { ssr: false, loading: () => <PreviewPlaceholder /> }
);

export interface CanvasCategoryProp {
  id: string;
  name: string;
  icon?: string;
}

interface CanvasBuilderClientProps {
  panelTypes: PanelType[];
  sizes: CanvasSize[];
  frames: Frame[];
  finishes: Finish[];
  settings: Settings;
  sizeChartItems?: SizeChartItem[];
  categories?: CanvasCategoryProp[];
}

const DEFAULT_CANVAS_TYPES = [
  { id: 'vastu_horses', name: '7 Running Horses (Vastu)', icon: '🐎' },
  { id: 'buddha', name: 'Buddha & Spiritual', icon: '🪷' },
  { id: 'portrait', name: 'Personal Portrait', icon: '🖼️' },
  { id: 'family', name: 'Family & Memories', icon: '👨‍👩‍👧‍👦' },
  { id: 'couple', name: 'Couple & Romance', icon: '❤️' },
  { id: 'landscape', name: 'Landscape & Nature', icon: '🏞️' },
  { id: 'abstract', name: 'Modern Abstract', icon: '🎨' },
  { id: 'other', name: 'Custom Design', icon: '✨' },
];

function getIconForCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('horse') || lower.includes('vastu')) return '🐎';
  if (lower.includes('buddha') || lower.includes('spiritual')) return '🪷';
  if (lower.includes('portrait') || lower.includes('personal')) return '🖼️';
  if (lower.includes('family') || lower.includes('memory')) return '👨‍👩‍👧‍👦';
  if (lower.includes('couple') || lower.includes('romance') || lower.includes('love')) return '❤️';
  if (lower.includes('landscape') || lower.includes('nature') || lower.includes('mountain')) return '🏞️';
  if (lower.includes('abstract') || lower.includes('art')) return '🎨';
  return '✨';
}

const DEMO_ARTWORKS = [
  {
    id: 'horses-7',
    name: '7 Running Horses (Vastu / Feng Shui)',
    url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80',
    badge: '🔥 7 Horses Demo',
  },
  {
    id: 'abstract-gold',
    name: 'Golden Fluid Abstract',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    badge: 'Popular',
  },
  {
    id: 'buddha-lotus',
    name: 'Serene Temple Lotus',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    badge: 'Spiritual',
  },
  {
    id: 'himalayan-nature',
    name: 'Mountain Sunrise Panorama',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    badge: 'Nature',
  },
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
    name: 'Modern Executive Office',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  },
];

const GAP_OPTIONS = [
  { mm: 10, label: '1 cm (10 mm)', desc: 'Tight Gap' },
  { mm: 20, label: '2 cm (20 mm)', desc: 'Standard (Recommended)' },
  { mm: 30, label: '3 cm (30 mm)', desc: 'Medium Gap' },
  { mm: 40, label: '4 cm (40 mm)', desc: 'Large Gap' },
  { mm: 50, label: '5 cm (50 mm)', desc: 'Wide Gap' },
];

const FALLBACK_PANELS: PanelType[] = [
  { id: 'panel-1', name: '1 Piece (Single)', panel_count: 1, description: null, status: 'published', sort_order: 1, is_active: true },
  { id: 'panel-2', name: '2 Piece (Diptych)', panel_count: 2, description: null, status: 'published', sort_order: 2, is_active: true },
  { id: 'panel-3', name: '3 Piece (Triptych)', panel_count: 3, description: null, status: 'published', sort_order: 3, is_active: true },
  { id: 'panel-4', name: '4 Piece (Quad)', panel_count: 4, description: null, status: 'published', sort_order: 4, is_active: true },
  { id: 'panel-5', name: '5 Piece (Pentaptych)', panel_count: 5, description: null, status: 'published', sort_order: 5, is_active: true },
  { id: 'panel-6', name: '6 Piece (Hexaptych)', panel_count: 6, description: null, status: 'published', sort_order: 6, is_active: true },
  { id: 'panel-7', name: '7 Piece (Panoramic)', panel_count: 7, description: null, status: 'published', sort_order: 7, is_active: true },
];

export function CanvasBuilderClient({
  panelTypes,
  sizes,
  frames,
  finishes,
  settings,
  sizeChartItems,
  categories,
}: CanvasBuilderClientProps) {
  const activePanels = panelTypes.length > 0 ? panelTypes : FALLBACK_PANELS;

  const categoriesList = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon || getIconForCategory(c.name),
      }));
    }
    return DEFAULT_CANVAS_TYPES;
  }, [categories]);

  const defaultDemoUrl =
    settings.demo_photo_url || DEMO_ARTWORKS[0].url;

  const [selectedCanvasType, setSelectedCanvasType] = useState('vastu_horses');
  const [selectedDemoId, setSelectedDemoId] = useState('horses-7');
  const [uploadedPhoto, setUploadedPhoto] = useState<UploadedPhoto | null>(null);
  const [isUsingDemo, setIsUsingDemo] = useState(true);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');

  const [panelTypeId, setPanelTypeId] = useState<string | null>(activePanels[0]?.id ?? null);
  const [panelGapMm, setPanelGapMm] = useState<number>(settings.default_panel_gap_mm || 20);
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [frameId, setFrameId] = useState<string | null>(null);
  const [finishId, setFinishId] = useState<string | null>(null);
  const [selectedMockupId, setSelectedMockupId] = useState('none');

  const [customText, setCustomText] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cropData, setCropData] = useState<PanelCropData[]>([]);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Active Photo URL logic
  const currentDemoObj = DEMO_ARTWORKS.find((d) => d.id === selectedDemoId) || DEMO_ARTWORKS[0];
  const currentPhotoUrl = uploadedPhoto?.url || (isUsingDemo ? currentDemoObj.url : defaultDemoUrl);

  const selectedPanelType = activePanels.find((p) => p.id === panelTypeId) ?? activePanels[0] ?? null;

  // Filter sizes strictly by the selected panel type
  const sizesForPanelType = useMemo(
    () => (selectedPanelType ? sizes.filter((s) => s.panel_type_id === selectedPanelType.id) : sizes),
    [sizes, selectedPanelType]
  );

  const selectedSize = sizesForPanelType.find((s) => s.id === sizeId) ?? sizesForPanelType[0] ?? sizes[0] ?? null;
  const selectedFrame = frames.find((f) => f.id === frameId) ?? null;
  const selectedFinish = finishes.find((f) => f.id === finishId) ?? null;
  const selectedMockup = ROOM_MOCKUPS.find((m) => m.id === selectedMockupId)?.url || null;

  const effectiveWidth = selectedSize
    ? orientation === 'portrait'
      ? Math.min(selectedSize.width, selectedSize.height)
      : Math.max(selectedSize.width, selectedSize.height)
    : 24;
  const effectiveHeight = selectedSize
    ? orientation === 'portrait'
      ? Math.max(selectedSize.width, selectedSize.height)
      : Math.min(selectedSize.width, selectedSize.height)
    : 36;

  const aspectRatio = effectiveWidth / effectiveHeight;

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
    ? 'Upload a photo or choose sample artwork to preview.'
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

  useEffect(() => {
    if (currentPhotoUrl) {
      const img = new window.Image();
      img.onload = () => {
        if (img.naturalHeight > img.naturalWidth) {
          setOrientation('portrait');
        } else {
          setOrientation('landscape');
        }
      };
      img.src = currentPhotoUrl;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePhotoUpload(photo: UploadedPhoto | null) {
    if (photo) {
      setUploadedPhoto(photo);
      setIsUsingDemo(false);
      if (photo.height > photo.width) {
        setOrientation('portrait');
      } else {
        setOrientation('landscape');
      }
    }
  }

  function handleSelectDemoArtwork(demoId: string) {
    setSelectedDemoId(demoId);
    setUploadedPhoto(null);
    setIsUsingDemo(true);
    const demoObj = DEMO_ARTWORKS.find((d) => d.id === demoId);
    if (demoObj?.url) {
      const img = new window.Image();
      img.onload = () => {
        if (img.naturalHeight > img.naturalWidth) {
          setOrientation('portrait');
        } else {
          setOrientation('landscape');
        }
      };
      img.src = demoObj.url;
    }
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
        panelGapMm,
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
      const configurationId = (await saveConfiguration()) || `cfg_local_${Date.now()}`;
      if (!selectedSize || price == null) {
        setFeedback('Select a canvas size to continue.');
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
    <>
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        sizeChartItems={sizeChartItems}
      />

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Guided Builder Controls */}
        <div className="space-y-8">
          {/* Demo Art Photo Switcher Bar */}
          <div className="rounded-xl border border-pink-500/30 bg-surface/80 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐎</span>
                <div>
                  <h3 className="font-bold text-sm text-text">
                    Default 7 Running Horses Demo Art
                  </h3>
                  <p className="text-xs text-muted">
                    Test live panel splitting across 1 to 7 pieces, or upload your photo.
                  </p>
                </div>
              </div>
              {!isUsingDemo && (
                <button
                  type="button"
                  onClick={() => setIsUsingDemo(true)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-pink-500/10 text-pink-600 border border-pink-500/20 hover:bg-pink-500/20 transition-all"
                >
                  ↺ Try Demo Photo
                </button>
              )}
            </div>

            {isUsingDemo && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DEMO_ARTWORKS.map((art) => (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => handleSelectDemoArtwork(art.id)}
                    className={`relative flex flex-col items-center p-2 rounded-lg border text-left transition-all overflow-hidden ${
                      selectedDemoId === art.id && isUsingDemo
                        ? 'border-pink-500 ring-2 ring-pink-500/30 bg-pink-500/5 font-semibold'
                        : 'border-border bg-bg hover:border-text/30'
                    }`}
                  >
                    <img
                      src={art.url}
                      alt={art.name}
                      className="w-full h-16 object-cover rounded-md mb-1.5"
                    />
                    <span className="text-[11px] font-medium text-text line-clamp-1 w-full text-center">
                      {art.name}
                    </span>
                    {art.badge && (
                      <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500 text-white shadow-sm">
                        {art.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 1: Canvas Category */}
          <div className="rounded-xl border border-border p-5 bg-surface/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">1</span>
              <h2 className="text-base font-semibold">Choose Canvas Category</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {categoriesList.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedCanvasType(type.id)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all ${
                    selectedCanvasType === type.id
                      ? 'border-pink-500 bg-pink-500/10 text-pink-600 font-semibold shadow-sm'
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
          <div className="rounded-xl border border-border p-5 bg-surface/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">2</span>
                <h2 className="text-base font-semibold">Upload Your Photo</h2>
              </div>
              {uploadedPhoto && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  ✓ Custom Image Uploaded
                </span>
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

          {/* Step 3: Panel Type Cards (1, 2, 3, 4, 5, 6, 7) */}
          <div className="rounded-xl border border-border p-5 bg-surface/50 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">3</span>
                <h2 className="text-base font-semibold">Select Panel Layout (1 to 7 Pieces)</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSizeChartOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-bold text-xs shadow hover:bg-amber-600 transition-all flex items-center gap-1.5"
              >
                <span>📏</span> View Size Chart
              </button>
            </div>

            {/* Visual Panel Card Grid */}
            <div>
              <label className="text-xs font-semibold text-muted mb-2.5 block uppercase tracking-wider">
                Panel Composition Slices
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activePanels.map((p) => {
                  const isSelected =
                    selectedPanelType?.id === p.id || selectedPanelType?.panel_count === p.panel_count;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPanelTypeId(p.id)}
                      className={`relative flex flex-col items-center p-3.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-pink-500 ring-2 ring-pink-500/30 bg-pink-500/10 text-pink-600 font-bold shadow-md'
                          : 'border-border bg-surface hover:border-pink-500/50 hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Visual Panel Icon Diagram */}
                      <RenderPanelDiagram count={p.panel_count} isSelected={isSelected} />

                      <span className="text-xs font-bold text-text mt-2">{p.name}</span>
                      <span className="text-[10px] text-muted font-medium mt-0.5">
                        {p.panel_count === 1 ? '1 Solid Canvas' : `${p.panel_count} Split Panels`}
                      </span>

                      {/* Warm Yellow Badges */}
                      {p.panel_count === 3 && (
                        <span className="absolute -top-2 right-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-500 text-white shadow">
                          Popular
                        </span>
                      )}
                      {p.panel_count === 5 && (
                        <span className="absolute -top-2 right-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-500 text-white shadow">
                          Grand View
                        </span>
                      )}
                      {p.panel_count === 7 && (
                        <span className="absolute -top-2 right-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-pink-600 text-white shadow">
                          Panoramic
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Panel Gap Spacing Selector */}
            {selectedPanelType && selectedPanelType.panel_count > 1 && (
              <div className="p-4 rounded-xl border border-border bg-surface/80 space-y-2">
                <label className="text-xs font-bold text-text flex items-center justify-between">
                  <span>↔️ Panel Gap Spacing</span>
                  <span className="text-amber-600 font-mono text-xs">{panelGapMm / 10} cm ({panelGapMm} mm)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {GAP_OPTIONS.map((g) => (
                    <button
                      key={g.mm}
                      type="button"
                      onClick={() => setPanelGapMm(g.mm)}
                      className={`p-2 rounded-lg border text-center transition-all text-xs ${
                        panelGapMm === g.mm
                          ? 'border-amber-500 bg-amber-500/10 text-amber-700 font-bold'
                          : 'border-border bg-bg text-muted hover:text-text'
                      }`}
                    >
                      <div className="font-semibold">{g.label}</div>
                      <div className="text-[10px] text-muted">{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Orientation Mode Selector (Landscape vs Portrait) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-text flex items-center gap-1.5">
                  <span>🔄</span> Canvas Orientation Mode (Auto-Detected)
                </span>
                <p className="text-[11px] text-muted">Auto-fitted to photo aspect ratio. Switch to Landscape (↔️) or Portrait (↕️) or rotate anytime.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-xl bg-surface p-1 border border-border text-xs font-semibold shrink-0">
                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      orientation === 'landscape'
                        ? 'bg-amber-600 text-white font-bold shadow-sm'
                        : 'text-text hover:bg-surface-hover'
                    }`}
                  >
                    <span>↔️</span> Landscape
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      orientation === 'portrait'
                        ? 'bg-amber-600 text-white font-bold shadow-sm'
                        : 'text-text hover:bg-surface-hover'
                    }`}
                  >
                    <span>↕️</span> Portrait
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setOrientation((prev) => (prev === 'landscape' ? 'portrait' : 'landscape'))}
                  className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-xs font-bold text-text flex items-center gap-1 transition-all active:scale-95 shadow-sm shrink-0"
                  title="Rotate / Switch Orientation"
                >
                  <span>↻</span> Rotate
                </button>
              </div>
            </div>

            {/* Size Options & Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Available Sizes for {selectedPanelType?.name || 'Selected Layout'}
                </label>
                {selectedSize?.sizing_mode && (
                  <span className="text-[11px] font-semibold text-pink-600 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                    Mode: {selectedSize.sizing_mode.replace('_', ' ').toUpperCase()}
                  </span>
                )}
              </div>

              <OptionSelector
                label=""
                options={sizesForPanelType.map((s) => ({
                  id: s.id,
                  label: `${s.name} ${s.is_recommended ? '⭐ Recommended' : ''}`,
                }))}
                selectedId={selectedSize?.id ?? null}
                onSelect={setSizeId}
                emptyMessage="Choose a size for your canvas."
              />

              {/* Dynamic Size Breakdown Banner */}
              {selectedSize && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 font-bold text-amber-700 dark:text-amber-300">
                    <span>📏 TOTAL ARTWORK SIZE: {effectiveWidth}" × {effectiveHeight}" ({Math.round(effectiveWidth * 2.54)}cm × {Math.round(effectiveHeight * 2.54)}cm) — {orientation === 'portrait' ? '↕️ Portrait Mode' : '↔️ Landscape Mode'}</span>
                  </div>
                  {selectedSize.each_panel_size && (
                    <div className="text-muted font-medium flex items-center gap-1">
                      <span>🖼️ Individual Panel Size:</span>
                      <span className="font-mono text-text font-semibold">{selectedSize.each_panel_size}</span>
                    </div>
                  )}
                  {selectedSize.recommended_room && (
                    <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                      ✨ Recommended For: {selectedSize.recommended_room}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Frame & Finish Selection */}
          <div className="rounded-xl border border-border p-5 bg-surface/50 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">4</span>
              <h2 className="text-base font-semibold">Frame &amp; Canvas Finish</h2>
            </div>

            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Item Price Range: Rs. 700 – Rs. 3,500</span>
            </div>

            <OptionSelector
              label="Outer Frame Accent"
              options={
                frames.length > 0
                  ? frames.map((f) => ({
                      id: f.id,
                      label: f.name,
                    }))
                  : [
                      { id: 'f0', label: 'Unframed (Wrapped Edge Canvas)' },
                      { id: 'f1', label: 'Black Floating Frame' },
                      { id: 'f2', label: 'White Floating Frame' },
                      { id: 'f3', label: 'Natural Wood Frame' },
                      { id: 'f4', label: 'Luxury Gold Frame' },
                    ]
              }
              selectedId={frameId}
              onSelect={(id) => setFrameId(id === frameId ? null : id)}
            />

            <OptionSelector
              label="Canvas Finish"
              options={
                finishes.length > 0
                  ? finishes.map((fn) => ({ id: fn.id, label: fn.name }))
                  : [
                      { id: 'fn1', label: 'Matte Finish (Non-reflective Premium)' },
                      { id: 'fn2', label: 'Satin Gloss Finish (Vibrant Color Pop)' },
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
              Add a personal family name, date, or Vastu quote to print on your canvas.
            </p>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g., 'Shrestha Family Heritage' or 'Om Namah Shivaya'"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
        </div>

        {/* Right Column: Live Interactive Konva Preview & Order Action */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border p-5 bg-surface shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">6</span>
                <h2 className="text-base font-semibold">Live Stage &amp; Split Preview</h2>
              </div>
              {selectedSize && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {selectedSize.name}
                </span>
              )}
            </div>

            {/* Room Mockup Selector Bar */}
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 text-xs">
              <span className="text-muted font-semibold shrink-0">Room Context:</span>
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
                panelGapMm={panelGapMm}
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

          {/* Direct Order Actions (Technical Configuration Summary hidden per customer request) */}
          <div className="rounded-xl border border-border p-5 bg-surface shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-xs text-muted uppercase tracking-wider font-semibold">Total Investment</span>
                <p className="text-2xl font-extrabold text-amber-600">{formattedPriceRs}</p>
              </div>
              <div className="text-right text-xs text-muted">
                <span className="font-semibold text-text">{selectedPanelType?.name || '1 Panel'}</span>
                <p>{selectedSize?.name || 'Standard'}</p>
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
    </>
  );
}

function RenderPanelDiagram({ count, isSelected }: { count: number; isSelected: boolean }) {
  const barColor = isSelected ? 'bg-pink-500' : 'bg-muted/40';

  if (count === 5) {
    // Chevron height pattern (75%, 87.5%, 100%, 87.5%, 75%)
    const heights = ['h-6', 'h-8', 'h-10', 'h-8', 'h-6'];
    return (
      <div className="flex items-end justify-center gap-1 h-10 w-full px-2">
        {heights.map((h, i) => (
          <div key={i} className={`flex-1 ${h} ${barColor} rounded-sm transition-all`} />
        ))}
      </div>
    );
  }

  if (count === 7) {
    // Stepped panoramic pattern (70%, 82%, 92%, 100%, 92%, 82%, 70%)
    const heights = ['h-5', 'h-7', 'h-9', 'h-10', 'h-9', 'h-7', 'h-5'];
    return (
      <div className="flex items-end justify-center gap-0.5 h-10 w-full px-1">
        {heights.map((h, i) => (
          <div key={i} className={`flex-1 ${h} ${barColor} rounded-sm transition-all`} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1 h-10 w-full px-2">
      {Array.from({ length: Math.min(count, 7) }).map((_, i) => (
        <div key={i} className={`flex-1 h-8 ${barColor} rounded-sm transition-all`} />
      ))}
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
