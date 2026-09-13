'use client';

import { useEffect, useMemo, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Rect, Group } from 'react-konva';
import useImage from 'use-image';
import type Konva from 'konva';

interface TShirtEditorProps {
  colorHex: string;
  designUrl?: string | null;
  customText?: string;
  textFont?: string;
  textColor?: string;
  printAreaCode?: string; // 'front', 'back', 'chest'
  onChange?: (transform: { positionX: number; positionY: number; scale: number; rotation: number }) => void;
}

const STAGE_WIDTH = 500;
const STAGE_HEIGHT = 560;

export function TShirtEditor({
  colorHex,
  designUrl,
  customText = '',
  textFont = 'Plus Jakarta Sans',
  textColor = '#ffffff',
  printAreaCode = 'front',
  onChange,
}: TShirtEditorProps) {
  const [designImage] = useImage(designUrl || '', 'anonymous');

  const [position, setPosition] = useState({ x: 250, y: 260 });
  const [scale, setScale] = useState(0.8);
  const [rotation, setRotation] = useState(0);

  // Print Bounding Area based on print location selection
  const printBounds = useMemo(() => {
    if (printAreaCode === 'chest') {
      return { x: 290, y: 170, width: 110, height: 110, name: 'Left Chest Print' };
    }
    if (printAreaCode === 'back') {
      return { x: 150, y: 150, width: 200, height: 260, name: 'Back Print Area' };
    }
    // Default Front Print
    return { x: 150, y: 160, width: 200, height: 260, name: 'Front Print Area' };
  }, [printAreaCode]);

  // Center design inside print area on design/location change
  useEffect(() => {
    setPosition({
      x: printBounds.x + printBounds.width / 2,
      y: printBounds.y + printBounds.height / 3 + 20,
    });
  }, [designUrl, printAreaCode, printBounds]);

  // Report transform changes up
  useEffect(() => {
    if (onChange) {
      onChange({
        positionX: position.x,
        positionY: position.y,
        scale,
        rotation,
      });
    }
  }, [position, scale, rotation, onChange]);

  function handleDragMove(e: Konva.KonvaEventObject<DragEvent>) {
    const node = e.target;
    setPosition({ x: node.x(), y: node.y() });
  }

  function handleCenter() {
    setPosition({
      x: printBounds.x + printBounds.width / 2,
      y: printBounds.y + printBounds.height / 2,
    });
    setScale(0.8);
    setRotation(0);
  }

  return (
    <div className="space-y-4">
      {/* T-Shirt Canvas Renderer Container */}
      <div className="relative mx-auto overflow-hidden rounded-xl border border-border bg-surface p-2 shadow-sm flex flex-col items-center justify-center">
        <div className="relative shadow-lg rounded-lg overflow-hidden" style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }}>
          <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT}>
            <Layer>
              {/* T-Shirt Base Body Silhouette with dynamic colorHex */}
              <Group>
                {/* Main Body */}
                <Rect
                  x={120}
                  y={130}
                  width={260}
                  height={380}
                  cornerRadius={12}
                  fill={colorHex}
                  stroke="#27272a"
                  strokeWidth={2}
                />
                {/* Left Sleeve */}
                <Rect
                  x={50}
                  y={130}
                  width={90}
                  height={130}
                  cornerRadius={8}
                  fill={colorHex}
                  stroke="#27272a"
                  strokeWidth={2}
                  rotation={-25}
                />
                {/* Right Sleeve */}
                <Rect
                  x={375}
                  y={90}
                  width={90}
                  height={130}
                  cornerRadius={8}
                  fill={colorHex}
                  stroke="#27272a"
                  strokeWidth={2}
                  rotation={25}
                />
                {/* Crew Neck Collar */}
                <Rect
                  x={200}
                  y={120}
                  width={100}
                  height={35}
                  cornerRadius={[0, 0, 40, 40]}
                  fill="#09090b"
                  opacity={0.15}
                />
              </Group>

              {/* Printable Bounding Box Guide */}
              <Rect
                x={printBounds.x}
                y={printBounds.y}
                width={printBounds.width}
                height={printBounds.height}
                stroke="#d97706"
                strokeWidth={1.5}
                dash={[6, 4]}
                cornerRadius={4}
              />

              {/* Graphic Design Artwork Overlay */}
              {designImage && (
                <KonvaImage
                  image={designImage}
                  x={position.x}
                  y={position.y}
                  width={160 * scale}
                  height={160 * scale}
                  offsetX={(160 * scale) / 2}
                  offsetY={(160 * scale) / 2}
                  rotation={rotation}
                  draggable
                  onDragMove={handleDragMove}
                />
              )}

              {/* Custom Text Overlay */}
              {customText && (
                <KonvaText
                  text={customText}
                  x={position.x}
                  y={position.y + (designImage ? 90 * scale : 0)}
                  fontSize={24 * scale}
                  fontFamily={textFont}
                  fill={textColor}
                  align="center"
                  offsetX={(customText.length * 12 * scale) / 2}
                  offsetY={12 * scale}
                  rotation={rotation}
                  draggable
                  onDragMove={handleDragMove}
                />
              )}
            </Layer>
          </Stage>

          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur">
            {printBounds.name}
          </span>
        </div>
      </div>

      {/* Design Editor Controls Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-border bg-surface/70 text-xs">
        <div>
          <label className="font-semibold text-muted mb-1 block">Artwork Size / Scale</label>
          <input
            type="range"
            min={0.4}
            max={1.5}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full accent-amber-600"
          />
        </div>

        <div>
          <label className="font-semibold text-muted mb-1 block">Rotation ({rotation}°)</label>
          <input
            type="range"
            min={-180}
            max={180}
            step={5}
            value={rotation}
            onChange={(e) => setRotation(parseInt(e.target.value))}
            className="w-full accent-amber-600"
          />
        </div>

        <div className="flex items-end justify-end gap-2">
          <button
            type="button"
            onClick={handleCenter}
            className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border hover:border-amber-600 font-semibold transition-colors"
          >
            🎯 Center Design
          </button>
        </div>
      </div>
    </div>
  );
}
