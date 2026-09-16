import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/content';
import { formatPaisa } from '@/lib/utils';

const RESPECTFUL_WHATSAPP_FALLBACK =
  "Namaste & thank you for reaching out to Affordable Decoration! 🙏 We don't have an automated answer for your specific query right now, but our team is ready to assist you personally. Please click below to chat with us directly on WhatsApp for instant assistance.";

const DEFAULT_KNOWLEDGE = [
  {
    id: 'k1',
    question: 'How long does delivery take in Nepal?',
    answer:
      'We deliver within 24–48 hours in Kathmandu Valley (Kathmandu, Lalitpur, Bhaktapur) and 2–4 working days for outer districts across Nepal.',
    category: 'Delivery',
    keywords: ['delivery', 'time', 'days', 'shipping', 'location', 'kathmandu', 'district', 'valley'],
  },
  {
    id: 'k2',
    question: 'What payment methods do you accept?',
    answer:
      'We accept Cash on Delivery (COD), eSewa, Khalti, and Direct Bank Transfer for all orders in Nepal.',
    category: 'Payments',
    keywords: ['payment', 'esewa', 'khalti', 'cod', 'cash', 'pay', 'bank', 'transfer'],
  },
  {
    id: 'k3',
    question: 'Can I print my own custom photo on canvas or t-shirt?',
    answer:
      'Yes! You can use our Custom Canvas Studio or Custom T-Shirt Builder to upload your favorite photos or designs, choose panels & sizes, and preview in real time.',
    category: 'Customization',
    keywords: ['photo', 'upload', 'custom', 'tshirt', 'canvas', 'picture', 'print', 'design', 'image'],
  },
  {
    id: 'k4',
    question: 'What are the custom canvas prices and sizes?',
    answer:
      'Our custom canvas wall art starts from Rs. 700 up to Rs. 3,500 depending on size and 1 to 7 panel layout configurations. Visit our Live Canvas Studio to get an instant live quote!',
    category: 'Pricing',
    keywords: ['price', 'cost', 'size', 'sizes', 'rate', 'panel', 'panels', '700', '3500', 'how much'],
  },
  {
    id: 'k5',
    question: 'Where is your store located or how can I contact support?',
    answer:
      'We are based in Kathmandu, Nepal. You can contact us directly via WhatsApp or phone for any custom orders, revisions, or inquiries.',
    category: 'Contact',
    keywords: ['contact', 'address', 'store', 'phone', 'whatsapp', 'location', 'kathmandu', 'office', 'number'],
  },
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function matchKnowledge(
  userMsg: string,
  knowledgeRows: Array<{ id: string; question: string; answer: string; keywords?: string[] }>
) {
  const normalizedUser = userMsg.toLowerCase().trim();
  const userTokens = tokenize(userMsg);

  let bestRow: { id: string; answer: string } | null = null;
  let maxScore = 0;

  for (const row of knowledgeRows) {
    if (!row.question || !row.answer) continue;
    const normQ = row.question.toLowerCase().trim();
    let score = 0;

    // 1. Exact or near-exact match
    if (normalizedUser === normQ) {
      score += 100;
    } else if (normalizedUser.length >= 3 && (normalizedUser.includes(normQ) || normQ.includes(normalizedUser))) {
      score += 50;
    }

    // 2. Token overlap & keywords match
    const rowTokens = new Set([
      ...tokenize(row.question),
      ...(row.keywords ?? []).flatMap((k: string) => tokenize(k)),
    ]);

    let tokenMatchCount = 0;
    for (const t of userTokens) {
      if (rowTokens.has(t)) {
        tokenMatchCount++;
      }
    }

    score += tokenMatchCount * 12;

    if (score > maxScore && score >= 10) {
      maxScore = score;
      bestRow = row;
    }
  }

  return bestRow;
}

export async function GET() {
  try {
    const supabase = createClient();
    const fetchPromise = supabase
      .from('chat_knowledge')
      .select('id, question')
      .eq('status', 'published');
    const timeoutPromise = new Promise<{ data: null }>((resolve) =>
      setTimeout(() => resolve({ data: null }), 100)
    );

    const res = await Promise.race([fetchPromise, timeoutPromise]);
    let questions: string[] = [];
    if (res.data && res.data.length > 0) {
      questions = res.data.map((k: any) => k.question).filter(Boolean);
    }

    if (questions.length < 3) {
      const defaultQs = DEFAULT_KNOWLEDGE.map((k) => k.question);
      questions = Array.from(new Set([...questions, ...defaultQs]));
    }

    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ questions: DEFAULT_KNOWLEDGE.map((k) => k.question) });
  }
}

