'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface RealisticCanvas3DProps {
  imageUrl: string;
  panelCount?: number;
  aspectRatio?: number; // width / height
  depthMm?: number; // 20mm, 35mm etc
  frameName?: string;
  className?: string;
}

const ROOM_BACKGROUNDS = [
  {
    id: 'living',
    name: '🛋️ Living Room',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80',
    wallBrightness: 0.85,
  },
  {
    id: 'bedroom',
    name: '🛏️ Cozy Bedroom',
    url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=80',
    wallBrightness: 0.82,
  },
  {
    id: 'office',
    name: '💼 Modern Office',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
    wallBrightness: 0.9,
  },
  {
    id: 'studio',
    name: '🎨 Neutral Wall',
    url: '',
    wallBrightness: 1,
  },
];

type WrapStyle = 'mirror' | 'black' | 'white';

export function RealisticCanvas3D({
  imageUrl,
  panelCount = 1,
  aspectRatio = 1.5,
  depthMm = 30,
  frameName,
  className = '',
}: RealisticCanvas3DProps) {
  // 3D Rotation State
  const [rotX, setRotX] = useState<number>(8);
  const [rotY, setRotY] = useState<number>(-24);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [wrapStyle, setWrapStyle] = useState<WrapStyle>('mirror');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('living');
  const [showTexture, setShowTexture] = useState<boolean>(true);
  const [depthPx, setDepthPx] = useState<number>(24); // depth extrusion in px
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Mouse / Touch Drag state
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-spin turntable loop
  useEffect(() => {
    if (!isAutoSpin) return;
    const interval = setInterval(() => {
      setRotY((prev) => {
        const next = prev + 0.4;
        return next > 45 ? -45 : next;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [isAutoSpin]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setIsAutoSpin(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRotY((prev) => Math.max(-55, Math.min(55, prev + deltaX * 0.35)));
    setRotX((prev) => Math.max(-35, Math.min(35, prev - deltaY * 0.35)));
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Touch drag handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setIsAutoSpin(false);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - lastMousePos.current.x;
    const deltaY = e.touches[0].clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    setRotY((prev) => Math.max(-55, Math.min(55, prev + deltaX * 0.35)));
    setRotX((prev) => Math.max(-35, Math.min(35, prev - deltaY * 0.35)));
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  // 3D Camera Presets
  function applyPreset(preset: 'front' | 'isometric-left' | 'isometric-right' | 'top') {
    setIsAutoSpin(false);
    switch (preset) {
      case 'front':
        setRotX(0);
        setRotY(0);
        break;
      case 'isometric-left':
        setRotX(8);
        setRotY(26);
        break;
      case 'isometric-right':
        setRotX(8);
        setRotY(-26);
        break;
      case 'top':
        setRotX(24);
        setRotY(0);
        break;
    }
  }

  // Panel height ratios for staggered layouts
  const heightRatios: number[] = (() => {
    if (panelCount === 3) return [0.9, 1.0, 0.9];
    if (panelCount === 5) return [0.72, 0.88, 1.0, 0.88, 0.72];
    if (panelCount === 7) return [0.65, 0.78, 0.9, 1.0, 0.9, 0.78, 0.65];
    return Array(panelCount).fill(1.0);
  })();

  const currentRoom = ROOM_BACKGROUNDS.find((r) => r.id === selectedRoomId) || ROOM_BACKGROUNDS[0];

  // Dynamic shadow calculation based on rotation
  const shadowX = -Math.round(rotY * 0.8);
  const shadowY = Math.round(rotX * 0.8 + 16);
  const shadowBlur = Math.round(Math.abs(rotY) * 0.6 + 24);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-border bg-neutral-950 flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : className
      }`}
    >
      {/* 3D Top Header Bar with Mode Presets */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 bg-neutral-900/90 backdrop-blur-md border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-extrabold uppercase tracking-wider text-[11px] border border-amber-500/30">
            <span>🧊</span>
            <span>Realistic 3D Canvas</span>
          </span>
          <span className="hidden sm:inline text-white/50 text-[11px]">
            Drag anywhere to rotate in 3D space
          </span>
        </div>

        {/* Quick Camera Presets */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset('front')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
              rotX === 0 && rotY === 0
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
            }`}
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => applyPreset('isometric-right')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
              rotY < -10
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
            }`}
          >
            3D Right
          </button>
          <button
            type="button"
            onClick={() => applyPreset('isometric-left')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
              rotY > 10
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
            }`}
          >
            3D Left
          </button>
          <button
            type="button"
            onClick={() => setIsAutoSpin((v) => !v)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all flex items-center gap-1 ${
              isAutoSpin
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
            }`}
            title="Auto-rotate turntable"
          >
            <span>↻</span>
            <span className="hidden md:inline">{isAutoSpin ? 'Spinning' : 'Auto-Spin'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen((f) => !f)}
            className="p-1 rounded-lg border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
          >
            {isFullscreen ? '✕' : '⛶'}
          </button>
        </div>
      </div>

      {/* Main 3D Viewport Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full flex-1 min-h-[380px] sm:min-h-[460px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{
          perspective: '1300px',
        }}
      >
        {/* Room Background Mockup */}
        {currentRoom.url ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-500 pointer-events-none"
            style={{
              backgroundImage: `url(${currentRoom.url})`,
              filter: `brightness(${currentRoom.wallBrightness})`,
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 pointer-events-none" />
        )}

        {/* Ambient Room Lighting Vignette */}
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-60" />

        {/* Unified 3D Stage Rotating Container */}
        <div
          className="relative z-10 flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            filter: `drop-shadow(${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, 0.65))`,
          }}
        >
          {/* Multi-Panel Cluster in 3D */}
          <div
            className="flex items-center justify-center gap-2 sm:gap-3.5"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {Array.from({ length: panelCount }).map((_, i) => {
              const hRatio = heightRatios[i] ?? 1.0;
              const baseHeightPx = 280;
              const panelHeightPx = Math.round(baseHeightPx * hRatio);
              const totalW = Math.round(baseHeightPx * aspectRatio);
              const panelWidthPx = Math.max(48, Math.round((totalW - (panelCount - 1) * 12) / panelCount));
              const posPercent = panelCount === 1 ? 50 : (i / (panelCount - 1)) * 100;

              return (
                <div
                  key={`3d-panel-${i}`}
                  className="relative group transition-transform"
                  style={{
                    width: panelWidthPx,
                    height: panelHeightPx,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* FRONT FACE (Main Printed Image) */}
                  <div
                    className="absolute inset-0 overflow-hidden rounded-xs border border-white/10"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: `translateZ(${depthPx / 2}px)`,
                      backgroundImage: `url(${imageUrl})`,
                      backgroundPosition: `${posPercent}% center`,
                      backgroundSize: `${panelCount * 100}% 100%`,
                      boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    {/* Realistic Cotton Canvas Weave Texture Overlay */}
                    {showTexture && (
                      <div
                        className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
                        style={{
                          backgroundImage: `radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.3) 1px, transparent 1px)`,
                          backgroundSize: '4px 4px',
                          backgroundPosition: '0 0, 2px 2px',
                        }}
                      />
                    )}

                    {/* Dynamic Specular Light Reflection Sheen */}
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                      style={{
                        background: `linear-gradient(${120 + rotY * 1.2}deg, rgba(255,255,255,${
                          Math.max(0, 0.25 + rotY * 0.005)
                        }) 0%, transparent 60%)`,
                      }}
                    />

                    {/* Frame Accent Border if selected */}
                    {frameName && frameName.toLowerCase().includes('black') && (
                      <div className="absolute inset-0 border-4 border-neutral-900 pointer-events-none shadow-md" />
                    )}
                    {frameName && frameName.toLowerCase().includes('gold') && (
                      <div className="absolute inset-0 border-4 border-amber-500/80 pointer-events-none shadow-md" />
                    )}
                    {frameName && frameName.toLowerCase().includes('wood') && (
                      <div className="absolute inset-0 border-4 border-amber-800 pointer-events-none shadow-md" />
                    )}
                  </div>

                  {/* RIGHT 3D SIDE FACE (Gallery Wrapped Edge) */}
                  <div
                    className="absolute top-0 bottom-0 overflow-hidden"
                    style={{
                      width: depthPx,
                      right: 0,
                      transformOrigin: 'right center',
                      transform: `rotateY(90deg) translateZ(0px)`,
                      backgroundColor: wrapStyle === 'black' ? '#18181b' : wrapStyle === 'white' ? '#f4f4f5' : '#27272a',
                      backgroundImage:
                        wrapStyle === 'mirror'
                          ? `url(${imageUrl})`
                          : undefined,
                      backgroundPosition: `${posPercent}% center`,
                      backgroundSize: `${panelCount * 100}% 100%`,
                      filter: 'brightness(0.65) contrast(1.1)',
                      boxShadow: 'inset 0 0 8px rgba(0,0,0,0.6)',
                    }}
                  />

                  {/* LEFT 3D SIDE FACE (Gallery Wrapped Edge) */}
                  <div
                    className="absolute top-0 bottom-0 overflow-hidden"
                    style={{
                      width: depthPx,
                      left: 0,
                      transformOrigin: 'left center',
                      transform: `rotateY(-90deg) translateZ(0px)`,
                      backgroundColor: wrapStyle === 'black' ? '#18181b' : wrapStyle === 'white' ? '#f4f4f5' : '#27272a',
                      backgroundImage:
                        wrapStyle === 'mirror'
                          ? `url(${imageUrl})`
                          : undefined,
                      backgroundPosition: `${posPercent}% center`,
                      backgroundSize: `${panelCount * 100}% 100%`,
                      filter: 'brightness(0.85)',
                      boxShadow: 'inset 0 0 8px rgba(0,0,0,0.4)',
                    }}
                  />

                  {/* TOP 3D EDGE FACE */}
                  <div
                    className="absolute left-0 right-0 overflow-hidden"
                    style={{
                      height: depthPx,
                      top: 0,
                      transformOrigin: 'center top',
                      transform: `rotateX(-90deg) translateZ(0px)`,
                      backgroundColor: wrapStyle === 'black' ? '#18181b' : wrapStyle === 'white' ? '#fafafa' : '#3f3f46',
                      backgroundImage:
                        wrapStyle === 'mirror'
                          ? `url(${imageUrl})`
                          : undefined,
                      backgroundPosition: `${posPercent}% top`,
                      backgroundSize: `${panelCount * 100}% 100%`,
                      filter: 'brightness(0.95)',
                      boxShadow: 'inset 0 0 6px rgba(0,0,0,0.3)',
                    }}
                  />

                  {/* BOTTOM 3D EDGE FACE */}
                  <div
                    className="absolute left-0 right-0 overflow-hidden"
                    style={{
                      height: depthPx,
                      bottom: 0,
                      transformOrigin: 'center bottom',
                      transform: `rotateX(90deg) translateZ(0px)`,
                      backgroundColor: wrapStyle === 'black' ? '#18181b' : wrapStyle === 'white' ? '#e4e4e7' : '#18181b',
                      backgroundImage:
                        wrapStyle === 'mirror'
                          ? `url(${imageUrl})`
                          : undefined,
                      backgroundPosition: `${posPercent}% bottom`,
                      backgroundSize: `${panelCount * 100}% 100%`,
                      filter: 'brightness(0.4)',
                      boxShadow: 'inset 0 0 8px rgba(0,0,0,0.7)',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Drag Hint Pill */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-20">
          <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white/90 bg-black/60 backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-1.5 animate-pulse">
            <span>🖐️</span>
            <span>Drag horizontally or vertically to inspect 3D wrap</span>
          </span>
        </div>
      </div>

      {/* 3D Customization Toolbar Controls */}
      <div className="p-3 sm:p-4 bg-neutral-900 border-t border-white/10 space-y-3 text-xs text-white">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          {/* Room Selector */}
          <div>
            <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider block mb-1">
              Wall Mockup Room
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ROOM_BACKGROUNDS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRoomId(r.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedRoomId === r.id
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Edge Gallery Wrap Style */}
          <div>
            <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider block mb-1">
              Edge Wrap Finish
            </label>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setWrapStyle('mirror')}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all text-center ${
                  wrapStyle === 'mirror'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                Mirror Wrap
              </button>
              <button
                type="button"
                onClick={() => setWrapStyle('black')}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all text-center ${
                  wrapStyle === 'black'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                Black Edge
              </button>
              <button
                type="button"
                onClick={() => setWrapStyle('white')}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all text-center ${
                  wrapStyle === 'white'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                White Edge
              </button>
            </div>
          </div>

          {/* Stretcher Bar Depth Slider */}
          <div>
            <div className="flex justify-between items-center text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1">
              <span>Pine Wood Depth</span>
              <span className="text-amber-400 font-mono">
                {depthPx <= 18 ? '0.75" Slim' : depthPx <= 28 ? '1.25" Gallery' : '1.75" Museum'}
              </span>
            </div>
            <input
              type="range"
              min={14}
              max={40}
              value={depthPx}
              onChange={(e) => setDepthPx(parseInt(e.target.value))}
              className="w-full accent-amber-500 h-1.5 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Additional Toggle Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] text-white/70">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showTexture}
                onChange={(e) => setShowTexture(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span>Canvas Fabric Weave Texture</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white/40">Angles:</span>
            <span className="font-mono text-amber-400 text-[10px]">
              Y: {Math.round(rotY)}° | X: {Math.round(rotX)}°
            </span>
            <button
              type="button"
              onClick={() => {
                setRotX(8);
                setRotY(-24);
                setIsAutoSpin(false);
              }}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[10px]"
            >
              Reset 3D
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
