'use me';
'use client';

interface MultiPanelCanvasPreviewProps {
  imageUrl: string;
  panelCount?: number;
  alt?: string;
  className?: string;
  isPreRendered?: boolean;
}

export function MultiPanelCanvasPreview({
  imageUrl,
  panelCount = 1,
  alt = 'Canvas Wall Art',
  className = '',
  isPreRendered = false,
}: MultiPanelCanvasPreviewProps) {
  // If panel count is 1 or pre-rendered photo, render full canvas wrap
  if (panelCount <= 1 || isPreRendered || imageUrl.includes('shiva-parvati-5panel')) {
    return (
      <div className={`relative h-full w-full overflow-hidden bg-neutral-950/20 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* 3D Canvas Edges & Drop Shadow */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_12px_rgba(0,0,0,0.3)]" />
      </div>
    );
  }

  // Generate staggered heights per panel count
  const panelConfigs: Record<number, { heightPct: number; posPct: number }[]> = {
    2: [
      { heightPct: 100, posPct: 0 },
      { heightPct: 100, posPct: 100 },
    ],
    3: [
      { heightPct: 92, posPct: 0 },
      { heightPct: 100, posPct: 50 },
      { heightPct: 92, posPct: 100 },
    ],
    4: [
      { heightPct: 88, posPct: 0 },
      { heightPct: 100, posPct: 33.3 },
      { heightPct: 100, posPct: 66.6 },
      { heightPct: 88, posPct: 100 },
    ],
    5: [
      { heightPct: 68, posPct: 0 },
      { heightPct: 85, posPct: 25 },
      { heightPct: 100, posPct: 50 },
      { heightPct: 85, posPct: 75 },
      { heightPct: 68, posPct: 100 },
    ],
    6: [
      { heightPct: 70, posPct: 0 },
      { heightPct: 85, posPct: 20 },
      { heightPct: 100, posPct: 40 },
      { heightPct: 100, posPct: 60 },
      { heightPct: 85, posPct: 80 },
      { heightPct: 70, posPct: 100 },
    ],
    7: [
      { heightPct: 64, posPct: 0 },
      { heightPct: 76, posPct: 16.6 },
      { heightPct: 88, posPct: 33.3 },
      { heightPct: 100, posPct: 50 },
      { heightPct: 88, posPct: 66.6 },
      { heightPct: 76, posPct: 83.3 },
      { heightPct: 64, posPct: 100 },
    ],
  };

  const currentPanels = panelConfigs[panelCount] || panelConfigs[5];
  const bgSizePct = panelCount * 100;

  return (
    <div className={`relative flex h-full w-full items-center justify-center gap-1.5 p-2 bg-gradient-to-b from-neutral-900/10 via-neutral-900/5 to-neutral-950/20 backdrop-blur-sm overflow-hidden ${className}`}>
      {currentPanels.map((p, idx) => (
        <div
          key={idx}
          style={{ height: `${p.heightPct}%` }}
          className="relative flex-1 rounded-sm shadow-[0_8px_20px_rgba(0,0,0,0.45)] border-r-2 border-b-2 border-black/30 overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]"
        >
          <div
            className="h-full w-full bg-no-repeat bg-cover"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundPosition: `${p.posPct}% center`,
              backgroundSize: `${bgSizePct}% 100%`,
            }}
          />
          {/* Subtle inner canvas bevel overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-black/30" />
        </div>
      ))}
    </div>
  );
}
