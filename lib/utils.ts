import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats integer paisa (smallest NPR unit) as a "Rs. X,XXX" display string. */
export function formatPaisa(paisa: number, currency = 'Rs.'): string {
  const rupees = Math.round(paisa) / 100;
  return `${currency} ${rupees.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
