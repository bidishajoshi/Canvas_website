# Affordable Decoration

A Next.js 14 (App Router) + TypeScript + Supabase + Cloudinary e-commerce
platform for a Nepal-based custom canvas business, per the original spec.
Every customer-facing price, product, size, frame, page, and setting is
stored in the database and edited from `/admin` — nothing is hardcoded.

## ⚠️ Before you run this

This codebase was written in an offline sandbox with **no network access**,
so it has never been through `npm install`, `next build`, or a real
TypeScript compiler. Every file was hand-written and cross-checked for
consistent imports, types, and field names, but that is not the same as a
verified build. **The first thing to do is:**

```bash
npm install
npm run typecheck   # tsc --noEmit — this is the real test
npm run dev
```

Fix whatever `typecheck` surfaces (most likely: dependency version drift,
since the versions in `package.json` are my best current recollection, not
a locked/tested set). If you want a faster, more reliable path than
copy-pasting these files into a fresh project, doing this same build
inside **Claude Code** (terminal, VS Code/JetBrains, or desktop) would let
each phase actually run and get fixed on the spot instead of receiving one
untested drop.

## 1. Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` (or the copy at the repo root) in the SQL
   editor — this creates every table.
3. Enable Row Level Security and add policies per the sketch at the bottom
   of `schema.sql` (public read on published content, customers restricted
   to their own rows, admin routes use the service-role key).
4. Create a Cloudinary account, note your cloud name / API key / secret.
5. Copy `.env.example` to `.env.local` and fill in real values.
6. In Supabase Auth, create your first user, then in the SQL editor:
   ```sql
   update profiles set role = 'admin' where id = '<your-user-uuid>';
   ```
   (If the `profiles` row doesn't exist yet, insert one — a trigger to
   auto-create it on signup is a good next addition; it isn't included
   here.)
7. Insert a `settings` row (id defaults to `true`) either via the SQL
   editor or by visiting `/admin/settings` once logged in as admin — the
   page upserts one for you.

## 2. What's fully built

- Theme system (light/dark, yellow/grey/pink, persisted, no flash)
- Homepage with admin-ordered/toggleable sections
- Shop + product detail pages, reviews, related products
- **Custom Canvas Builder**: photo upload (Cloudinary signed direct
  upload), panel type/size/frame/finish selection, live Konva-based
  preview with shared pan/zoom across 1/3/5 panels, image-quality
  heuristic, server-side authoritative price calculation, Add to
  Cart / Send Inquiry / Ask on WhatsApp
- Cart (localStorage) → Checkout (Nepal address fields, live payment
  methods & shipping zones) → Order confirmation/tracking
- AI chat widget that answers from live DB values (sizes/prices/shipping)
  and admin-authored `chat_knowledge`, with an honest fallback — it never
  invents a price
- Admin: auth-gated shell, dashboard metrics, full CRUD for Products and
  Categories, Canvas Builder settings (panel types/sizes/frames/finishes),
  Orders and Inquiries with status workflows, Settings (business info,
  WhatsApp number, socials)
- Customer account: profile/orders/inquiries/wishlist

## 3. What's scaffolded but not fully built

These admin sections render an honest placeholder pointing at the already-
defined table, rather than fake functionality: **Homepage Builder (drag-
and-drop ordering), Reviews, FAQs, Gallery, AI Assistant knowledge base
editor, Shipping, Payments, Social links, SEO, Coupons.** Every one of
these tables already exists in `schema.sql` and is readable through the
patterns used elsewhere (e.g. `/admin/categories` or `/admin/canvas-
builder` — Server Component list + Server Action form). Wiring up the
remaining screens is mechanical repetition of that same pattern.

Also not implemented: eSewa/Khalti live payment gateway integration
(the `payment_methods` table and checkout flow support it structurally,
but no gateway SDK calls are wired in — per the spec, don't enable a
payment method until it's actually configured), email/SMS notification
delivery (in-app `notifications` rows are created; sending them out is
not), and a Supabase Auth trigger to auto-create `profiles` rows on
signup.

## 4. Known simplifications worth knowing about

- **Panel cropping**: all panels of a multi-panel canvas currently share
  one continuous pan/zoom transform (this is what "one photo split across
  3 panels" visually means). Independent per-panel fine-tuning is a
  reasonable v2 addition — the `crop_data` schema already supports a
  per-panel array.
- **Inquiry numbers** use a random suffix (`AD-INQ-2026-XXXXXX`), not a
  guaranteed-sequential counter. Swap for a Postgres sequence if you need
  strict sequencing.
- **Custom canvas cart pricing**: the per-unit price for a cart line item
  is derived by dividing the configuration's server-calculated total by
  its saved quantity. This is correct as long as quantity doesn't change
  between "Add to Cart" and checkout in a way that should re-trigger
  pricing tiers — fine for a flat per-unit pricing model, worth revisiting
  if you ever add quantity discounts.
