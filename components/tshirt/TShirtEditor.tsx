'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Rect, Group, Path } from 'react-konva';
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
  printAreaCode?: string; // 'front', 'back', 'left_chest', 'sleeve_left', etc.
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

  // Fabric Color Tint Canvas state for previous photorealistic mockup image
  const [tintedMockupCanvas, setTintedMockupCanvas] = useState<HTMLCanvasElement | null>(null);

  // Responsive stage scaling state for mobile phone screens
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageScale, setStageScale] = useState(1);

  const [position, setPosition] = useState({ x: 260, y: 270 });
  const [scale, setScale] = useState(0.85);
  const [rotation, setRotation] = useState(0);

  // Measure container and scale Konva stage dynamically for small screen widths (< 520px)
  useEffect(() => {
    function updateScale() {
      if (containerRef.current) {
        const availableWidth = containerRef.current.clientWidth - 16;
        if (availableWidth < STAGE_WIDTH) {
          setStageScale(Math.max(0.5, availableWidth / STAGE_WIDTH));
        } else {
          setStageScale(1);
        }
      }
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Photorealistic Fabric Color Tinting for Previous Mockup Photo (100% Smooth Coverage, Zero Splotches)
  useEffect(() => {
    if (!defaultMockupImage) return;
    if (!colorHex || colorHex.toLowerCase() === '#ffffff') {
      setTintedMockupCanvas(null);
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const w = defaultMockupImage.width;
      const h = defaultMockupImage.height;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw base photo
      ctx.drawImage(defaultMockupImage, 0, 0);

      // 2. Define smooth t-shirt silhouette clip path matching photo contours
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(w * 0.35, h * 0.11);
      ctx.bezierCurveTo(w * 0.45, h * 0.14, w * 0.55, h * 0.14, w * 0.65, h * 0.11);
      ctx.lineTo(w * 0.77, h * 0.15);
      ctx.lineTo(w * 0.96, h * 0.28);
      ctx.lineTo(w * 0.94, h * 0.40);
      ctx.lineTo(w * 0.80, h * 0.41);
      ctx.lineTo(w * 0.76, h * 0.33);
      ctx.lineTo(w * 0.77, h * 0.93);
      ctx.lineTo(w * 0.23, h * 0.93);
      ctx.lineTo(w * 0.24, h * 0.33);
      ctx.lineTo(w * 0.20, h * 0.41);
      ctx.lineTo(w * 0.06, h * 0.40);
      ctx.lineTo(w * 0.04, h * 0.28);
      ctx.lineTo(w * 0.23, h * 0.15);
      ctx.closePath();
      ctx.clip();

      // 3. Multiply blend target color over garment fabric
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = colorHex;
      ctx.fillRect(0, 0, w, h);

      // 4. Soft-light blend enhancement for deep rich dark colors (Black/Charcoal)
      const cleanHex = colorHex.replace('#', '');
      const r = parseInt(cleanHex.substring(0, 2) || 'ff', 16);
      const g = parseInt(cleanHex.substring(2, 4) || 'ff', 16);
      const b = parseInt(cleanHex.substring(4, 6) || 'ff', 16);
      if ((r + g + b) / 3 < 55) {
        ctx.globalCompositeOperation = 'soft-light';
        ctx.fillStyle = colorHex;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore();
      setTintedMockupCanvas(canvas);
    } catch {
      setTintedMockupCanvas(null);
    }
  }, [defaultMockupImage, colorHex]);

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
      {/* Interactive Mobile-Responsive T-Shirt Customization Stage Container */}
      <div
        ref={containerRef}
        className="relative mx-auto w-full overflow-hidden rounded-2xl border border-border bg-surface p-2 sm:p-4 shadow-md flex flex-col items-center justify-center"
      >
        <div
          className="relative shadow-2xl rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 transition-all origin-top flex items-center justify-center"
          style={{
            width: Math.round(STAGE_WIDTH * stageScale),
            height: Math.round(STAGE_HEIGHT * stageScale),
          }}
        >
          <div
            style={{
              width: STAGE_WIDTH,
              height: STAGE_HEIGHT,
              transform: `scale(${stageScale})`,
              transformOrigin: 'top left',
            }}
          >
            <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT}>
              <Layer>
                {/* Customer Uploaded Base Image OR Photorealistic Color-Tinted T-Shirt Photo */}
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
                    image={tintedMockupCanvas || defaultMockupImage}
                    x={30}
                    y={10}
                    width={460}
                    height={560}
                  />
                ) : (
                  <Group>
                    {/* Outer Drop Shadow */}
                    <Rect
                      x={105}
                      y={95}
                      width={310}
                      height={440}
                      cornerRadius={28}
                      fill="#000000"
                      opacity={0.07}
                      shadowBlur={24}
                      shadowOffsetY={12}
                    />

                    {/* Left Sleeve Body */}
                    <Rect
                      x={45}
                      y={118}
                      width={105}
                      height={150}
                      cornerRadius={18}
                      fill={colorHex}
                      stroke="#18181b"
                      strokeWidth={1.2}
                      rotation={-28}
                    />

                    {/* Right Sleeve Body */}
                    <Rect
                      x={370}
                      y={69}
                      width={105}
                      height={150}
                      cornerRadius={18}
                      fill={colorHex}
                      stroke="#18181b"
                      strokeWidth={1.2}
                      rotation={28}
                    />

                    {/* Left Shoulder Cap Connection */}
                    <Rect
                      x={110}
                      y={105}
                      width={60}
                      height={70}
                      cornerRadius={16}
                      fill={colorHex}
                    />

                    {/* Right Shoulder Cap Connection */}
                    <Rect
                      x={350}
                      y={105}
                      width={60}
                      height={70}
                      cornerRadius={16}
                      fill={colorHex}
                    />

                    {/* Main Torso Fabric (100% Full Uniform Color Fill) */}
                    <Rect
                      x={120}
                      y={105}
                      width={280}
                      height={430}
                      cornerRadius={[28, 28, 16, 16]}
                      fill={colorHex}
                      stroke="#18181b"
                      strokeWidth={1.5}
                    />

                    {/* Side Seam Accent Lines */}
                    <Path
                      data="M 122 180 L 122 520"
                      stroke="rgba(0,0,0,0.15)"
                      strokeWidth={1.5}
                    />
                    <Path
                      data="M 398 180 L 398 520"
                      stroke="rgba(0,0,0,0.15)"
                      strokeWidth={1.5}
                    />
                    <Path
                      data="M 120 525 L 400 525"
                      stroke="rgba(0,0,0,0.2)"
                      strokeWidth={2}
                    />

                    {/* Collar Ribbing & Neck Line */}
                    {viewSide === 'back' ? (
                      <Path
                        data="M 205 105 Q 260 118 315 105"
                        stroke="#18181b"
                        strokeWidth={2.5}
                        fill="transparent"
                      />
                    ) : (
                      <Group>
                        <Rect
                          x={195}
                          y={100}
                          width={130}
                          height={42}
                          cornerRadius={[0, 0, 52, 52]}
                          fill="#09090b"
                          opacity={0.15}
                        />
                        <Path
                          data="M 195 105 Q 260 148 325 105"
                          stroke="#18181b"
                          strokeWidth={2.5}
                          fill="transparent"
                        />
                      </Group>
                    )}

                    {/* Inner Brand Tag Label */}
                    <Rect
                      x={225}
                      y={112}
                      width={70}
                      height={24}
                      cornerRadius={4}
                      fill="#000000"
                      opacity={0.18}
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
          </div>

          {/* Top Printable Zone Badge */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-2">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/80 text-white backdrop-blur shadow">
              {printBounds.name}
            </span>
          </div>

          {/* Color Indicator Badge */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-surface/90 border border-border text-[10px] sm:text-xs font-semibold shadow-sm">
            <span
              className="h-3 w-3 rounded-full border border-black/20 shadow-inner"
              style={{ backgroundColor: colorHex }}
            />
            <span className="max-w-[100px] truncate">{colorName}</span>
          </div>
        </div>
      </div>

      {/* Touch-Friendly Fine Precision Positioning & Controls */}
      <div className="rounded-2xl border border-border bg-surface p-3 sm:p-4 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="font-bold text-text flex items-center gap-1.5 text-xs sm:text-sm">
            <span>🎯</span> Fine 5mm Precision Position
          </span>
          <button
            type="button"
            onClick={handleCenter}
            className="px-2.5 py-1 rounded-lg bg-surface-hover border border-border hover:border-amber-600 font-bold text-xs transition-all active:scale-95"
          >
            ↺ Center
          </button>
        </div>

        {/* Directional Nudge Buttons & Sliders */}
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
                className="h-9 w-9 rounded-lg border border-border bg-bg hover:border-amber-600 font-bold text-center active:scale-95 shadow-sm flex items-center justify-center text-sm"
                title="Nudge Up 5mm"
              >
                ▲
              </button>
              <div />
              <button
                type="button"
                onClick={() => nudge(-18, 0)}
                className="h-9 w-9 rounded-lg border border-border bg-bg hover:border-amber-600 font-bold text-center active:scale-95 shadow-sm flex items-center justify-center text-sm"
                title="Nudge Left 5mm"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={handleCenter}
                className="h-9 w-9 rounded-lg border border-border bg-amber-500/10 text-amber-600 font-bold text-center active:scale-95 text-[10px] flex items-center justify-center"
                title="Center"
              >
                ⏺
              </button>
              <button
                type="button"
                onClick={() => nudge(18, 0)}
                className="h-9 w-9 rounded-lg border border-border bg-bg hover:border-amber-600 font-bold text-center active:scale-95 shadow-sm flex items-center justify-center text-sm"
                title="Nudge Right 5mm"
              >
                ▶
              </button>
              <div />
              <button
                type="button"
                onClick={() => nudge(0, 18)}
                className="h-9 w-9 rounded-lg border border-border bg-bg hover:border-amber-600 font-bold text-center active:scale-95 shadow-sm flex items-center justify-center text-sm"
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
              <div className="flex justify-between font-semibold text-muted mb-1 text-xs">
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
                className="w-full accent-amber-600 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-muted mb-1 text-xs">
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
                className="w-full accent-amber-600 h-2 rounded-lg cursor-pointer"
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
