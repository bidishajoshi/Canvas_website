import type { CanvasSize, Frame, Finish } from './types';

export interface PriceInputs {
  basePricePaisa: number; // panel_types base price, or product base price
  canvasSize: Pick<CanvasSize, 'price_adjustment_paisa'>;
  frame?: Pick<Frame, 'price_paisa'> | null;
  finish?: Pick<Finish, 'price_paisa'> | null;
  quantity: number;
  discountPaisa?: number;
}

/**
 * Single source of truth for price calculation. Called client-side for
 * the instant "live preview" price, and again server-side (with values
 * re-fetched from the database, never trusting client-submitted numbers)
 * when an inquiry or order is actually created.
 */
export function calculatePrice(inputs: PriceInputs): number {
  const {
    basePricePaisa,
    canvasSize,
    frame,
    finish,
    quantity,
    discountPaisa = 0,
  } = inputs;

  const unitPrice =
    basePricePaisa +
    canvasSize.price_adjustment_paisa +
    (frame?.price_paisa ?? 0) +
    (finish?.price_paisa ?? 0);

  const total = Math.max(0, unitPrice - discountPaisa) * Math.max(1, quantity);

  return Math.round(total);
}

/**
 * Very rough print-suitability check based on pixel dimensions vs the
 * physical canvas size, at a configurable minimum DPI (from settings).
 * This intentionally does NOT claim to measure real print DPI (that
 * would require knowing the source scan/camera details) — it's a
 * heuristic to warn customers, per the spec's "do not overclaim" rule.
 */
export function estimateImageQuality(
  imageWidthPx: number,
  imageHeightPx: number,
  canvasWidthInches: number,
  canvasHeightInches: number,
  minRecommendedDpi = 150
): 'excellent' | 'good' | 'low_resolution' {
  const effectiveDpiW = imageWidthPx / canvasWidthInches;
  const effectiveDpiH = imageHeightPx / canvasHeightInches;
  const effectiveDpi = Math.min(effectiveDpiW, effectiveDpiH);

  if (effectiveDpi >= minRecommendedDpi) return 'excellent';
  if (effectiveDpi >= minRecommendedDpi * 0.6) return 'good';
  return 'low_resolution';
}
