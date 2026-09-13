import { getSettings } from '@/lib/content';
import { ContactForm } from '@/components/shop/ContactForm';

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold">Contact Us</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="space-y-3 text-sm">
          {settings.address && <p>{settings.address}</p>}
          {settings.phone && <p>Phone: {settings.phone}</p>}
          {settings.whatsapp_number && (
            <p id="whatsapp">
              WhatsApp:{' '}
              <a
                href={`https://wa.me/${settings.whatsapp_number.replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-yellow underline"
              >
                {settings.whatsapp_number}
              </a>
            </p>
          )}
          {settings.email && <p>Email: {settings.email}</p>}
          {settings.opening_hours && <p>Hours: {settings.opening_hours}</p>}

          {settings.google_maps_embed && (
            <div
              className="mt-4 aspect-video w-full overflow-hidden rounded-card"
              dangerouslySetInnerHTML={{ __html: settings.google_maps_embed }}
            />
          )}
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
