'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'affordable-decoration-theme';

// Inline script injected into <head> so the theme is applied before
// React hydrates — prevents a flash of the wrong theme on load.
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var theme = stored === 'dark' || stored === 'light'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'dark' || current === 'light') {
      setTheme(current);
    }
  }, []);

  function toggleTheme() {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage may be unavailable (private browsing) — theme
      // still applies for the current session via the DOM attribute.
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
