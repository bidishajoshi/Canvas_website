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

  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });

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
        // Classic Pentaptych Chevron (Outer: 75%, Mid: 87.5%, Center: 100%)
        return [0.75, 0.875, 1.0, 0.875, 0.75];
      case 6:
        return [0.8, 0.92, 1.0, 1.0, 0.92, 0.8];
      case 7:
        // Panoramic stepped composition
        return [0.7, 0.82, 0.92, 1.0, 0.92, 0.82, 0.7];
      default:
        // Uniform height for 1, 2, 4 panels
        return Array(panelCount).fill(1.0);
    }
  }, [panelCount]);

  // Frame styling properties based on selected frame name
  const frameStyle = useMemo(() => {
    if (!frameName) return null;
    const lower = frameName.toLowerCase();

    if (lower.includes('black')) {
      return { stroke: '#18181b', strokeWidth: 4 };
    }
    if (lower.includes('white')) {
      return { stroke: '#e2e8f0', strokeWidth: 4 };
    }
    if (lower.includes('wood') || lower.includes('natural')) {
      return { stroke: '#78350f', strokeWidth: 5 };
    }
    if (lower.includes('gold') || lower.includes('golden')) {
      return { stroke: '#d97706', strokeWidth: 5 };
    }
    return null;
  }, [frameName]);

  const baseScale = useMemo(() => {
    if (!image) return 1;
    return Math.max(stageWidth / image.width, stageHeight / image.height);
  }, [image, stageWidth, stageHeight]);

  const scale = baseScale * zoom;
  const imageWidth = image ? image.width * scale : 0;
  const imageHeight = image ? image.height * scale : 0;

  // Re-center whenever image or layout changes
  useEffect(() => {
    setPos({
      x: Math.round((stageWidth - imageWidth) / 2),
      y: Math.round((stageHeight - imageHeight) / 2),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, panelCount, aspectRatio, baseScale]);

  // Report crop data
  useEffect(() => {
    if (!image || imageWidth === 0 || imageHeight === 0) return;

    const offsetX = clamp01(-pos.x / imageWidth);
    const offsetY = clamp01(-pos.y / imageHeight);

    const cropData: PanelCropData[] = Array.from({ length: panelCount }, (_, i) => ({
      panelIndex: i,
      offsetX,
      offsetY,
      zoom,
    }));
    onChange(cropData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, zoom, panelCount, image]);

  function handleDragMove(e: Konva.KonvaEventObject<DragEvent>) {
    const node = e.target;
    const minX = stageWidth - imageWidth;
    const minY = stageHeight - imageHeight;
    const x = Math.min(0, Math.max(minX, node.x()));
    const y = Math.min(0, Math.max(minY, node.y()));
    node.position({ x, y });
    setPos({ x, y });
  }

  // 5mm fine nudge adjustment (5mm ≈ 18px on screen preview)
  function nudge5mm(dx: number, dy: number) {
    setPos((prev) => {
      const minX = stageWidth - imageWidth;
      const minY = stageHeight - imageHeight;
      return {
        x: Math.min(0, Math.max(minX, Math.round(prev.x + dx))),
        y: Math.min(0, Math.max(minY, Math.round(prev.y + dy))),
      };
    });
  }

  function handleZoomIn() {
    setZoom((z) => Math.min(2.5, z + 0.15));
  }

  function handleZoomOut() {
    setZoom((z) => Math.max(1, z - 0.15));
  }

  function handleResetTransform() {
    setZoom(1);
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

      {/* Fine 5mm Positioning & Zoom Control Panel */}
      <div className="rounded-2xl border border-border bg-surface p-3 sm:p-4 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="font-bold text-text flex items-center gap-1.5 text-xs sm:text-sm">
            <span>📐</span> Fine 5mm Positioning &amp; Image Adjustment
          </span>
          <button
            type="button"
            onClick={handleResetTransform}
            className="px-2.5 py-1 rounded-lg bg-surface-hover border border-border hover:border-amber-600 font-bold text-xs transition-all active:scale-95"
          >
            ↺ Center Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 5mm Directional Nudge Grid */}
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
                onClick={handleResetTransform}
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

          {/* Zoom Slider & Numeric Inputs */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between font-semibold text-muted mb-1 text-xs">
                <span>Zoom Scale</span>
                <span className="text-amber-600 font-mono font-bold">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="h-8 w-8 rounded-lg border border-border bg-bg font-bold hover:border-amber-600 active:scale-95"
                >
                  -
                </button>
                <input
                  type="range"
                  min={1}
                  max={2.5}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-amber-600 h-2 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="h-8 w-8 rounded-lg border border-border bg-bg font-bold hover:border-amber-600 active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
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
        style={{ width: stageWidth, height: stageHeight }}
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
