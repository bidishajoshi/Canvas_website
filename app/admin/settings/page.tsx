import { getSettings } from '@/lib/content';
import { updateSettings } from './actions';

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Settings</h1>

      <form action={updateSettings} className="mt-6 max-w-2xl space-y-4">
        <Field label="Business Name" name="business_name" defaultValue={settings.business_name} />
        <Field label="Tagline" name="tagline" defaultValue={settings.tagline ?? ''} />
        <div>
          <label className="text-xs text-muted">Short Description</label>
          <textarea
            name="short_description"
            rows={2}
            defaultValue={settings.short_description ?? ''}
            className="mt-1 w-full rounded-card border border-border bg-bg px-3 py-2 text-sm"
          />
        </div>
        <Field label="Logo URL" name="logo_url" defaultValue={settings.logo_url ?? ''} />
        <Field label="Email" name="email" defaultValue={settings.email ?? ''} type="email" />
        <Field label="Phone" name="phone" defaultValue={settings.phone ?? ''} />
        <Field
          label="WhatsApp Number (with country code, e.g. 9779800000000)"
          name="whatsapp_number"
          defaultValue={settings.whatsapp_number ?? ''}
        />
        <Field label="Address" name="address" defaultValue={settings.address ?? ''} />
        <Field label="Opening Hours" name="opening_hours" defaultValue={settings.opening_hours ?? ''} />
        <Field label="Facebook URL" name="facebook_url" defaultValue={settings.facebook_url ?? ''} />
        <Field label="Instagram URL" name="instagram_url" defaultValue={settings.instagram_url ?? ''} />
        <Field label="TikTok URL" name="tiktok_url" defaultValue={settings.tiktok_url ?? ''} />

        <button
          type="submit"
          className="rounded-card bg-accent-yellow px-5 py-3 text-sm font-semibold text-[color:var(--color-accent-yellow-contrast)]"
        >
          Save Settings
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
      <label className="text-xs text-muted">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-card border border-border bg-bg px-3 py-2 text-sm"
      />
    </div>
  );
}
