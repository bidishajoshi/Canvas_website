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
  onChange: (cropData: PanelCropData[]) => void;
}

const PREVIEW_WIDTH = 640;

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

// NOTE (v1 scope): all panels share one continuous pan/zoom transform,
// since they render slices of a single uploaded photo — this is what
// "3-panel split across one photo" means visually. Per-panel
// independent fine-tuning (e.g. nudging just the middle panel) can be
// added later by giving each panel its own offset stored alongside the
// shared zoom.
export function CanvasEditor({
  imageUrl,
  panelCount,
  aspectRatio,
  panelGapMm,
  onChange,
}: CanvasEditorProps) {
  const [image] = useImage(imageUrl, 'anonymous');
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const gapColor = useCssVar('--color-bg', '#fffdf9');

  const stageWidth = PREVIEW_WIDTH;
  const stageHeight = Math.round(PREVIEW_WIDTH / Math.max(aspectRatio, 0.01));
  const gapPx = panelCount > 1 ? Math.min(16, Math.max(4, panelGapMm / 2)) : 0;
  const panelWidth = (stageWidth - gapPx * (panelCount - 1)) / panelCount;

  const baseScale = useMemo(() => {
    if (!image) return 1;
    return Math.max(stageWidth / image.width, stageHeight / image.height);
  }, [image, stageWidth, stageHeight]);

  const scale = baseScale * zoom;
  const imageWidth = image ? image.width * scale : 0;
  const imageHeight = image ? image.height * scale : 0;

  // Re-center whenever the image or layout changes.
  useEffect(() => {
    setPos({
      x: (stageWidth - imageWidth) / 2,
      y: (stageHeight - imageHeight) / 2,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, panelCount, aspectRatio, baseScale]);

  // Report crop data upward whenever the transform changes.
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
    // Clamp so the image can't be dragged past the stage edges, leaving
    // a blank gap in a panel.
    const minX = stageWidth - imageWidth;
    const minY = stageHeight - imageHeight;
    const x = Math.min(0, Math.max(minX, node.x()));
    const y = Math.min(0, Math.max(minY, node.y()));
    node.position({ x, y });
    setPos({ x, y });
  }

  return (
    <div className="space-y-3">
      <div
        className="mx-auto overflow-hidden rounded-card border border-border bg-surface"
        style={{ width: '100%', maxWidth: stageWidth }}
      >
        <Stage width={stageWidth} height={stageHeight}>
          <Layer>
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
            {Array.from({ length: Math.max(0, panelCount - 1) }).map((_, i) => (
              <Rect
                key={i}
                x={panelWidth * (i + 1) + gapPx * i}
                y={0}
                width={gapPx}
                height={stageHeight}
                fill={gapColor}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="canvas-zoom" className="text-xs text-muted shrink-0">
          Zoom
        </label>
        <input
          id="canvas-zoom"
          type="range"
          min={1}
          max={2.5}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="flex-1"
          aria-label="Zoom into photo"
        />
      </div>
      <p className="text-xs text-muted">
        Drag the photo to reposition it, or use zoom to fill the panels the way you want.
      </p>
    </div>
  );
}
