import { getSettings } from '@/lib/content';
import type { HomepageSection } from '@/lib/types';

export async function WhatsAppCtaSection({ section }: { section: HomepageSection }) {
  const settings = await getSettings();
  const whatsappNum = settings.whatsapp_number || '9779800000000';
  const digitsOnly = whatsappNum.replace(/[^\d]/g, '');
  const message = encodeURIComponent(
    `Hello ${settings.business_name}, I'd like to place a custom order or inquire about photo canvas sizes.`
  );

  return (
    <section className="bg-emerald-500/10 border-t border-emerald-500/20 py-14">
      <div className="container-page flex flex-col items-center gap-3 text-center max-w-xl mx-auto">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white text-2xl shadow-sm mb-1">
          💬
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
          {section.title || 'Need Custom Help or Instant Order?'}
        </h2>
        <p className="text-muted text-xs sm:text-sm">
          {section.subtitle ||
            'Our design consultants are live on WhatsApp to help you pick the best frame size, multi-panel split, or t-shirt print!'}
        </p>
        <a
          href={`https://wa.me/${digitsOnly}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] px-6 py-3.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
        >
          <span>💬</span>
          <span>{section.cta_label || 'Chat Live on WhatsApp'}</span>
        </a>
      </div>
    </section>
  );
}

