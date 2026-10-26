'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';

export type EdgeWrapStyle = 'image_wrap' | 'mirror_wrap' | 'black' | 'white' | 'wood';
export type StretcherDepth = 'slim' | 'standard' | 'deep';
export type CanvasTexture = 'smooth' | 'cotton' | 'linen';
export type LightingMode = 'daylight' | 'warm' | 'spotlight';

export interface Realistic3DCanvasViewerProps {
  imageUrl: string;
  panelCount: number;
  aspectRatio: number;
  frameName?: string | null;
  wallBackground?: string | null;
  customText?: string | null;
  onWrapStyleChange?: (style: EdgeWrapStyle) => void;
  onDepthChange?: (depth: StretcherDepth) => void;
}

const STRETCHER_DEPTH_PX: Record<StretcherDepth, number> = {
  slim: 20, // 0.75"
  standard: 34, // 1.25"
  deep: 48, // 1.75"
};

const STRETCHER_LABELS: Record<StretcherDepth, string> = {
  slim: '0.75" Slim Stretcher',
  standard: '1.25" Gallery Standard',
  deep: '1.75" Museum Chunky',
};

const CAMERA_PRESETS = [
  { label: 'Front', rotX: 0, rotY: 0, icon: '🖼️' },
  { label: '3D Angle', rotX: -14, rotY: 26, icon: '📐' },
  { label: 'Left Edge', rotX: -4, rotY: -38, icon: '👈' },
  { label: 'Right Edge', rotX: -4, rotY: 38, icon: '👉' },
  { label: 'Top-Down', rotX: 28, rotY: 12, icon: '🔝' },
];

const WALL_BACKGROUNDS = [
  { id: 'studio', name: 'Studio Neutral', cssClass: 'bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-300 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-950' },
  { id: 'warm', name: 'Warm Cream', cssClass: 'bg-[#f4efe6] dark:bg-[#1a1714]' },
  { id: 'slate', name: 'Gallery Slate', cssClass: 'bg-[#2b303a]' },
  { id: 'brick', name: 'Loft White Brick', cssClass: 'bg-[#eae8e4] dark:bg-[#16181b]' },
];

