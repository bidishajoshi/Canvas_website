import { getSettings } from '@/lib/content';
import { updateSettings } from './actions';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, YouTubeIcon } from '@/components/layout/SocialIcons';

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Store Settings &amp; Social Links</h1>
        <p className="text-xs text-muted mt-1">
          Configure store business info, contact numbers, and social media handles with live vector SVG logo previews.
        </p>
      </div>

      <form action={updateSettings} className="space-y-6">
        {/* Business Overview */}
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-600">Store Profile</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Business Name" name="business_name" defaultValue={settings.business_name} />
            <Field label="Tagline" name="tagline" defaultValue={settings.tagline ?? ''} />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Short Description</label>
            <textarea
              name="short_description"
              rows={2}
              defaultValue={settings.short_description ?? ''}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <Field label="Logo URL" name="logo_url" defaultValue={settings.logo_url ?? ''} />
        </div>

        {/* Contact Info */}
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-600">Contact &amp; Customer Support</h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Support Email" name="email" defaultValue={settings.email ?? ''} type="email" />
            <Field label="Phone Number" name="phone" defaultValue={settings.phone ?? ''} />
            <Field
              label="WhatsApp Number (e.g. 9779864029898)"
              name="whatsapp_number"
              defaultValue={settings.whatsapp_number ?? ''}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Address" name="address" defaultValue={settings.address ?? ''} />
            <Field label="Opening Hours" name="opening_hours" defaultValue={settings.opening_hours ?? ''} />
          </div>
        </div>

        {/* Social Media Links with Vector SVG Previews */}
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-600">
            Social Media Links &amp; Brand Logos
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#1877F2] text-white shrink-0 shadow-sm">
                <FacebookIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Field label="Facebook Page URL" name="facebook_url" defaultValue={settings.facebook_url ?? ''} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#E4405F] text-white shrink-0 shadow-sm">
                <InstagramIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Field label="Instagram Profile URL" name="instagram_url" defaultValue={settings.instagram_url ?? ''} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-black text-white shrink-0 shadow-sm">
                <TikTokIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Field label="TikTok Account URL" name="tiktok_url" defaultValue={settings.tiktok_url ?? ''} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#25D366] text-white shrink-0 shadow-sm">
                <WhatsAppIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold text-muted block mb-1">WhatsApp Chat Direct Link</span>
                <input
                  type="text"
                  disabled
                  value={
                    settings.whatsapp_number
                      ? `https://wa.me/${settings.whatsapp_number}`
                      : 'Configured via WhatsApp Number field above'
                  }
                  className="w-full rounded-xl border border-border bg-bg/50 px-3 py-2 text-xs text-muted"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#FF0000] text-white shrink-0 shadow-sm">
                <YouTubeIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Field label="YouTube Channel URL" name="youtube_url" defaultValue={settings.youtube_url ?? ''} />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-8 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-colors"
        >
          Save All Store Settings &amp; Social Links 💾
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted block mb-1">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-amber-600"
      />
    </div>
  );
}
