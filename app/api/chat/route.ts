import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { formatPaisa } from '@/lib/utils';

const FALLBACK_ANSWER =
  "I'm not completely sure about that. Would you like to talk to Affordable Decoration directly?";

const DEFAULT_KNOWLEDGE = [
  {
    id: 'k1',
    question: 'How long does delivery take in Nepal?',
    answer: 'We deliver within 24–48 hours in Kathmandu Valley (Kathmandu, Lalitpur, Bhaktapur) and 2–4 working days for outer districts across Nepal.',
    category: 'Delivery',
    keywords: ['delivery', 'time', 'days', 'shipping'],
  },
  {
    id: 'k2',
    question: 'What payment methods do you accept?',
    answer: 'We accept Cash on Delivery (COD), eSewa, Khalti, and Direct Bank Transfer.',
    category: 'Payments',
    keywords: ['payment', 'esewa', 'khalti', 'cod', 'cash'],
  },
  {
    id: 'k3',
    question: 'Can I print my own custom photo on canvas or t-shirt?',
    answer: 'Yes! Use our Custom Canvas Builder or Custom T-Shirt Builder to upload your own JPG, PNG, or WebP photo, crop, resize, and preview in real time.',
    category: 'Customization',
    keywords: ['photo', 'upload', 'custom', 'tshirt', 'canvas'],
  },
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function matchKnowledge(userMsg: string, knowledgeRows: Array<{ id: string; question: string; answer: string; keywords?: string[] }>) {
  const normalizedUser = userMsg.toLowerCase().trim();
  const userTokens = tokenize(userMsg);

  let bestRow: { id: string; answer: string } | null = null;
  let maxScore = 0;

  for (const row of knowledgeRows) {
    if (!row.question || !row.answer) continue;
    const normQ = row.question.toLowerCase().trim();
    let score = 0;

    // 1. Exact match
    if (normalizedUser === normQ) {
      score += 100;
    } 
    // 2. Substring match
    else if (normalizedUser.length >= 3 && (normalizedUser.includes(normQ) || normQ.includes(normalizedUser))) {
      score += 50;
    }

    // 3. Token overlap & keywords match
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

    score += tokenMatchCount * 10;

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
    const { data: dbKnowledge } = await supabase
      .from('chat_knowledge')
      .select('id, question')
      .eq('status', 'published');

    let questions: string[] = [];
    if (dbKnowledge && dbKnowledge.length > 0) {
      questions = dbKnowledge.map((k) => k.question).filter(Boolean);
    }

    // Merge default questions if few or none found
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

  const supabase = createClient();
  const questionTokens = new Set(tokenize(message));

  let answer = FALLBACK_ANSWER;
  let needsHuman = true;
  let matchedKnowledgeId: string | null = null;

  // 1. Check admin-configured knowledge base FIRST
  const { data: dbRows } = await supabase
    .from('chat_knowledge')
    .select('*')
    .eq('status', 'published');

  const allKnowledgeRows = [...(dbRows ?? []), ...DEFAULT_KNOWLEDGE];
  const matched = matchKnowledge(message, allKnowledgeRows);

  if (matched) {
    answer = matched.answer;
    matchedKnowledgeId = matched.id;
    needsHuman = false;
  }

  // 2. Secondary live database lookup for price/size/delivery if knowledge base didn't match
  if (needsHuman) {
    if (questionTokens.has('price') || questionTokens.has('cost') || questionTokens.has('rs')) {
      const { data: sizes } = await supabase
        .from('canvas_sizes')
        .select('name, price_adjustment_paisa, panel_type_id, panel_types(name, panel_count)')
        .eq('active', true)
        .order('sort_order', { ascending: true })
        .limit(6);

      if (sizes && sizes.length > 0) {
        const lines = sizes.map((s: any) => {
          const panelName = s.panel_types?.name ?? 'Canvas';
          return `${panelName} (${s.name}): from ${formatPaisa(s.price_adjustment_paisa)}`;
        });
        answer = `Here are some current options:\n${lines.join('\n')}\n\nFinal price also depends on frame and finish — see the Custom Canvas page for an exact quote.`;
        needsHuman = false;
      }
    } else if (
      questionTokens.has('deliver') ||
      questionTokens.has('delivery') ||
      questionTokens.has('shipping')
    ) {
      const { data: rules } = await supabase
        .from('shipping_rules')
        .select('*')
        .eq('active', true);

      if (rules && rules.length > 0) {
        const lines = rules.map(
          (r) =>
            `${r.zone_name}: ${formatPaisa(r.charge_paisa)}${
              r.estimated_days_min ? `, ${r.estimated_days_min}-${r.estimated_days_max} days` : ''
            }`
        );
        answer = lines.join('\n');
        needsHuman = false;
      }
    } else if (questionTokens.has('size') || questionTokens.has('sizes')) {
      const { data: sizes } = await supabase
        .from('canvas_sizes')
        .select('name')
        .eq('active', true)
        .order('sort_order', { ascending: true })
        .limit(10);

      if (sizes && sizes.length > 0) {
        answer = `Available sizes include: ${sizes.map((s) => s.name).join(', ')}.`;
        needsHuman = false;
      }
    }
  }

  await supabase.from('chat_logs').insert({
    session_id: sessionId,
    user_message: message,
    ai_response: answer,
    matched_knowledge_id: matchedKnowledgeId,
    needs_human: needsHuman,
  });

  return NextResponse.json({ answer, needsHuman });
}
