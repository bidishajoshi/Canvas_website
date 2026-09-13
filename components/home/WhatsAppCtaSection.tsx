import { getSettings } from '@/lib/content';
import type { HomepageSection } from '@/lib/types';

export async function WhatsAppCtaSection({ section }: { section: HomepageSection }) {
  const settings = await getSettings();
  if (!settings.whatsapp_number) return null;

  const digitsOnly = settings.whatsapp_number.replace(/[^\d]/g, '');
  const message = encodeURIComponent(
    `Hello ${settings.business_name}, I'd like to know more about your canvases.`
  );

  return (
    <section className="bg-accent-yellow/15">
      <div className="container-page flex flex-col items-center gap-3 py-12 text-center">
        {section.title && (
          <h2 className="font-display text-2xl font-semibold">{section.title}</h2>
        )}
        {section.subtitle && <p className="text-muted">{section.subtitle}</p>}
        <a
          href={`https://wa.me/${digitsOnly}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 rounded-card bg-[#25D366] px-6 py-3 text-sm font-semibold text-white"
        >
          {section.cta_label ?? 'Chat on WhatsApp'}
        </a>
      </div>
    </section>
  );
}
