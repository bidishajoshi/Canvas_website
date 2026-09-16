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
  const digitsOnly = whatsappNumber.replace(/[^\d]/g, '') || '9779800000000';

  return `https://wa.me/${digitsOnly}?text=${message}`;
}

export interface WhatsAppOrderDetails {
  orderNumber?: string;
  customerName: string;
  phone: string;
  email?: string | null;
  addressLine: string;
  toleArea?: string;
  municipality?: string;
  district?: string;
  province?: string;
  landmark?: string;
  paymentMethodName?: string;
  items: Array<{
    name: string;
    sizeLabel?: string | null;
    frameLabel?: string | null;
    quantity: number;
    unitPricePaisa: number;
  }>;
  subtotalPaisa: number;
  shippingPaisa: number;
  discountPaisa?: number;
  totalPaisa: number;
}

/**
 * Builds a structured wa.me deep link with full customer contact info,
 * delivery address/location, order breakdown, and payment details.
 */
export function buildFullOrderWhatsAppLink(
  whatsappNumber: string,
  details: WhatsAppOrderDetails
): string {
  const lines: string[] = [
    'Namaste Affordable Decoration! 🙏',
    '',
    `I would like to place an order${details.orderNumber ? ` (#${details.orderNumber})` : ''}:`,
    '',
    '📋 *ORDER BREAKDOWN*:',
  ];

  details.items.forEach((item, idx) => {
    const specs = [item.sizeLabel, item.frameLabel].filter(Boolean).join(', ');
    const specStr = specs ? ` (${specs})` : '';
    lines.push(
      `${idx + 1}. *${item.name}*${specStr} × ${item.quantity} — ${formatPaisa(item.unitPricePaisa * item.quantity)}`
    );
  });

  lines.push('');
  lines.push(`Subtotal: ${formatPaisa(details.subtotalPaisa)}`);
  if (details.discountPaisa && details.discountPaisa > 0) {
    lines.push(`Promo Discount: -${formatPaisa(details.discountPaisa)}`);
  }
  lines.push(`Shipping Fee: ${details.shippingPaisa === 0 ? 'FREE' : formatPaisa(details.shippingPaisa)}`);
  lines.push(`*Total Amount: ${formatPaisa(details.totalPaisa)}*`);

  lines.push('');
  lines.push('👤 *CUSTOMER INFORMATION*:');
  lines.push(`- Full Name: ${details.customerName}`);
  lines.push(`- Phone: ${details.phone}`);
  if (details.email) lines.push(`- Email: ${details.email}`);

  lines.push('');
  lines.push('📍 *DELIVERY ADDRESS / LOCATION*:');
  const locationParts = [
    details.addressLine,
    details.toleArea,
    details.municipality,
    details.district,
    details.province,
  ].filter(Boolean);
  lines.push(`- Address: ${locationParts.join(', ')}`);
  if (details.landmark) lines.push(`- Landmark: ${details.landmark}`);

  if (details.paymentMethodName) {
    lines.push('');
    lines.push(`💳 *Payment Method*: ${details.paymentMethodName}`);
  }

  lines.push('');
  lines.push('Please confirm my order and let me know the estimated delivery timeframe. Thank you!');

  const message = encodeURIComponent(lines.join('\n'));
  const digitsOnly = whatsappNumber.replace(/[^\d]/g, '') || '9779800000000';

  return `https://wa.me/${digitsOnly}?text=${message}`;
}

