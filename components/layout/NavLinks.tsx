'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import type { MenuItem } from '@/lib/content';

export function NavLinks({ menuItems }: { menuItems: MenuItem[] }) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Primary links per design
  const primaryLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Canvas', href: '/custom-canvas' },
    { label: 'T-Shirts', href: '/custom-t-shirt' },
    { label: 'Categories', href: '/categories' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Offers', href: '/offers' },
  ];

  // Secondary links in More dropdown
  const secondaryLinks = [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'About Us', href: '/about' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'Contact Us', href: '/contact' },
  ];

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    }
    document.addEventListener('mousedown', handleClickOutside, { passive: true });
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown]);

  return (
    <nav className="hidden lg:flex items-center gap-3 xl:gap-6 shrink-0">
      {primaryLinks.map((item) => {
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={item.href.includes('custom') ? false : true}
            className={`text-xs xl:text-sm font-semibold whitespace-nowrap transition-all duration-120 relative py-1.5 active:scale-95 nav-link-glow gpu-layer ${
              isActive
                ? 'text-amber-600 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-amber-600 after:rounded-full'
                : 'text-text/85 hover:text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-amber-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform'
            }`}
          >
            {item.label}
          </Link>
        );
      })}

      {/* More Dropdown */}
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          className={`flex items-center gap-1 text-xs xl:text-sm font-semibold whitespace-nowrap transition-all duration-120 py-1.5 focus:outline-none active:scale-95 gpu-layer ${
            dropdownOpen || secondaryLinks.some((l) => pathname.startsWith(l.href))
              ? 'text-amber-600 font-bold'
              : 'text-text/85 hover:text-amber-600'
          }`}
          aria-expanded={dropdownOpen}
        >
          <span>More</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 transition-transform duration-150 ${
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
          <div className="absolute top-full right-0 mt-2 w-52 rounded-2xl border border-border bg-surface p-2 shadow-2xl z-50 transform origin-top-right transition-all duration-150 gpu-layer">
            {secondaryLinks.map((item) => {
              const isSecActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={closeDropdown}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-100 ${
                    isSecActive
                      ? 'bg-amber-500/10 text-amber-600 font-bold'
                      : 'text-text hover:bg-surface-hover hover:text-amber-600'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-muted text-[10px]">→</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
