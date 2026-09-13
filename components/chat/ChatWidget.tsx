'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  needsHuman?: boolean;
}

const SUGGESTED_QUESTIONS = [
  'Canvas prices',
  '3 panel details',
  'Which size is best?',
  'Delivery information',
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionIdRef = useRef<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Stable per-tab session id for chat_logs correlation.
    const existing = sessionStorage.getItem('ad-chat-session');
    sessionIdRef.current = existing ?? crypto.randomUUID();
    if (!existing) sessionStorage.setItem('ad-chat-session', sessionIdRef.current);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: sessionIdRef.current }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.answer, needsHuman: data.needsHuman },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "Sorry, I couldn't reach the assistant right now. Please try WhatsApp instead.",
          needsHuman: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-[22rem] max-w-[90vw] flex-col overflow-hidden rounded-card border border-border bg-bg shadow-xl">
          <div className="bg-accent-yellow px-4 py-3 text-sm font-semibold text-[color:var(--color-accent-yellow-contrast)]">
            Affordable Decoration Assistant
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div>
                <p className="text-sm text-muted">
                  Hi! I can help you with canvas sizes, prices, panel options,
                  framing, delivery and ordering.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="rounded-full border border-border px-3 py-1 text-xs hover:bg-surface"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-card px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'ml-auto bg-accent-pink/25 text-text'
                    : 'bg-surface text-text'
                }`}
              >
                {m.text}
                {m.needsHuman && (
                  <div className="mt-2 flex gap-2">
                    <a
                      href="/contact"
                      className="rounded-full bg-accent-yellow px-3 py-1 text-xs font-semibold text-[color:var(--color-accent-yellow-contrast)]"
                    >
                      Send Inquiry
                    </a>
                    <a
                      href="/contact#whatsapp"
                      className="rounded-full border border-border px-3 py-1 text-xs"
                    >
                      Chat on WhatsApp
                    </a>
                  </div>
                )}
              </div>
            ))}

            {loading && <p className="text-xs text-muted">Typing…</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sizes, prices, delivery…"
              className="flex-1 rounded-card border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent-yellow"
            />
            <button
              type="submit"
              className="rounded-card bg-accent-yellow px-4 py-2 text-sm font-semibold text-[color:var(--color-accent-yellow-contrast)]"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-yellow text-2xl text-[color:var(--color-accent-yellow-contrast)] shadow-lg"
      >
        {open ? '×' : '💬'}
      </button>
    </div>
  );
}
