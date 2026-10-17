import Link from 'next/link';

const CRAFT_FEATURES = [
  {
    icon: '🎨',
    title: '380 GSM Heavy Cotton Canvas',
    description: 'Museum-grade woven cotton with rich canvas texture. Unlike cheap plastic polyester flex, our canvas never sags or wrinkles over time.',
    tag: 'Archival Quality',
  },
  {
    icon: '🪵',
    title: 'Kiln-Dried Pine Wood Frames',
    description: '1.25" deep solid pine wood stretchers sourced and milled to withstand Nepal’s changing weather and humidity without warping.',
    tag: '100% Solid Wood',
  },
  {
    icon: '✨',
    title: '12-Color Archival UV Inks',
    description: 'State-of-the-art pigment technology delivering deep blacks, lifelike skin tones, and 100+ year fade-resistance under indoor light.',
    tag: 'Fade-Proof Guarantee',
  },
  {
    icon: '📐',
    title: 'Hand-Stretched with Drum Tension',
    description: 'Every panel is hand-stretched and wrapped with precision tight corners by skilled Nepalese artisans for a flawless gallery finish.',
    tag: 'Artisan Crafted',
  },
  {
    icon: '🔨',
    title: 'Ready to Hang in 2 Minutes',
    description: 'Pre-installed brass sawtooth hangers and wall-friendly rubber bumpers. No need to drill complex frames — just hang and enjoy.',
    tag: 'Hardware Included',
  },
  {
    icon: '📦',
    title: 'Shockproof 3-Layer Packaging',
    description: 'Heavy duty bubble wrap, rigid corner protectors, and corrugated outer boxes ensure safe transit across all 77 districts of Nepal.',
    tag: 'Transit Guarantee',
  },
];

export function CraftsmanshipShowcase() {
  return (
    <section className="container-page py-16 border-t border-border">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-600 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          The Affordable Decoration Standard
        </span>
        <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-text">
          Museum-Grade Quality Built to Last Generations
        </h2>
        <p className="text-sm text-muted">
          We don&apos;t just print photos — we craft timeless art pieces. Here is why homes, interior designers, and offices across Nepal trust us.
        </p>
      </div>

      {/* Grid of features */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CRAFT_FEATURES.map((feat) => (
          <div
            key={feat.title}
            className="group relative rounded-2xl border border-border bg-surface p-6 hover:border-amber-600/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl p-2.5 rounded-xl bg-surface-hover border border-border/80 inline-block">
                  {feat.icon}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {feat.tag}
                </span>
              </div>
              <h3 className="font-display font-bold text-base sm:text-lg text-text group-hover:text-amber-600 transition-colors">
                {feat.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
                {feat.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/50 flex items-center text-xs font-semibold text-amber-600">
              <span>Verified Specification</span>
              <span className="ml-1 text-[11px]">✓</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom guarantee strip */}
      <div className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <h4 className="font-bold text-sm sm:text-base text-text">
            🛡️ 100% Quality &amp; Damage-Free Transit Guarantee
          </h4>
          <p className="text-xs text-muted max-w-xl">
            If your custom canvas arrives with any defect or shipping damage, we will reprint and replace it immediately with zero extra charge.
          </p>
        </div>

        <Link
          href="/custom-canvas"
          className="shrink-0 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 whitespace-nowrap"
        >
          Create Custom Canvas Now →
        </Link>
      </div>
    </section>
  );
}
