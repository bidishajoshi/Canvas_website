/**
 * Enhances image URLs (including Cloudinary links) with automatic format (`f_auto`),
 * quality optimization (`q_auto`), and responsive width scaling.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: { width?: number; quality?: 'auto' | 'high' | 'low'; format?: 'auto' | 'webp' | 'png' } = {}
): string {
  if (!url) return '';

  // Handle Cloudinary URLs
  if (url.includes('res.cloudinary.com')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      const transformParams: string[] = [];

      // Automatic quality & format
      const q = options.quality === 'high' ? 'q_auto:best' : options.quality === 'low' ? 'q_auto:eco' : 'q_auto';
      const f = options.format === 'png' ? 'f_png' : options.format === 'webp' ? 'f_webp' : 'f_auto';

      transformParams.push(q);
      transformParams.push(f);

      if (options.width) {
        transformParams.push(`w_${options.width}`, 'c_limit');
      }

      return `${parts[0]}/upload/${transformParams.join(',')}/${parts[1]}`;
    }
  }

  // Handle Unsplash image parameters if present
  if (url.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(url);
      if (options.width) parsed.searchParams.set('w', options.width.toString());
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('q', '80');
      return parsed.toString();
    } catch (e) {
      return url;
    }
  }

  return url;
}
