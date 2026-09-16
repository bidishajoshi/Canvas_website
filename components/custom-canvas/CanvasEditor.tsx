'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Group } from 'react-konva';
import useImage from 'use-image';
import type Konva from 'konva';
import type { PanelCropData } from '@/lib/types';

interface CanvasEditorProps {
  imageUrl: string;
  panelCount: number;
  /** width / height of the full assembled canvas */
  aspectRatio: number;
  panelGapMm: number;
  frameName?: string | null;
  mockupUrl?: string | null;
  onChange: (cropData: PanelCropData[]) => void;
}

const PREVIEW_WIDTH = 600;

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function CanvasEditor({
  imageUrl,
  panelCount,
  aspectRatio,
  panelGapMm,
  frameName,
  mockupUrl,
  onChange,
}: CanvasEditorProps) {
  const [image] = useImage(imageUrl, 'anonymous');
  const [mockupImage] = useImage(mockupUrl || '', 'anonymous');

  const containerRef = useRef<HTMLDivElement>(null);
  const [stageScale, setStageScale] = useState(1);

  // Zoom & Transform states (Zoom allowed down to 0.1 = 10% zoom out up to 3.0 = 300% zoom in)
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // Gallery Photo Editor states (Brightness, Contrast, Saturation, Warmth, Filter, Rotation, Flips)
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [warmth, setWarmth] = useState(0);
  const [filterPreset, setFilterPreset] = useState<string>('original');
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  const [activeTab, setActiveTab] = useState<'adjust' | 'filters' | 'rotate'>('adjust');

  const stageWidth = PREVIEW_WIDTH;
  const stageHeight = Math.round(PREVIEW_WIDTH / Math.max(aspectRatio, 0.01));
  const gapPx = panelCount > 1 ? Math.min(24, Math.max(6, Math.round((panelGapMm / 10) * 4))) : 0;
  const panelWidth = (stageWidth - gapPx * (panelCount - 1)) / panelCount;

  // Responsive stage scaling on mobile screen widths
  useEffect(() => {
    function updateScale() {
      if (containerRef.current) {
        const availableWidth = containerRef.current.clientWidth - 16;
        if (availableWidth < stageWidth) {
          setStageScale(Math.max(0.4, availableWidth / stageWidth));
        } else {
          setStageScale(1);
        }
      }
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [stageWidth]);

  // Staggered height ratios per panel count for realistic multi-piece composition
  const heightRatios = useMemo(() => {
    switch (panelCount) {
      case 3:
        return [0.85, 1.0, 0.85];
      case 5:
        return [0.75, 0.875, 1.0, 0.875, 0.75];
      case 6:
        return [0.8, 0.92, 1.0, 1.0, 0.92, 0.8];
      case 7:
        return [0.7, 0.82, 0.92, 1.0, 0.92, 0.82, 0.7];
      default:
        return Array(panelCount).fill(1.0);
    }
  }, [panelCount]);

  // Frame styling properties based on selected frame name
  const frameStyle = useMemo(() => {
    if (!frameName) return null;
    const lower = frameName.toLowerCase();

    if (lower.includes('black')) return { stroke: '#18181b', strokeWidth: 4 };
    if (lower.includes('white')) return { stroke: '#e2e8f0', strokeWidth: 4 };
    if (lower.includes('wood') || lower.includes('natural')) return { stroke: '#78350f', strokeWidth: 5 };
    if (lower.includes('gold') || lower.includes('golden')) return { stroke: '#d97706', strokeWidth: 5 };
    return null;
  }, [frameName]);

  const baseScale = useMemo(() => {
    if (!image) return 1;
    return Math.max(stageWidth / image.width, stageHeight / image.height);
  }, [image, stageWidth, stageHeight]);

  const scale = baseScale * zoom;
  const imageWidth = image ? image.width * scale : 0;
  const imageHeight = image ? image.height * scale : 0;

  // Build live CSS filter string
  const cssFilter = useMemo(() => {
    const parts: string[] = [];
    if (brightness !== 0) parts.push(`brightness(${100 + brightness}%)`);
    if (contrast !== 0) parts.push(`contrast(${100 + contrast}%)`);
    if (saturation !== 0) parts.push(`saturate(${100 + saturation}%)`);
    if (warmth !== 0) parts.push(`sepia(${Math.abs(warmth) * 0.8}%) ${warmth < 0 ? 'hue-rotate(180deg)' : ''}`);

    if (filterPreset === 'grayscale') parts.push('grayscale(100%)');
    if (filterPreset === 'sepia') parts.push('sepia(80%)');
    if (filterPreset === 'vivid') parts.push('saturate(180%) contrast(110%)');
    if (filterPreset === 'warm') parts.push('sepia(30%) saturate(120%)');
    if (filterPreset === 'cool') parts.push('hue-rotate(180deg) saturate(110%)');
    if (filterPreset === 'vintage') parts.push('sepia(45%) contrast(110%) brightness(95%)');
    if (filterPreset === 'high_contrast') parts.push('contrast(160%) brightness(105%)');

    return parts.join(' ');
  }, [brightness, contrast, saturation, warmth, filterPreset]);

  // Re-center whenever image or layout changes
  useEffect(() => {
    setPos({
      x: Math.round((stageWidth - imageWidth) / 2),
      y: Math.round((stageHeight - imageHeight) / 2),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, panelCount, aspectRatio, baseScale]);

  // Report crop and photo adjustment data
  useEffect(() => {
    if (!image || imageWidth === 0 || imageHeight === 0) return;

    const offsetX = clamp01(-pos.x / imageWidth);
    const offsetY = clamp01(-pos.y / imageHeight);

    const cropData: PanelCropData[] = Array.from({ length: panelCount }, (_, i) => ({
      panelIndex: i,
      offsetX,
      offsetY,
      zoom,
      brightness,
      contrast,
      saturation,
      filterPreset,
      rotation,
    }));
    onChange(cropData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, zoom, panelCount, image, brightness, contrast, saturation, filterPreset, rotation]);

  function handleDragMove(e: Konva.KonvaEventObject<DragEvent>, panelX: number) {
    const node = e.target;
    // Calculate raw position of top-left corner
    const rawX = node.x() - imageWidth / 2 + panelX;
    const rawY = node.y() - imageHeight / 2;
    setPos({ x: rawX, y: rawY });
  }

  function nudge5mm(dx: number, dy: number) {
    setPos((prev) => ({
      x: Math.round(prev.x + dx),
      y: Math.round(prev.y + dy),
    }));
  }

  function handleZoomIn() {
    setZoom((z) => Math.min(3.0, Number((z + 0.1).toFixed(2))));
  }

  function handleZoomOut() {
    setZoom((z) => Math.max(0.1, Number((z - 0.1).toFixed(2))));
  }

  function handleRotate90() {
    setRotation((r) => (r + 90) % 360);
  }

  function handleFitEntirePhoto() {
    if (!image) return;
    const isRotated90 = (rotation % 180) !== 0;
    const imgW = isRotated90 ? image.height : image.width;
    const imgH = isRotated90 ? image.width : image.height;

    const containScale = Math.min(stageWidth / imgW, stageHeight / imgH);
    const fitZoom = Math.max(0.1, Number((containScale / baseScale).toFixed(2)));
    setZoom(fitZoom);

    const fitW = imgW * baseScale * fitZoom;
    const fitH = imgH * baseScale * fitZoom;
    setPos({
      x: Math.round((stageWidth - fitW) / 2),
      y: Math.round((stageHeight - fitH) / 2),
    });
  }

  function handleFillCanvas() {
    setZoom(1);
    setPos({
      x: Math.round((stageWidth - imageWidth) / 2),
      y: Math.round((stageHeight - imageHeight) / 2),
    });
  }

  function handleResetAll() {
    setZoom(1);
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setWarmth(0);
    setFilterPreset('original');
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setPos({
      x: Math.round((stageWidth - imageWidth) / 2),
      y: Math.round((stageHeight - imageHeight) / 2),
    });
  }

  return (
    <div className="space-y-4">
      {/* Sticky Live Clean Canvas Stage Container with Quick-Edit Toolbar */}
      <div className="sticky top-16 sm:top-20 z-30 mx-auto w-full rounded-2xl border border-border bg-bg/95 backdrop-blur-md p-2 sm:p-4 shadow-xl space-y-2 transition-all">
        {/* Live Stage Display */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-xl bg-surface p-2 shadow-inner flex justify-center items-center"
        >
          {mockupUrl && mockupImage ? (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
              <img src={mockupUrl} alt="Room Mockup" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
                <div className="scale-75 sm:scale-90 shadow-2xl transition-transform">
                  <RenderKonvaStage />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center py-1 w-full overflow-hidden">
              <div
                className="origin-center transition-all flex items-center justify-center"
                style={{
                  width: Math.round(stageWidth * stageScale),
                  height: Math.round(stageHeight * stageScale),
                }}
              >
                <div
                  style={{
                    width: stageWidth,
                    height: stageHeight,
                    transform: `scale(${stageScale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <RenderKonvaStage />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Quick Action Toolbar Pinned Directly Under Stage */}
        <div className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-surface border border-border shadow-xs text-xs">
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              type="button"
              onClick={handleRotate90}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center gap-1 shrink-0 active:scale-95 transition-all shadow-sm"
              title="Rotate Photo 90° Clockwise"
            >
              <span>↻</span>
              <span>Rotate 90°</span>
            </button>

            <button
              type="button"
              onClick={handleFitEntirePhoto}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs shrink-0 transition-all border border-amber-500/20"
              title="Fit Full Photo (Zoom Out)"
            >
              📐 Fit Photo
            </button>

            <button
              type="button"
              onClick={handleFillCanvas}
              className="px-2.5 py-1.5 rounded-lg bg-bg hover:bg-surface-hover font-bold text-xs shrink-0 transition-all border border-border"
              title="Fill Canvas"
            >
              🖼️ Fill Canvas
            </button>

            <div className="flex items-center gap-1 border-l border-border pl-1.5">
              <button
                type="button"
                onClick={handleZoomOut}
                className="h-7 w-7 rounded-lg border border-border bg-bg font-bold hover:border-amber-600 active:scale-95 text-xs flex items-center justify-center shrink-0"
                title="Zoom Out"
              >
                −
              </button>
              <span className="font-mono text-[11px] font-bold text-amber-600 px-1 shrink-0">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="h-7 w-7 rounded-lg border border-border bg-bg font-bold hover:border-amber-600 active:scale-95 text-xs flex items-center justify-center shrink-0"
                title="Zoom In"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAll}
            className="px-2 py-1.5 rounded-lg bg-surface-hover border border-border font-bold text-[11px] text-muted hover:text-text shrink-0 active:scale-95"
            title="Reset All Adjustments"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Gallery Photo Editor Panel */}
      <div className="rounded-2xl border border-border bg-surface p-4 space-y-4 text-xs shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🎨</span>
            <span className="font-bold text-text text-sm">Gallery Photo Editor &amp; Adjustments</span>
          </div>
          <button
            type="button"
            onClick={handleResetAll}
            className="px-3 py-1 rounded-lg bg-surface-hover border border-border hover:border-amber-600 font-bold text-xs transition-all active:scale-95 text-muted hover:text-text"
          >
            ↺ Reset All Edits
          </button>
        </div>

        {/* 1. Zoom Scale Slider with Rotate Button Directly Placed Next to It */}
        <div className="p-3.5 rounded-xl border border-border bg-surface/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-text flex items-center gap-1.5">
              <span>🔍</span> Zoom Scale &amp; Rotate Photo
            </span>
            <span className="text-amber-600 font-mono font-extrabold text-xs">
              Zoom: {Math.round(zoom * 100)}% {rotation > 0 ? `• Rotate: ${rotation}°` : ''}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleFitEntirePhoto}
              className="flex-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold text-xs transition-all shadow-xs"
            >
              📐 Fit Entire Photo (Zoom Out)
            </button>
            <button
              type="button"
              onClick={handleFillCanvas}
              className="flex-1 px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-amber-600 text-text font-bold text-xs transition-all shadow-xs"
            >
              🖼️ Fill Canvas (Zoom In)
            </button>
          </div>

          {/* Zoom Slider + Rotate Button directly side-by-side */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleZoomOut}
              className="h-9 w-9 rounded-lg border border-border bg-bg font-bold hover:border-amber-600 active:scale-95 text-sm flex items-center justify-center shrink-0"
              title="Zoom Out"
            >
              −
            </button>
            <input
              type="range"
              min={0.1}
              max={3.0}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-amber-600 h-2 rounded-lg cursor-pointer"
            />
            <button
              type="button"
              onClick={handleZoomIn}
              className="h-9 w-9 rounded-lg border border-border bg-bg font-bold hover:border-amber-600 active:scale-95 text-sm flex items-center justify-center shrink-0"
              title="Zoom In"
            >
              +
            </button>

            {/* ROTATE BUTTON PLACED DIRECTLY NEXT TO ZOOM SCALE SLIDER */}
            <button
              type="button"
              onClick={handleRotate90}
              className="h-9 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center gap-1.5 active:scale-95 shadow-md shrink-0 transition-all"
              title="Rotate Photo 90° Clockwise"
            >
              <span className="text-sm">↻</span>
              <span>Rotate 90°</span>
            </button>
          </div>
        </div>

        {/* Editor Tabs Navigation */}
        <div className="flex border-b border-border text-xs font-bold gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('adjust')}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              activeTab === 'adjust'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            ☀️ Tone &amp; Light Sliders
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('filters')}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              activeTab === 'filters'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            🪄 Gallery Filters
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rotate')}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              activeTab === 'rotate'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            🔄 Rotate &amp; Flip Controls
          </button>
        </div>

        {/* Tab 1: Tone Sliders */}
        {activeTab === 'adjust' && (
          <div className="p-3.5 rounded-xl border border-border bg-surface/60 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <div className="flex justify-between font-semibold text-muted text-[11px] mb-1">
                  <span>Brightness</span>
                  <span className="font-mono text-amber-600">{brightness > 0 ? `+${brightness}` : brightness}</span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full accent-amber-600 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-muted text-[11px] mb-1">
                  <span>Contrast</span>
                  <span className="font-mono text-amber-600">{contrast > 0 ? `+${contrast}` : contrast}</span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full accent-amber-600 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-muted text-[11px] mb-1">
                  <span>Saturation</span>
                  <span className="font-mono text-amber-600">{saturation > 0 ? `+${saturation}` : saturation}</span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={saturation}
                  onChange={(e) => setSaturation(parseInt(e.target.value))}
                  className="w-full accent-amber-600 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-muted text-[11px] mb-1">
                  <span>Warmth / Temp</span>
                  <span className="font-mono text-amber-600">{warmth > 0 ? `+${warmth}` : warmth}</span>
                </div>
                <input
                  type="range"
                  min={-30}
                  max={30}
                  value={warmth}
                  onChange={(e) => setWarmth(parseInt(e.target.value))}
                  className="w-full accent-amber-600 h-1.5 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Gallery Filters */}
        {activeTab === 'filters' && (
          <div className="p-3.5 rounded-xl border border-border bg-surface/60 space-y-2.5">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'original', label: 'Original 🖼️' },
                { id: 'vivid', label: 'Vivid Pop 🌈' },
                { id: 'warm', label: 'Warm Sunlight ☀️' },
                { id: 'cool', label: 'Cool Crisp ❄️' },
                { id: 'grayscale', label: 'B&W Grayscale 🖤' },
                { id: 'sepia', label: 'Vintage Sepia 📜' },
                { id: 'high_contrast', label: 'High Contrast ⚡' },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setFilterPreset(preset.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    filterPreset === preset.id
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold shadow-xs'
                      : 'border-border bg-bg text-muted hover:text-text'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Rotate & Flip */}
        {activeTab === 'rotate' && (
          <div className="p-3.5 rounded-xl border border-border bg-surface/60 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRotate90}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>↻</span> Rotate 90°
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 180) % 360)}
                className="px-4 py-2 rounded-lg border border-border bg-bg hover:border-amber-600 text-text font-bold text-xs transition-all"
              >
                <span>↻</span> Rotate 180°
              </button>
              <button
                type="button"
                onClick={() => setFlipH((f) => !f)}
                className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all ${
                  flipH ? 'border-amber-500 bg-amber-500/10 text-amber-700' : 'border-border bg-bg text-text'
                }`}
              >
                ↔️ Flip Horizontally
              </button>
              <button
                type="button"
                onClick={() => setFlipV((f) => !f)}
                className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all ${
                  flipV ? 'border-amber-500 bg-amber-500/10 text-amber-700' : 'border-border bg-bg text-text'
                }`}
              >
                ↕️ Flip Vertically
              </button>
              <button
                type="button"
                onClick={() => {
                  setRotation(0);
                  setFlipH(false);
                  setFlipV(false);
                }}
                className="px-3 py-2 rounded-lg border border-border bg-bg text-xs font-semibold hover:border-amber-600 text-muted"
              >
                Reset Orientation
              </button>
            </div>
          </div>
        )}

        {/* 5mm Directional Nudge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-border/50">
          <div>
            <label className="font-semibold text-muted mb-2 block uppercase tracking-wider text-[10px]">
              5mm Step Directional Nudge
            </label>
            <div className="grid grid-cols-3 gap-1.5 w-36 mx-auto sm:mx-0">
              <div />
              <button
                type="button"
                onClick={() => nudge5mm(0, -18)}
                className="h-9 w-9 rounded-lg border border-border bg-bg hover:border-amber-600 font-bold text-center active:scale-95 shadow-sm flex items-center justify-center text-sm"
                title="Nudge Up 5mm"
              >
                ▲
              </button>
              <div />
              <button
                type="button"
                onClick={() => nudge5mm(-18, 0)}
                className="h-9 w-9 rounded-lg border border-border bg-bg hover:border-amber-600 font-bold text-center active:scale-95 shadow-sm flex items-center justify-center text-sm"
                title="Nudge Left 5mm"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={handleFillCanvas}
                className="h-9 w-9 rounded-lg border border-border bg-amber-500/10 text-amber-600 font-bold text-center active:scale-95 text-[10px] flex items-center justify-center"
                title="Center"
              >
                ⏺
              </button>
              <button
                type="button"
                onClick={() => nudge5mm(18, 0)}
                className="h-9 w-9 rounded-lg border border-border bg-bg hover:border-amber-600 font-bold text-center active:scale-95 shadow-sm flex items-center justify-center text-sm"
                title="Nudge Right 5mm"
              >
                ▶
              </button>
              <div />
              <button
                type="button"
                onClick={() => nudge5mm(0, 18)}
                className="h-9 w-9 rounded-lg border border-border bg-bg hover:border-amber-600 font-bold text-center active:scale-95 shadow-sm flex items-center justify-center text-sm"
                title="Nudge Down 5mm"
              >
                ▼
              </button>
              <div />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 self-end">
            <div>
              <label className="text-[10px] font-bold text-muted uppercase block mb-0.5">X Offset</label>
              <input
                type="number"
                value={pos.x}
                onChange={(e) => setPos((p) => ({ ...p, x: parseInt(e.target.value) || 0 }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-bg text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase block mb-0.5">Y Offset</label>
              <input
                type="number"
                value={pos.y}
                onChange={(e) => setPos((p) => ({ ...p, y: parseInt(e.target.value) || 0 }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-bg text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function RenderKonvaStage() {
    return (
      <div
        className="relative shadow-2xl rounded-sm overflow-hidden bg-surface-hover/20"
        style={{
          width: stageWidth,
          height: stageHeight,
          filter: cssFilter || undefined,
          transition: 'filter 0.15s ease',
        }}
      >
        <Stage width={stageWidth} height={stageHeight}>
          <Layer>
            {/* Background Wall Area */}
            <Rect x={0} y={0} width={stageWidth} height={stageHeight} fill="transparent" />

            {/* Individual Panel Slices */}
            {Array.from({ length: panelCount }).map((_, i) => {
              const hRatio = heightRatios[i] || 1.0;
              const pHeight = Math.round(stageHeight * hRatio);
              const pY = Math.round((stageHeight - pHeight) / 2);
              const pX = Math.round(i * (panelWidth + gapPx));

              return (
                <Group
                  key={`panel-${i}`}
                  x={pX}
                  y={pY}
                  width={panelWidth}
                  height={pHeight}
                  clipX={0}
                  clipY={0}
                  clipWidth={panelWidth}
                  clipHeight={pHeight}
                >
                  {/* Shared Continuous Image with Native Konva Rotation & Flips */}
                  {image && (
                    <KonvaImage
                      image={image}
                      x={pos.x - pX + imageWidth / 2}
                      y={pos.y - pY + imageHeight / 2}
                      width={imageWidth}
                      height={imageHeight}
                      rotation={rotation}
                      scaleX={flipH ? -1 : 1}
                      scaleY={flipV ? -1 : 1}
                      offsetX={imageWidth / 2}
                      offsetY={imageHeight / 2}
                      draggable
                      onDragMove={(e) => handleDragMove(e, pX)}
                    />
                  )}

                  {/* Panel Edge Shadow Effect */}
                  <Rect
                    x={0}
                    y={0}
                    width={panelWidth}
                    height={pHeight}
                    stroke="rgba(0,0,0,0.15)"
                    strokeWidth={1}
                  />

                  {/* Frame Border Accent around each panel */}
                  {frameStyle && (
                    <Rect
                      x={0}
                      y={0}
                      width={panelWidth}
                      height={pHeight}
                      stroke={frameStyle.stroke}
                      strokeWidth={frameStyle.strokeWidth * 2}
                    />
                  )}
                </Group>
              );
            })}
          </Layer>
        </Stage>
      </div>
    );
  }
}
