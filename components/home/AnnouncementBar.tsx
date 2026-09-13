import Link from 'next/link';

export function AnnouncementBar({
  message,
  href,
}: {
  message: string | null;
  href: string | null;
}) {
  if (!message) return null;

  const content = (
    <p className="w-full bg-accent-yellow px-4 py-2 text-center text-sm font-medium text-[color:var(--color-accent-yellow-contrast)]">
      {message}
    </p>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
