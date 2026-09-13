import { formatPaisa } from './utils';

export interface WhatsAppCanvasDetails {
  panelTypeName: string;
  sizeName: string;
  frameName?: string | null;
  finishName?: string | null;
  estimatedPricePaisa: number;
  customerName?: string;
  quantity?: number;
}

/**
 * Builds a wa.me deep link with a prefilled message summarizing the
 * customer's canvas configuration. The WhatsApp number always comes
 * from `settings.whatsapp_number` (fetched by the caller) — never
 * hardcoded here.
 */
export function buildWhatsAppLink(
  whatsappNumber: string,
  details: WhatsAppCanvasDetails
): string {
  const lines = [
    'Hello Affordable Decoration,',
    '',
    'I want to order a custom canvas.',
    '',
    `Canvas: ${details.panelTypeName}`,
    `Size: ${details.sizeName}`,
  ];

  if (details.frameName) lines.push(`Frame: ${details.frameName}`);
  if (details.finishName) lines.push(`Finish: ${details.finishName}`);
  if (details.quantity && details.quantity > 1) {
    lines.push(`Quantity: ${details.quantity}`);
  }

  lines.push(
    '',
    `Estimated Price: ${formatPaisa(details.estimatedPricePaisa)}`
  );

  if (details.customerName) {
    lines.push('', `Customer Name: ${details.customerName}`);
  }

  lines.push('', 'Please confirm my canvas.');

  const message = encodeURIComponent(lines.join('\n'));
  const digitsOnly = whatsappNumber.replace(/[^\d]/g, '');

  return `https://wa.me/${digitsOnly}?text=${message}`;
}
