'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import type { MenuItem } from '@/lib/content';

export function NavLinks({ menuItems }: { menuItems: MenuItem[] }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Define standard primary links per prompt requirements
  const primaryLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Canvas', href: '/custom-canvas' },
    { label: 'T-Shirts', href: '/custom-t-shirt' },
    { label: 'Categories', href: '/categories' },
    { label: 'Offers', href: '/offers' },
  ];

  // More options dropdown
  const secondaryLinks = [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'About Us', href: '/about' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'Contact Us', href: '/contact' },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="hidden lg:flex items-center gap-6">
      {primaryLinks.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm font-semibold text-text/85 hover:text-amber-600 transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-amber-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
        >
          {item.label}
        </Link>
      ))}

      {/* More Dropdown */}
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-1 text-sm font-semibold text-text/85 hover:text-amber-600 transition-colors py-1 focus:outline-none"
          aria-expanded={dropdownOpen}
        >
          <span>More</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 transition-transform duration-200 ${
              dropdownOpen ? 'rotate-180 text-amber-600' : 'text-muted'
            }`}
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 rounded-xl border border-border bg-surface p-2 shadow-xl backdrop-blur-md animate-fadeIn z-50">
            {secondaryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-text hover:bg-amber-500/10 hover:text-amber-600 transition-colors"
              >
                <span>{item.label}</span>
                <span className="text-muted text-[10px]">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
