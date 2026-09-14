'use client';

import { useEffect, useMemo, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Rect, Group, Circle, Path } from 'react-konva';
import useImage from 'use-image';
import type Konva from 'konva';

export interface TShirtEditorProps {
  colorHex: string;
  colorName?: string;
  designUrl?: string | null;
  customTShirtBaseUrl?: string | null;
  customText?: string;
  textFont?: string;
  textColor?: string;
  printAreaCode?: string; // 'front', 'back', 'chest', 'sleeve_left', 'sleeve_right', 'upper_front', 'lower_front', etc.
  viewSide?: 'front' | 'back' | 'sleeve';
  onChange?: (transform: { positionX: number; positionY: number; scale: number; rotation: number }) => void;
}

const STAGE_WIDTH = 520;
const STAGE_HEIGHT = 580;

export function TShirtEditor({
  colorHex = '#ffffff',
  colorName = 'White',
  designUrl,
  customTShirtBaseUrl,
  customText = '',
  textFont = 'Plus Jakarta Sans',
  textColor = '#ffffff',
  printAreaCode = 'front',
  viewSide = 'front',
  onChange,
}: TShirtEditorProps) {
  const [designImage] = useImage(designUrl || '', 'anonymous');
  const [customBaseImage] = useImage(customTShirtBaseUrl || '', 'anonymous');
  const [defaultMockupImage] = useImage('/images/tshirt_default_mockup.png', 'anonymous');

  const [position, setPosition] = useState({ x: 260, y: 270 });
  const [scale, setScale] = useState(0.85);
  const [rotation, setRotation] = useState(0);

  // Print Bounding Area based on view and print location selection
  const printBounds = useMemo(() => {
    switch (printAreaCode) {
      case 'chest':
      case 'left_chest':
        return { x: 300, y: 175, width: 100, height: 100, name: 'Left Chest Emblem' };
      case 'center_front':
      case 'upper_front':
        return { x: 170, y: 160, width: 180, height: 180, name: 'Center / Upper Chest' };
      case 'lower_front':
        return { x: 170, y: 280, width: 180, height: 180, name: 'Lower Front Print' };
      case 'back':
      case 'full_back':
        return { x: 160, y: 150, width: 200, height: 280, name: 'Full Back Print Area' };
      case 'upper_back':
        return { x: 170, y: 155, width: 180, height: 140, name: 'Upper Back Print' };
      case 'sleeve_left':
        return { x: 75, y: 175, width: 90, height: 110, name: 'Left Sleeve Badge' };
      case 'sleeve_right':
        return { x: 355, y: 175, width: 90, height: 110, name: 'Right Sleeve Badge' };
      case 'full_front':
      default:
        return { x: 160, y: 150, width: 200, height: 280, name: 'Full Front Print Area' };
    }
  }, [printAreaCode]);

  // Center design inside print area on design or location change
  useEffect(() => {
    setPosition({
      x: printBounds.x + printBounds.width / 2,
      y: printBounds.y + printBounds.height / 3 + 25,
    });
  }, [designUrl, printAreaCode, printBounds]);

  // Report transform changes up
  useEffect(() => {
    if (onChange) {
      onChange({ positionX: position.x, positionY: position.y, scale, rotation });
    }
  }, [position, scale, rotation, onChange]);

  function handleDragMove(e: Konva.KonvaEventObject<DragEvent>) {
    const node = e.target;
    setPosition({ x: Math.round(node.x()), y: Math.round(node.y()) });
  }

  // 5mm step precision positioning nudge (5mm ≈ 18px on screen)
  function nudge(dx: number, dy: number) {
    setPosition((prev) => ({
      x: Math.round(prev.x + dx),
      y: Math.round(prev.y + dy),
    }));
  }

  function handleCenter() {
    setPosition({
      x: printBounds.x + printBounds.width / 2,
      y: printBounds.y + printBounds.height / 2,
    });
    setScale(0.85);
    setRotation(0);
  }

  return (
    <div className="space-y-4">
      {/* Interactive Realistic T-Shirt Customization Stage Container */}
      <div className="relative mx-auto overflow-hidden rounded-2xl border border-border bg-surface p-3 shadow-md flex flex-col items-center justify-center">
        <div
          className="relative shadow-2xl rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900"
          style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }}
        >
          <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT}>
            <Layer>
              {/* Customer Uploaded Base Image OR Photorealistic White T-Shirt Photo OR Vector Fallback */}
              {customBaseImage ? (
                <KonvaImage
                  image={customBaseImage}
                  x={40}
                  y={40}
                  width={440}
                  height={500}
                />
              ) : defaultMockupImage ? (
                <KonvaImage
                  image={defaultMockupImage}
                  x={30}
                  y={10}
                  width={460}
                  height={560}
                />
              ) : (
                <Group>
                  {/* Outer Shadow Drop */}
                  <Rect
                    x={110}
                    y={100}
                    width={300}
                    height={430}
                    cornerRadius={24}
                    fill="#000000"
                    opacity={0.08}
                    shadowBlur={20}
                    shadowOffsetY={10}
                  />

                  {/* Main Torso Fabric */}
                  <Rect
                    x={125}
                    y={110}
                    width={270}
                    height={420}
                    cornerRadius={[24, 24, 16, 16]}
                    fill={colorHex}
                    stroke="#27272a"
                    strokeWidth={1.5}
                  />

                  {/* Left Sleeve Body */}
                  <Rect
                    x={45}
                    y={120}
                    width={100}
                    height={145}
                    cornerRadius={14}
                    fill={colorHex}
                    stroke="#27272a"
                    strokeWidth={1.5}
                    rotation={-28}
                  />

                  {/* Right Sleeve Body */}
                  <Rect
                    x={375}
                    y={73}
                    width={100}
                    height={145}
                    cornerRadius={14}
                    fill={colorHex}
                    stroke="#27272a"
                    strokeWidth={1.5}
                    rotation={28}
                  />

                  {/* Collar Ribbing Seam (Front Crew Neck vs Back Collar) */}
                  {viewSide === 'back' ? (
                    <Path
                      data="M 210 110 Q 260 120 310 110"
                      stroke="#27272a"
                      strokeWidth={2.5}
                      fill="transparent"
                    />
                  ) : (
                    <Group>
                      <Rect
                        x={200}
                        y={105}
                        width={120}
                        height={40}
                        cornerRadius={[0, 0, 48, 48]}
                        fill="#09090b"
                        opacity={0.12}
                      />
                      <Path
                        data="M 200 110 Q 260 145 320 110"
                        stroke="#27272a"
                        strokeWidth={2.5}
                        fill="transparent"
                      />
                    </Group>
                  )}

                  {/* Inner Brand Tag Label */}
                  <Rect
                    x={230}
                    y={118}
                    width={60}
                    height={22}
                    cornerRadius={4}
                    fill="#000000"
                    opacity={0.15}
                  />
                </Group>
              )}

              {/* Printable Bounding Box Container */}
              <Rect
                x={printBounds.x}
                y={printBounds.y}
                width={printBounds.width}
                height={printBounds.height}
                stroke="#d97706"
                strokeWidth={1.8}
                dash={[8, 5]}
                cornerRadius={6}
              />

              {/* Graphic Design Artwork Overlay */}
              {designImage && (
                <KonvaImage
                  image={designImage}
                  x={position.x}
                  y={position.y}
                  width={170 * scale}
                  height={170 * scale}
                  offsetX={(170 * scale) / 2}
                  offsetY={(170 * scale) / 2}
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
                  y={position.y + (designImage ? 95 * scale : 0)}
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

          {/* Top Printable Zone Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/75 text-white backdrop-blur shadow">
              {printBounds.name}
            </span>
          </div>

          {/* Color Indicator Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface/90 border border-border text-xs font-semibold shadow-sm">
            <span
              className="h-3 w-3 rounded-full border border-black/20"
              style={{ backgroundColor: colorHex }}
            />
            <span>{colorName}</span>
          </div>
        </div>
      </div>

      {/* 5mm Precision Positioning & Fine Nudge Controls */}
      <div className="rounded-2xl border border-border bg-surface p-4 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="font-bold text-text flex items-center gap-1.5">
            <span>🎯</span> Fine 5mm Precision Position &amp; Transform
          </span>
          <button
            type="button"
            onClick={handleCenter}
            className="px-3 py-1 rounded-lg bg-surface-hover border border-border hover:border-amber-600 font-bold transition-all active:scale-95"
          >
            ↺ Center Design
          </button>
        </div>

        {/* Directional Nudge Buttons (5mm step = 18px) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-muted mb-2 block uppercase tracking-wider text-[10px]">
              5mm Step Directional Nudge
            </label>
            <div className="grid grid-cols-3 gap-1.5 w-36 mx-auto sm:mx-0">
              <div />
              <button
                type="button"
                onClick={() => nudge(0, -18)}
                className="p-2 rounded-lg border border-border bg-bg hover:border-amber-600 font-bold text-center active:scale-95 shadow-sm"
                title="Nudge Up 5mm"
              >
                ▲
              </button>
              <div />
              <button
                type="button"
                onClick={() => nudge(-18, 0)}
                className="p-2 rounded-lg border border-border bg-bg hover:border-amber-600 font-bold text-center active:scale-95 shadow-sm"
                title="Nudge Left 5mm"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={handleCenter}
                className="p-2 rounded-lg border border-border bg-amber-500/10 text-amber-600 font-bold text-center active:scale-95 text-[10px]"
                title="Center"
              >
                ⏺
              </button>
              <button
                type="button"
                onClick={() => nudge(18, 0)}
                className="p-2 rounded-lg border border-border bg-bg hover:border-amber-600 font-bold text-center active:scale-95 shadow-sm"
                title="Nudge Right 5mm"
              >
                ▶
              </button>
              <div />
              <button
                type="button"
                onClick={() => nudge(0, 18)}
                className="p-2 rounded-lg border border-border bg-bg hover:border-amber-600 font-bold text-center active:scale-95 shadow-sm"
                title="Nudge Down 5mm"
              >
                ▼
              </button>
              <div />
            </div>
          </div>

          {/* Sliders & Numeric Inputs */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between font-semibold text-muted mb-1">
                <span>Scale / Size</span>
                <span className="text-amber-600 font-mono">{(scale * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.4}
                max={2.0}
                step={0.05}
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-amber-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-muted mb-1">
                <span>Rotation</span>
                <span className="text-amber-600 font-mono">{rotation}°</span>
              </div>
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

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase block mb-0.5">X Position</label>
                <input
                  type="number"
                  value={position.x}
                  onChange={(e) => setPosition((p) => ({ ...p, x: parseInt(e.target.value) || 0 }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-bg text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted uppercase block mb-0.5">Y Position</label>
                <input
                  type="number"
                  value={position.y}
                  onChange={(e) => setPosition((p) => ({ ...p, y: parseInt(e.target.value) || 0 }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-bg text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
