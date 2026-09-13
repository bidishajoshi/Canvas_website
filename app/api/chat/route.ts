import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { formatPaisa } from '@/lib/utils';

const FALLBACK_ANSWER =
  "I'm not completely sure about that. Would you like to talk to Affordable Decoration directly?";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
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

  // 1. Live, always-fresh answers for price/size/delivery questions —
  //    pulled directly from the tables an admin actually edits, so the
  //    bot can never go stale or invent a number.
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

  // 2. Otherwise, fall back to the admin-authored knowledge base —
  //    simple keyword overlap scoring (swap for pgvector embeddings
  //    later if you want semantic matching).
  if (needsHuman) {
    const { data: knowledgeRows } = await supabase
      .from('chat_knowledge')
      .select('*')
      .eq('status', 'published');

    let bestScore = 0;
    let bestRow: { id: string; answer: string } | null = null;

    for (const row of knowledgeRows ?? []) {
      const rowTokens = new Set([
        ...tokenize(row.question),
        ...(row.keywords ?? []).map((k: string) => k.toLowerCase()),
      ]);
      let score = 0;
      for (const t of questionTokens) if (rowTokens.has(t)) score++;

      if (score > bestScore) {
        bestScore = score;
        bestRow = row;
      }
    }

    if (bestRow && bestScore >= 1) {
      answer = bestRow.answer;
      matchedKnowledgeId = bestRow.id;
      needsHuman = false;
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
