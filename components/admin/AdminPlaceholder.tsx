export function AdminPlaceholder({
  title,
  table,
  note,
}: {
  title: string;
  table: string;
  note?: string;
}) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{title}</h1>
      <div className="mt-6 max-w-xl rounded-card border border-dashed border-border p-6 text-sm text-muted">
        <p>
          This section&apos;s data model (<code className="rounded bg-surface px-1">{table}</code>)
          is already defined in <code className="rounded bg-surface px-1">schema.sql</code> and
          readable/writable via the admin Supabase client — it just doesn&apos;t have a full
          CRUD screen built yet. Follow the same pattern as{' '}
          <code className="rounded bg-surface px-1">/admin/categories</code> or{' '}
          <code className="rounded bg-surface px-1">/admin/canvas-builder</code> (Server
          Component list + Server Action form) to add one.
        </p>
        {note && <p className="mt-3">{note}</p>}
      </div>
    </div>
  );
}
