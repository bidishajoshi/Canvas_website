'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  needsHuman?: boolean;
  whatsappUrl?: string;
}

const DEFAULT_SUGGESTIONS = [
  'How long does delivery take in Nepal?',
  'What payment methods do you accept?',
  'Can I print my own custom photo on canvas or t-shirt?',
  'What are custom canvas prices?',
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const sessionIdRef = useRef<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Stable per-tab session id for chat_logs correlation.
    const existing = sessionStorage.getItem('ad-chat-session');
    sessionIdRef.current = existing ?? crypto.randomUUID();
    if (!existing) sessionStorage.setItem('ad-chat-session', sessionIdRef.current);

    // Fetch dynamic FAQ questions configured by admin
    fetch('/api/chat')
      .then((res) => res.json())
      .then((data) => {
        if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
          setSuggestedQuestions(data.questions);
        }
      })
      .catch(() => {});
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
        {
          role: 'assistant',
          text: data.answer,
          needsHuman: data.needsHuman,
          whatsappUrl: data.whatsappUrl,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "Namaste! 🙏 Thank you for reaching out. If you would like to know more or inquire further details, we would be delighted to assist you directly on WhatsApp! Please click below to connect with us.",
          needsHuman: true,
          whatsappUrl: 'https://wa.me/9779800000000',
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
          <div className="bg-amber-600 px-4 py-3 text-sm font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>🤖</span> Affordable Decoration AI Assistant
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white font-bold text-base"
            >
              ×
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div>
                <p className="text-xs text-muted leading-relaxed">
                  Namaste! Welcome to Affordable Decoration. 🙏 I can assist you with canvas sizes, prices, delivery across Nepal, framing, and ordering.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="rounded-xl border border-border px-3 py-1.5 text-xs text-text hover:border-amber-600 hover:text-amber-600 bg-surface text-left transition-colors"
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
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'ml-auto bg-amber-600 text-white font-medium'
                    : 'bg-surface text-text border border-border/80 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.needsHuman && (
                  <div className="mt-3 pt-2 border-t border-border/50 flex flex-col gap-2">
                    <a
                      href={m.whatsappUrl || 'https://wa.me/9779800000000'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all"
                    >
                      <span>💬</span> Chat Direct on WhatsApp
                    </a>
                    <a
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-text hover:bg-surface-hover"
                    >
                      Send Message Inquiry
                    </a>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="bg-surface text-muted text-xs p-3 rounded-2xl border border-border flex items-center gap-2">
                <span className="animate-spin text-amber-600">⚡</span> Thinking...
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2 border-t border-border p-3 bg-surface/50"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sizes, prices, delivery…"
              className="flex-1 rounded-xl border border-border bg-bg px-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50"
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
        className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-600 hover:bg-amber-700 text-2xl text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
      >
        {open ? '×' : '💬'}
      </button>
    </div>
  );
}
