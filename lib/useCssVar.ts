'use client';

import { useEffect, useState } from 'react';

/**
 * Konva renders to a <canvas> element, whose 2D context does not
 * understand CSS variables (`fillStyle = "var(--x)"` silently fails).
 * This hook resolves a CSS custom property to its current computed
 * color value, and re-reads it whenever the theme attribute changes.
 */
export function useCssVar(name: string, fallback: string): string {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    function read() {
      const resolved = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      if (resolved) setValue(resolved);
    }

    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, [name]);

  return value;
}
