import type { HomepageSection } from '@/lib/types';

interface StepItem {
  title: string;
  description: string;
}

export function HowItWorks({ section }: { section: HomepageSection }) {
  const steps = (section.settings?.steps as StepItem[] | undefined) ?? [];
  if (steps.length === 0) return null;

  return (
    <section className="bg-surface py-14">
      <div className="container-page">
        {section.title && (
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            {section.title}
          </h2>
        )}

        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={i} className="rounded-card bg-bg p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-yellow text-sm font-semibold text-[color:var(--color-accent-yellow-contrast)]">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
