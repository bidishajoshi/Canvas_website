'use client';

import { useEffect, useMemo, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
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
  const gapPx = panelCount > 1 ? Math.min(16, Math.max(6, panelGapMm / 2)) : 0;
  const panelWidth = (stageWidth - gapPx * (panelCount - 1)) / panelCount;

  // Frame styling properties based on selected frame name
  const frameStyle = useMemo(() => {
    if (!frameName) return null;
    const lower = frameName.toLowerCase();

    if (lower.includes('black')) {
      return { stroke: '#18181b', strokeWidth: 12, outerMargin: 12 };
    }
    if (lower.includes('white')) {
      return { stroke: '#f8fafc', strokeWidth: 12, outerMargin: 12, shadow: '#cbd5e1' };
    }
    if (lower.includes('wood') || lower.includes('natural')) {
      return { stroke: '#78350f', strokeWidth: 14, outerMargin: 14 };
    }
    if (lower.includes('gold') || lower.includes('golden')) {
      return { stroke: '#d97706', strokeWidth: 14, outerMargin: 14 };
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
      <div className="relative mx-auto overflow-hidden rounded-xl border border-border bg-surface p-2 shadow-sm">
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
          <span className="font-semibold text-muted">Zoom Control:</span>
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
        💡 Tip: Drag your photo inside the frame to center subjects or pan across panels.
      </p>
    </div>
  );

  function RenderKonvaStage() {
    return (
      <div className="relative shadow-xl rounded-sm overflow-hidden" style={{ width: stageWidth, height: stageHeight }}>
        <Stage width={stageWidth} height={stageHeight}>
          <Layer>
            {/* Customer Photo */}
            {image && (
              <KonvaImage
                image={image}
                x={pos.x}
                y={pos.y}
                width={imageWidth}
                height={imageHeight}
                draggable
                onDragMove={handleDragMove}
              />
            )}

            {/* Multi-panel gap dividers */}
            {Array.from({ length: Math.max(0, panelCount - 1) }).map((_, i) => (
              <Rect
                key={`gap-${i}`}
                x={panelWidth * (i + 1) + gapPx * i}
                y={0}
                width={gapPx}
                height={stageHeight}
                fill={gapColor}
              />
            ))}

            {/* Optional Outer Frame Overlay */}
            {frameStyle && (
              <Rect
                x={0}
                y={0}
                width={stageWidth}
                height={stageHeight}
                stroke={frameStyle.stroke}
                strokeWidth={frameStyle.strokeWidth * 2}
              />
            )}
          </Layer>
        </Stage>
      </div>
    );
  }
}
