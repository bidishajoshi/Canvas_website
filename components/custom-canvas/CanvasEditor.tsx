'use client';

import { useEffect, useMemo, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Group } from 'react-konva';
import useImage from 'use-image';
import type Konva from 'konva';
import { useCssVar } from '@/lib/useCssVar';
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

  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const gapColor = useCssVar('--color-bg', '#faf8f5');

  const stageWidth = PREVIEW_WIDTH;
  const stageHeight = Math.round(PREVIEW_WIDTH / Math.max(aspectRatio, 0.01));
  const gapPx = panelCount > 1 ? Math.min(24, Math.max(6, Math.round((panelGapMm / 10) * 4))) : 0;
  const panelWidth = (stageWidth - gapPx * (panelCount - 1)) / panelCount;

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
      return { stroke: '#18181b', strokeWidth: 4, fill: undefined };
    }
    if (lower.includes('white')) {
      return { stroke: '#e2e8f0', strokeWidth: 4, fill: undefined };
    }
    if (lower.includes('wood') || lower.includes('natural')) {
      return { stroke: '#78350f', strokeWidth: 5, fill: undefined };
    }
    if (lower.includes('gold') || lower.includes('golden')) {
      return { stroke: '#d97706', strokeWidth: 5, fill: undefined };
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
      x: (stageWidth - imageWidth) / 2,
      y: (stageHeight - imageHeight) / 2,
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

  function handleZoomIn() {
    setZoom((z) => Math.min(2.5, z + 0.15));
  }

  function handleZoomOut() {
    setZoom((z) => Math.max(1, z - 0.15));
  }

  function handleResetTransform() {
    setZoom(1);
    setPos({
      x: (stageWidth - imageWidth) / 2,
      y: (stageHeight - imageHeight) / 2,
    });
  }

  return (
    <div className="space-y-4">
      {/* Live Canvas Stage Container */}
      <div className="relative mx-auto overflow-hidden rounded-xl border border-border bg-surface p-3 shadow-sm">
        {mockupUrl && mockupImage ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
            <img src={mockupUrl} alt="Room Mockup" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="scale-75 sm:scale-90 shadow-2xl transition-transform">
                <RenderKonvaStage />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-2 overflow-x-auto">
            <RenderKonvaStage />
          </div>
        )}
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border bg-surface/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-muted">Pan &amp; Zoom:</span>
          <button
            type="button"
            onClick={handleZoomOut}
            className="px-2.5 py-1 rounded bg-surface-hover border border-border hover:border-amber-600 font-bold"
            title="Zoom Out"
          >
            -
          </button>
          <span className="w-12 text-center font-mono font-semibold">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="px-2.5 py-1 rounded bg-surface-hover border border-border hover:border-amber-600 font-bold"
            title="Zoom In"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetTransform}
            className="px-3 py-1 rounded bg-surface-hover border border-border hover:border-amber-600 text-text font-medium transition-colors"
          >
            Reset Center
          </button>
        </div>
      </div>

      <p className="text-[11px] text-muted text-center italic">
        💡 Drag photo inside the frame to center key artwork subjects across panels.
      </p>
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
