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

  // Zoom & Transform states (Zoom allowed down to 0.3 = 30% zoom out up to 3.0 = 300% zoom in)
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // Photo adjustment states (Brightness, Contrast, Saturation, Filter, Rotation)
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [filterPreset, setFilterPreset] = useState<string>('original');
  const [rotation, setRotation] = useState<number>(0);

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

    if (filterPreset === 'grayscale') parts.push('grayscale(100%)');
    if (filterPreset === 'sepia') parts.push('sepia(80%)');
    if (filterPreset === 'vivid') parts.push('saturate(180%) contrast(110%)');
    if (filterPreset === 'vintage') parts.push('sepia(40%) contrast(110%) brightness(95%)');
    if (filterPreset === 'high_contrast') parts.push('contrast(160%) brightness(105%)');

    return parts.join(' ');
  }, [brightness, contrast, saturation, filterPreset]);

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

  function handleDragMove(e: Konva.KonvaEventObject<DragEvent>) {
    const node = e.target;
    const minX = stageWidth - imageWidth;
    const minY = stageHeight - imageHeight;

    const x = imageWidth >= stageWidth
      ? Math.min(0, Math.max(minX, node.x()))
      : Math.max(0, Math.min(stageWidth - imageWidth, node.x()));

    const y = imageHeight >= stageHeight
      ? Math.min(0, Math.max(minY, node.y()))
      : Math.max(0, Math.min(stageHeight - imageHeight, node.y()));

    node.position({ x, y });
    setPos({ x, y });
  }

  function nudge5mm(dx: number, dy: number) {
    setPos((prev) => {
      const minX = stageWidth - imageWidth;
      const minY = stageHeight - imageHeight;

      const x = imageWidth >= stageWidth
        ? Math.min(0, Math.max(minX, Math.round(prev.x + dx)))
        : Math.round(prev.x + dx);

      const y = imageHeight >= stageHeight
        ? Math.min(0, Math.max(minY, Math.round(prev.y + dy)))
        : Math.round(prev.y + dy);

      return { x, y };
    });
  }

  function handleZoomIn() {
    setZoom((z) => Math.min(3.0, z + 0.15));
  }

  function handleZoomOut() {
    setZoom((z) => Math.max(0.3, z - 0.15));
  }

  function handleFitEntirePhoto() {
    if (!image) return;
    const containScale = Math.min(stageWidth / image.width, stageHeight / image.height);
    const fitZoom = Math.max(0.3, containScale / baseScale);
    setZoom(fitZoom);

    const fitW = image.width * baseScale * fitZoom;
    const fitH = image.height * baseScale * fitZoom;
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
    setFilterPreset('original');
    setRotation(0);
    setPos({
      x: Math.round((stageWidth - imageWidth) / 2),
      y: Math.round((stageHeight - imageHeight) / 2),
    });
  }

  return (
    <div className="space-y-4">
      {/* Live Clean Canvas Stage Container with Mobile Responsive Scaling */}
      <div
        ref={containerRef}
        className="relative mx-auto w-full overflow-hidden rounded-2xl border border-border bg-surface p-2 sm:p-4 shadow-md flex justify-center items-center"
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
          <div className="flex justify-center items-center py-2 w-full overflow-hidden">
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

      {/* Advanced Photo Adjustments, Filters, Zoom Out & Positioning Controls */}
      <div className="rounded-2xl border border-border bg-surface p-4 space-y-5 text-xs shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="font-bold text-text flex items-center gap-1.5 text-xs sm:text-sm">
            <span>✨</span> Photo Adjustments, Filters &amp; Zoom Tools
          </span>
          <button
            type="button"
            onClick={handleResetAll}
            className="px-3 py-1 rounded-lg bg-surface-hover border border-border hover:border-amber-600 font-bold text-xs transition-all active:scale-95 text-muted hover:text-text"
          >
            ↺ Reset All Adjustments
          </button>
        </div>

        {/* 1. Quick Zoom Presets & Zoom Out/In Slider */}
        <div className="p-3.5 rounded-xl border border-border bg-surface/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-text flex items-center gap-1">
              <span>🔍</span> Zoom Out &amp; Zoom In Controls
            </span>
            <span className="text-amber-600 font-mono font-bold">{Math.round(zoom * 100)}%</span>
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

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleZoomOut}
              className="h-8 w-10 rounded-lg border border-border bg-bg font-bold hover:border-amber-600 active:scale-95 text-xs flex items-center justify-center"
              title="Zoom Out"
            >
              −
            </button>
            <input
              type="range"
              min={0.3}
              max={3.0}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-amber-600 h-2 rounded-lg cursor-pointer"
            />
            <button
              type="button"
              onClick={handleZoomIn}
              className="h-8 w-10 rounded-lg border border-border bg-bg font-bold hover:border-amber-600 active:scale-95 text-xs flex items-center justify-center"
              title="Zoom In"
            >
              +
            </button>
          </div>
        </div>

        {/* 2. Photo Tone Adjustments (Brightness, Contrast, Saturation) */}
        <div className="p-3.5 rounded-xl border border-border bg-surface/60 space-y-3">
          <span className="font-bold text-text flex items-center gap-1">
            <span>☀️</span> Tone &amp; Color Sliders
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          </div>
        </div>

        {/* 3. Photo Filter Presets */}
        <div className="p-3.5 rounded-xl border border-border bg-surface/60 space-y-2.5">
          <span className="font-bold text-text flex items-center gap-1">
            <span>🪄</span> Quick Photo Filter Presets
          </span>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'original', label: 'Original 🖼️' },
              { id: 'grayscale', label: 'B&W Grayscale 🖤' },
              { id: 'sepia', label: 'Warm Sepia 📜' },
              { id: 'vivid', label: 'Vivid Pop 🌈' },
              { id: 'vintage', label: 'Vintage Tone 🎞️' },
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

        {/* 4. Fine 5mm Positioning & Rotation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
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

          <div className="space-y-3">
            <div>
              <label className="font-semibold text-muted mb-1.5 block uppercase tracking-wider text-[10px]">
                Photo Rotation Angle
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="flex-1 py-2 rounded-lg border border-border bg-bg hover:border-amber-600 text-xs font-bold transition-all flex items-center justify-center gap-1"
                >
                  <span>↻</span> Rotate 90°
                </button>
                <button
                  type="button"
                  onClick={() => setRotation(0)}
                  className="px-3 py-2 rounded-lg border border-border bg-bg text-xs font-semibold hover:border-amber-600"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
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
          transform: rotation ? `rotate(${rotation}deg)` : undefined,
          transition: 'filter 0.15s ease, transform 0.2s ease',
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
                  {/* Shared Continuous Image */}
                  {image && (
                    <KonvaImage
                      image={image}
                      x={pos.x - pX}
                      y={pos.y - pY}
                      width={imageWidth}
                      height={imageHeight}
                      draggable
                      onDragMove={handleDragMove}
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
