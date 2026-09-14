import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { addFaqKnowledge, deleteFaqKnowledge } from './actions';
import type { ChatKnowledge } from '@/lib/types';
import { filterDeleted } from '@/lib/adminStore';

export default async function AdminAiAssistantPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { data: dbKnowledge } = await supabase
    .from('chat_knowledge')
    .select('*')
    .order('created_at', { ascending: false });

  const defaultKnowledge: ChatKnowledge[] = [
    {
      id: 'k1',
      question: 'How long does delivery take in Nepal?',
      answer: 'We deliver within 24–48 hours in Kathmandu Valley (Kathmandu, Lalitpur, Bhaktapur) and 2–4 working days for outer districts across Nepal.',
      category: 'Delivery',
      keywords: ['delivery', 'time', 'days', 'shipping'],
      status: 'published',
    },
    {
      id: 'k2',
      question: 'What payment methods do you accept?',
      answer: 'We accept Cash on Delivery (COD), eSewa, Khalti, and Direct Bank Transfer.',
      category: 'Payments',
      keywords: ['payment', 'esewa', 'khalti', 'cod', 'cash'],
      status: 'published',
    },
    {
      id: 'k3',
      question: 'Can I print my own custom photo on canvas or t-shirt?',
      answer: 'Yes! Use our Custom Canvas Builder or Custom T-Shirt Builder to upload your own JPG, PNG, or WebP photo, crop, resize, and preview in real time.',
      category: 'Customization',
      keywords: ['photo', 'upload', 'custom', 'tshirt', 'canvas'],
      status: 'published',
    },
  ];

  const knowledge = filterDeleted(dbKnowledge && dbKnowledge.length > 0 ? (dbKnowledge as ChatKnowledge[]) : defaultKnowledge);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold">AI Knowledge Base &amp; FAQ Manager</h1>
        <p className="text-xs text-muted mt-1">
          Configure instant answers for customer questions. The AI chatbot looks up this admin knowledge base for fast, zero-delay responses.
        </p>
      </div>

      {/* Add New Q&A Knowledge Form */}
      <form action={addFaqKnowledge} className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">Add New Q&amp;A Pair</h3>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-muted block mb-1">Customer Question *</label>
            <input
              type="text"
              name="question"
              required
              placeholder="e.g. Do you offer free delivery in Kathmandu?"
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Category Tag</label>
            <input
              type="text"
              name="category"
              defaultValue="Delivery"
              placeholder="Delivery / Pricing / Return"
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Configured Answer *</label>
          <textarea
            name="answer"
            required
            rows={3}
            placeholder="Type the exact answer the AI assistant should return to customers..."
            className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          + Save Q&amp;A Knowledge Pair
        </button>
      </form>

      {/* Existing Knowledge Pairs List */}
      <div className="space-y-3">
        {knowledge.map((k) => (
          <div
            key={k.id}
            className="p-5 rounded-2xl border border-border bg-surface flex items-start justify-between gap-4 shadow-sm"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold text-[10px] uppercase">
                  {k.category || 'FAQ'}
                </span>
                <h4 className="font-bold text-text text-sm">{k.question}</h4>
              </div>
              <p className="text-xs text-muted leading-relaxed bg-bg p-3 rounded-xl border border-border">
                {k.answer}
              </p>
            </div>

            <form action={deleteFaqKnowledge.bind(null, k.id)}>
              <button type="submit" className="text-xs text-rose-600 font-bold hover:underline shrink-0 pt-1">
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
