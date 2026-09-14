'use client';

import { useState } from 'react';

export function ReviewSubmissionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        body: JSON.stringify({
          customer_name: name,
          location,
          rating,
          comment,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch {
      setError('Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-bg border border-border rounded-3xl p-6 shadow-2xl z-10">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <h3 className="font-display font-bold text-lg text-text">Write a Customer Review</h3>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-text"
            >
              ✕
            </button>
          </div>

          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <div className="text-4xl">⏳</div>
              <h4 className="font-bold text-base text-text">Review Submitted for Moderation!</h4>
              <p className="text-xs text-muted leading-relaxed">
                Thank you! Your feedback has been received and sent to our admin team. It will appear publicly on the website once approved.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Your Rating</label>
                <div className="flex items-center gap-2 text-2xl text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform active:scale-125"
                    >
                      {star <= rating ? '★' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anjali Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Location / City</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kathmandu / Pokhara"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Your Review / Experience *</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about the print quality, frame finish, or delivery experience..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              {error && <div className="text-xs text-rose-600 font-semibold">{error}</div>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review for Approval ✍️'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
