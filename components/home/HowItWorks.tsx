import type { HomepageSection } from '@/lib/types';

interface StepItem {
  title: string;
  description: string;
}

const DEFAULT_STEPS: StepItem[] = [
  {
    title: 'Upload Photo or Pick Artwork',
    description: 'Select your photo or pick graphic artwork in our Custom Canvas or T-Shirt Builder.',
  },
  {
    title: 'Live Preview & Customize',
    description: 'Customize sizes, 1/3/5 panel splits, frames, colors, and see instant live previews.',
  },
  {
    title: 'Handcrafted HD Printing',
    description: 'Our master craftsmen print HD archival canvas and hand-stretch onto pine wood frames.',
  },
  {
    title: 'Express Doorstep Delivery',
    description: 'Receive your safely packed decor product at your doorstep in Kathmandu or across Nepal.',
  },
];

export function HowItWorks({ section }: { section: HomepageSection }) {
  const steps = (section.settings?.steps as StepItem[] | undefined) ?? DEFAULT_STEPS;

  return (
    <section className="bg-surface py-16 border-t border-border" id="how-it-works">
      <div className="container-page">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
            {section.title || 'How Easy It Works'}
          </h2>
          <p className="text-muted text-xs sm:text-sm">
            {section.subtitle || 'Simple 4-step process from custom live design to doorstep delivery.'}
          </p>
        </div>

        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li
              key={i}
              className="rounded-2xl border border-border bg-bg p-6 shadow-sm card-hover flex flex-col justify-between"
            >
              <div>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-white font-bold text-sm shadow-sm mb-4">
                  {i + 1}
                </span>
                <h3 className="font-bold text-base text-text">{step.title}</h3>
                <p className="mt-2 text-xs text-muted leading-relaxed">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