export function Realistic3DCanvasViewer({
  imageUrl,
  panelCount,
  aspectRatio,
  frameName,
  wallBackground,
  customText,
  onWrapStyleChange,
  onDepthChange,
}: Realistic3DCanvasViewerProps) {
  // 3D Rotation angles (degrees)
  const [rotX, setRotX] = useState<number>(-12);
  const [rotY, setRotY] = useState<number>(22);
  const [zoom3D, setZoom3D] = useState<number>(1);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; startRotX: number; startRotY: number }>({
    x: 0,
    y: 0,
    startRotX: -12,
    startRotY: 22,
  });

  // 3D Canvas physical attributes
  const [wrapStyle, setWrapStyle] = useState<EdgeWrapStyle>('image_wrap');
  const [depth, setDepth] = useState<StretcherDepth>('standard');
  const [texture, setTexture] = useState<CanvasTexture>('cotton');
  const [lighting, setLighting] = useState<LightingMode>('daylight');
  const [activeWall, setActiveWall] = useState<string>('studio');
  const [showWireframe, setShowWireframe] = useState<boolean>(false);

  // Auto-spin turntable loop
  useEffect(() => {
    if (!isAutoSpin) return;
    const interval = setInterval(() => {
      setRotY((prev) => (prev + 0.8) % 360);
    }, 25);
    return () => clearInterval(interval);
  }, [isAutoSpin]);

  // Mouse & Touch Drag Handlers for 3D Orbit
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setIsAutoSpin(false); // Pause auto-spin on user interaction
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startRotX: rotX,
      startRotY: rotY,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    // Sensible damping for responsive rotation
    const newRotY = dragStartRef.current.startRotY + deltaX * 0.45;
    const newRotX = Math.max(-50, Math.min(50, dragStartRef.current.startRotX - deltaY * 0.45));

    setRotX(Number(newRotX.toFixed(1)));
    setRotY(Number(newRotY.toFixed(1)));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  // Dimensions computation
  const containerWidth = 560;
  const containerHeight = Math.round(containerWidth / Math.max(aspectRatio, 0.4));
  const depthPx = STRETCHER_DEPTH_PX[depth];

  // Staggered panel heights
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

  const gapPx = panelCount > 1 ? 16 : 0;
  const totalGaps = gapPx * (panelCount - 1);
  const panelWidth = Math.round((containerWidth - totalGaps) / panelCount);

  // Floating frame specs
  const hasFrame = frameName && !frameName.toLowerCase().includes('no frame') && !frameName.toLowerCase().includes('unframed');
  const frameColor = useMemo(() => {
    if (!hasFrame || !frameName) return null;
    const l = frameName.toLowerCase();
    if (l.includes('black')) return '#18181b';
    if (l.includes('white')) return '#f8fafc';
    if (l.includes('gold')) return '#d97706';
    if (l.includes('wood') || l.includes('natural')) return '#78350f';
    return '#18181b';
  }, [hasFrame, frameName]);

  // Lighting classes & filters
  const lightingStyle = useMemo(() => {
    if (lighting === 'warm') {
      return {
        ambient: 'from-amber-500/10 via-transparent to-black/20',
        filter: 'sepia(18%) saturate(115%) contrast(102%)',
        shadowColor: 'rgba(50, 30, 10, 0.45)',
      };
    }
    if (lighting === 'spotlight') {
      return {
        ambient: 'from-white/30 via-transparent to-black/40',
        filter: 'contrast(112%) brightness(103%)',
        shadowColor: 'rgba(0, 0, 0, 0.55)',
      };
    }
    return {
      ambient: 'from-white/10 via-transparent to-black/15',
      filter: 'none',
      shadowColor: 'rgba(0, 0, 0, 0.35)',
    };
  }, [lighting]);

  // Canvas texture overlay
  const textureOverlay = useMemo(() => {
    if (texture === 'cotton') {
      return 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 1px, transparent 1px) 0 0 / 4px 4px';
    }
    if (texture === 'linen') {
      return 'linear-gradient(45deg, rgba(0,0,0,0.04) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.04) 25%, transparent 25%) 0 0 / 6px 6px';
    }
    return 'none';
  }, [texture]);

  return (
    <div className="space-y-4">
      {/* 3D Visualizer Viewport */}
      <div
        className={`relative w-full rounded-2xl border border-border overflow-hidden select-none touch-none transition-colors duration-300 ${
          WALL_BACKGROUNDS.find((w) => w.id === activeWall)?.cssClass || 'bg-surface'
        }`}
        style={{ minHeight: '440px' }}
      >
        {/* Wall Background Image if provided */}
        {wallBackground && (
          <img
            src={wallBackground}
            alt="Wall Background"
            className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
          />
        )}

        {/* Ambient Overhead Gallery Spotlights */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/25 via-transparent to-black/20" />

        {/* Interactive 3D Canvas Stage */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative w-full h-[460px] sm:h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ perspective: '1100px' }}
        >
          {/* 3D Transform Pivot Group */}
          <div
            className="relative transition-transform duration-75 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: `scale(${zoom3D}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
              width: containerWidth,
              height: containerHeight,
            }}
          >
            {/* Soft Ambient Wall Shadow behind 3D Assembly */}
            <div
              className="absolute inset-0 pointer-events-none rounded-xl transition-all duration-150"
              style={{
                transform: `translateZ(-${depthPx + 15}px) translate(${rotY * -0.6}px, ${Math.abs(rotX) * 0.5 + 20}px)`,
                backgroundColor: lightingStyle.shadowColor,
                filter: 'blur(26px)',
                opacity: 0.8,
              }}
            />

            {/* Render Multi-Panel or Single 3D Canvas Blocks */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ gap: `${gapPx}px`, transformStyle: 'preserve-3d' }}
            >
              {Array.from({ length: panelCount }).map((_, i) => {
                const hRatio = heightRatios[i] || 1.0;
                const pHeight = Math.round(containerHeight * hRatio);
                const halfDepth = depthPx / 2;

                // Slice position of image for continuous multi-panel mapping
                const sliceLeftPct = (i / panelCount) * 100;
                const sliceWidthPct = panelCount * 100;

                return (
                  <div
                    key={`panel-3d-${i}`}
                    className="relative shrink-0"
                    style={{
                      width: `${panelWidth}px`,
                      height: `${pHeight}px`,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {/* Optional 3D Floating Outer Frame */}
                    {hasFrame && frameColor && (
                      <div
                        className="absolute -inset-2.5 rounded-sm pointer-events-none"
                        style={{
                          transform: `translateZ(-${depthPx / 2 + 6}px)`,
                          border: `6px solid ${frameColor}`,
                          boxShadow: `0 10px 25px rgba(0,0,0,0.5)`,
                        }}
                      />
                    )}

                    {/* 1. FRONT FACE (The Main Photo Canvas) */}
                    <div
                      className="absolute inset-0 overflow-hidden rounded-[2px]"
                      style={{
                        transform: `translateZ(${halfDepth}px)`,
                        transformStyle: 'preserve-3d',
                        filter: lightingStyle.filter,
                        boxShadow: showWireframe ? '0 0 0 1px #f59e0b' : 'none',
                      }}
                    >
                      {/* Image slice */}
                      <div
                        className="absolute inset-0 bg-cover bg-no-repeat"
                        style={{
                          backgroundImage: `url(${imageUrl})`,
                          backgroundPosition: `${sliceLeftPct}% 50%`,
                          backgroundSize: `${sliceWidthPct}% 100%`,
                        }}
                      />

                      {/* Canvas Fabric Weave Texture Overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
                        style={{ backgroundImage: textureOverlay }}
                      />

                      {/* Directional Specular Sheen (Shifts with 3D angle) */}
                      <div
                        className="absolute inset-0 pointer-events-none transition-opacity"
                        style={{
                          background: `linear-gradient(${120 + rotY}deg, rgba(255,255,255,0.2) 0%, transparent 60%)`,
                        }}
                      />

                      {/* Optional Custom Text Overlay */}
                      {customText && (
                        <div className="absolute bottom-4 inset-x-2 text-center pointer-events-none">
                          <span className="font-display italic text-amber-300 font-bold text-xs sm:text-sm drop-shadow-md">
                            &quot;{customText}&quot;
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 2. LEFT SIDE FACE (Extruded Thickness) */}
                    <div
                      className="absolute top-0 bottom-0 overflow-hidden"
                      style={{
                        width: `${depthPx}px`,
                        left: `-${halfDepth}px`,
                        transform: `rotateY(-90deg)`,
                        transformOrigin: 'center center',
                        backgroundColor: wrapStyle === 'black' ? '#18181b' : wrapStyle === 'white' ? '#f8fafc' : wrapStyle === 'wood' ? '#854d0e' : '#262626',
                        filter: 'brightness(0.68)',
                      }}
                    >
                      {wrapStyle === 'image_wrap' || wrapStyle === 'mirror_wrap' ? (
                        <div
                          className="w-full h-full bg-cover"
                          style={{
                            backgroundImage: `url(${imageUrl})`,
                            backgroundPosition: `${Math.max(0, sliceLeftPct - 5)}% 50%`,
                            backgroundSize: `${sliceWidthPct * 1.2}% 100%`,
                            transform: wrapStyle === 'mirror_wrap' ? 'scaleX(-1)' : 'none',
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-black/35 pointer-events-none" />
                    </div>

                    {/* 3. RIGHT SIDE FACE (Extruded Thickness) */}
                    <div
                      className="absolute top-0 bottom-0 overflow-hidden"
                      style={{
                        width: `${depthPx}px`,
                        right: `-${halfDepth}px`,
                        transform: `rotateY(90deg)`,
                        transformOrigin: 'center center',
                        backgroundColor: wrapStyle === 'black' ? '#18181b' : wrapStyle === 'white' ? '#f8fafc' : wrapStyle === 'wood' ? '#854d0e' : '#262626',
                        filter: 'brightness(0.85)',
                      }}
                    >
                      {wrapStyle === 'image_wrap' || wrapStyle === 'mirror_wrap' ? (
                        <div
                          className="w-full h-full bg-cover"
                          style={{
                            backgroundImage: `url(${imageUrl})`,
                            backgroundPosition: `${Math.min(100, sliceLeftPct + 10)}% 50%`,
                            backgroundSize: `${sliceWidthPct * 1.2}% 100%`,
                            transform: wrapStyle === 'mirror_wrap' ? 'scaleX(-1)' : 'none',
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 pointer-events-none" />
                    </div>

                    {/* 4. TOP EDGE FACE (Extruded Thickness) */}
                    <div
                      className="absolute left-0 right-0 overflow-hidden"
                      style={{
                        height: `${depthPx}px`,
                        top: `-${halfDepth}px`,
                        transform: `rotateX(90deg)`,
                        transformOrigin: 'center center',
                        backgroundColor: wrapStyle === 'black' ? '#18181b' : wrapStyle === 'white' ? '#f8fafc' : wrapStyle === 'wood' ? '#854d0e' : '#262626',
                        filter: 'brightness(1.12)',
                      }}
                    >
                      {wrapStyle === 'image_wrap' || wrapStyle === 'mirror_wrap' ? (
                        <div
                          className="w-full h-full bg-cover"
                          style={{
                            backgroundImage: `url(${imageUrl})`,
                            backgroundPosition: `${sliceLeftPct}% 0%`,
                            backgroundSize: `${sliceWidthPct}% 400%`,
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-white/20 pointer-events-none" />
                    </div>

                    {/* 5. BOTTOM EDGE FACE (Extruded Thickness) */}
                    <div
                      className="absolute left-0 right-0 overflow-hidden"
                      style={{
                        height: `${depthPx}px`,
                        bottom: `-${halfDepth}px`,
                        transform: `rotateX(-90deg)`,
                        transformOrigin: 'center center',
                        backgroundColor: wrapStyle === 'black' ? '#18181b' : wrapStyle === 'white' ? '#f8fafc' : wrapStyle === 'wood' ? '#854d0e' : '#262626',
                        filter: 'brightness(0.45)',
                      }}
                    >
                      {wrapStyle === 'image_wrap' || wrapStyle === 'mirror_wrap' ? (
                        <div
                          className="w-full h-full bg-cover"
                          style={{
                            backgroundImage: `url(${imageUrl})`,
                            backgroundPosition: `${sliceLeftPct}% 100%`,
                            backgroundSize: `${sliceWidthPct}% 400%`,
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3D Orbit Helper HUD Overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none z-10">
          <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/75 text-white backdrop-blur shadow-md flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive 3D Canvas Box</span>
          </span>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-mono text-white/80 bg-black/50 backdrop-blur">
            Tilt: {rotX}° • Rotate: {rotY}°
          </span>
        </div>

        {/* Quick 3D Camera Angles Floating Bar */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={() => setIsAutoSpin(!isAutoSpin)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1 ${
              isAutoSpin
                ? 'bg-amber-600 text-white shadow-amber-600/30'
                : 'bg-black/70 hover:bg-black text-white backdrop-blur'
            }`}
            title="Auto-Rotate 3D Turntable"
          >
            <span>{isAutoSpin ? '⏸' : '▶'}</span>
            <span className="hidden sm:inline">360° Auto Spin</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRotX(0);
              setRotY(0);
              setZoom3D(1);
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-black/70 hover:bg-black text-white backdrop-blur text-xs font-bold shadow-md active:scale-95"
            title="Reset to 2D Flat View"
          >
            ↺ Reset
          </button>
        </div>

        {/* Bottom Interactive Drag Hint */}
        <div className="absolute bottom-3 inset-x-0 flex items-center justify-center pointer-events-none z-10">
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold text-white/90 bg-black/60 backdrop-blur shadow-sm">
            👆 Drag with mouse or finger to rotate 3D canvas
          </span>
        </div>
      </div>

      {/* 3D Physical Customization Toolbar */}
      <div className="rounded-2xl border border-border bg-surface p-4 space-y-4 shadow-sm text-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🧊</span>
            <h4 className="font-bold text-sm text-text">3D Stretcher Frame &amp; Edge Specifications</h4>
          </div>
          <span className="text-[11px] font-bold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            {STRETCHER_LABELS[depth]}
          </span>
        </div>

        {/* 1. Camera Angle Presets */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2">
            Preset 3D Camera Angles
          </span>
          <div className="flex flex-wrap gap-2">
            {CAMERA_PRESETS.map((cam) => (
              <button
                key={cam.label}
                type="button"
                onClick={() => {
                  setRotX(cam.rotX);
                  setRotY(cam.rotY);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 ${
                  rotX === cam.rotX && rotY === cam.rotY
                    ? 'border-amber-600 bg-amber-500/10 text-amber-600 shadow-xs'
                    : 'border-border bg-bg hover:border-amber-600/50 text-text'
                }`}
              >
                <span>{cam.icon}</span>
                <span>{cam.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Edge Wrap Style */}
        <div className="pt-2 border-t border-border">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2">
            Gallery Edge Wrap Style (3D Folded Sides)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'image_wrap' as EdgeWrapStyle, label: 'Image Wrap', desc: 'Continuous photo wrap' },
              { id: 'mirror_wrap' as EdgeWrapStyle, label: 'Mirror Wrap', desc: 'Reflected photo edges' },
              { id: 'black' as EdgeWrapStyle, label: 'Black Edge', desc: 'Modern black border' },
              { id: 'white' as EdgeWrapStyle, label: 'White Edge', desc: 'Clean white gallery' },
              { id: 'wood' as EdgeWrapStyle, label: 'Pine Wood', desc: 'Natural wood stretcher' },
            ].map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => {
                  setWrapStyle(style.id);
                  onWrapStyleChange?.(style.id);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 ${
                  wrapStyle === style.id
                    ? 'border-amber-600 bg-amber-500/10 text-amber-600 font-bold shadow-xs'
                    : 'border-border bg-bg hover:border-text/30 text-text'
                }`}
              >
                <span className="font-bold text-xs block">{style.label}</span>
                <span className="text-[10px] text-muted block leading-tight mt-0.5">{style.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Stretcher Depth Thickness */}
        <div className="pt-2 border-t border-border">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2">
            Stretcher Wooden Depth Thickness
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'slim' as StretcherDepth, label: '0.75" Slim Depth', desc: 'Minimalist compact profile' },
              { id: 'standard' as StretcherDepth, label: '1.25" Gallery Standard', desc: 'Most popular for homes' },
              { id: 'deep' as StretcherDepth, label: '1.75" Museum Chunky', desc: 'Bold dramatic statement' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setDepth(d.id);
                  onDepthChange?.(d.id);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 ${
                  depth === d.id
                    ? 'border-amber-600 bg-amber-500/10 text-amber-600 font-bold shadow-xs'
                    : 'border-border bg-bg hover:border-text/30 text-text'
                }`}
              >
                <span className="font-bold text-xs block">{d.label}</span>
                <span className="text-[10px] text-muted block leading-tight mt-0.5">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Canvas Weave Texture & Lighting Ambience */}
        <div className="pt-2 border-t border-border grid sm:grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1.5">
              Canvas Fabric Texture
            </span>
            <div className="flex gap-2">
              {[
                { id: 'smooth' as CanvasTexture, label: 'Smooth' },
                { id: 'cotton' as CanvasTexture, label: 'Cotton Weave' },
                { id: 'linen' as CanvasTexture, label: 'Heavy Linen' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTexture(t.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-bold text-xs transition-all ${
                    texture === t.id
                      ? 'border-amber-600 bg-amber-500/10 text-amber-600'
                      : 'border-border bg-bg text-muted hover:text-text'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1.5">
              Room Lighting Ambience
            </span>
            <div className="flex gap-2">
              {[
                { id: 'daylight' as LightingMode, label: '☀️ Daylight' },
                { id: 'warm' as LightingMode, label: '🌅 Golden Hour' },
                { id: 'spotlight' as LightingMode, label: '💡 Spotlight' },
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLighting(l.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-bold text-xs transition-all ${
                    lighting === l.id
                      ? 'border-amber-600 bg-amber-500/10 text-amber-600'
                      : 'border-border bg-bg text-muted hover:text-text'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
