import type { HomepageSection } from '@/lib/types';

interface ReasonItem {
  title: string;
  description: string;
  icon?: string;
}

export function WhyChooseUs({ section }: { section: HomepageSection }) {
  const items = (section.settings?.items as ReasonItem[] | undefined) ?? [];
  if (items.length === 0) return null;

  return (
    <section className="container-page py-14">
      {section.title && (
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          {section.title}
        </h2>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <div key={i} className="rounded-card border border-border p-5">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