export async function POST(req: NextRequest) {
  const { message, sessionId } = (await req.json()) as {
    message?: string;
    sessionId?: string;
  };

  if (!message || !sessionId) {
    return NextResponse.json(
      { error: 'message and sessionId are required' },
      { status: 400 }
    );
  }

  const settings = await getSettings();
  const whatsappNumber = settings.whatsapp_number || '9779800000000';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Namaste! I have an inquiry from your website regarding: "${message}"`
  )}`;

  const questionTokens = new Set(tokenize(message));

  let answer = RESPECTFUL_WHATSAPP_FALLBACK;
  let needsHuman = true;
  let matchedKnowledgeId: string | null = null;

  // 1. Fast local match against pre-configured knowledge rows FIRST (Instant <1ms response)
  let dbRows: any[] | null = null;
  try {
    const supabase = createClient();
    const fetchPromise = supabase
      .from('chat_knowledge')
      .select('*')
      .eq('status', 'published');
    const timeoutPromise = new Promise<{ data: null }>((resolve) =>
      setTimeout(() => resolve({ data: null }), 100)
    );
    const res = await Promise.race([fetchPromise, timeoutPromise]);
    dbRows = res.data;
  } catch {
    dbRows = null;
  }

  const allKnowledgeRows = [...(dbRows ?? []), ...DEFAULT_KNOWLEDGE];
  const matched = matchKnowledge(message, allKnowledgeRows);

  if (matched) {
    answer = matched.answer;
    matchedKnowledgeId = matched.id;
    needsHuman = false;
  } else {
    // 2. Secondary keyword heuristics for prices/delivery/sizes if not matched
    if (questionTokens.has('price') || questionTokens.has('cost') || questionTokens.has('rs')) {
      answer = 'Our custom canvas wall art starts from Rs. 700 up to Rs. 3,500 depending on size and 1 to 7 panel layout configurations. For custom bulk pricing or special quotes, please feel free to message us on WhatsApp!';
      needsHuman = false;
    } else if (
      questionTokens.has('deliver') ||
      questionTokens.has('delivery') ||
      questionTokens.has('shipping')
    ) {
      answer = 'We deliver across all 77 districts in Nepal! Kathmandu Valley orders take 24–48 hours, while outer district deliveries take 2–4 business days.';
      needsHuman = false;
    } else if (questionTokens.has('size') || questionTokens.has('sizes')) {
      answer = 'We offer 1 Panel, 2 Panel, 3 Panel (Triptych), 4 Panel, 5 Panel, 6 Panel, and 7 Panel Panoramic canvases in various sizes (e.g. 12"×18", 24"×36", 48"×24", 60"×32", 84"×36").';
      needsHuman = false;
    }
  }

  // 3. Asynchronously record to chat_logs without blocking the client response
  try {
    const supabase = createClient();
    supabase
      .from('chat_logs')
      .insert({
        session_id: sessionId,
        user_message: message,
        ai_response: answer,
        matched_knowledge_id: matchedKnowledgeId,
        needs_human: needsHuman,
      })
      .then(
        () => {},
        () => {}
      );
  } catch {
    // Non-blocking log write
  }

  return NextResponse.json({
    answer,
    needsHuman,
    whatsappUrl,
    whatsappNumber,
  });
}
