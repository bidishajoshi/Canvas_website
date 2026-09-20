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
--------------------------------------------------------------------------------------------------------------------------------------------
# Affordable Decoration — Build Plan

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | SSR/ISR for SEO, API routes for backend |
| Styling | Tailwind CSS + CSS variables for theme | Fast, supports light/dark tokens cleanly |
| Database | Supabase (PostgreSQL) | Relational, built-in RLS, realtime, auth |
| Auth | Supabase Auth | Email/password + role in `profiles.role` |
| Media storage | Cloudinary | Transformations, responsive delivery, secure uploads via signed params |
| Canvas editor | Konva.js (`react-konva`) | Better touch/mobile support than Fabric for drag/zoom/crop panels |
| Chat assistant | Server-side route that does keyword/embedding match against `chat_knowledge`, falls back to "talk to us" — no free-form LLM hallucination of prices |
| Payments | eSewa / Khalti server-side integration, gated by `payment_methods.active` | Never enabled until admin configures real credentials |
| Deployment | Vercel (app) + Supabase (DB/auth/storage) | Standard, reliable for Next.js |

## Folder structure

```
affordable-decoration/
├── app/
│   ├── (site)/                     # public-facing routes
│   │   ├── page.tsx                 # homepage — renders sections from homepage_sections
│   │   ├── shop/
│   │   │   ├── page.tsx
│   │   │   └── [category]/page.tsx
│   │   ├── product/[slug]/page.tsx
│   │   ├── custom-canvas/
│   │   │   ├── page.tsx             # builder entry
│   │   │   └── components/
│   │   │       ├── PhotoUpload.tsx
│   │   │       ├── PanelSelector.tsx
│   │   │       ├── CanvasEditor.tsx      # Konva stage
│   │   │       ├── PanelPreview.tsx
│   │   │       ├── PriceSummary.tsx
│   │   │       └── MockupViewer.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── account/
│   │   │   ├── orders/page.tsx
│   │   │   ├── inquiries/page.tsx
│   │   │   └── wishlist/page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   └── [slug]/page.tsx          # generic CMS pages (privacy, terms, etc.)
│   ├── admin/
│   │   ├── layout.tsx               # auth-gated, role check
│   │   ├── dashboard/page.tsx
│   │   ├── products/
│   │   ├── categories/
│   │   ├── canvas-builder/
│   │   │   ├── panel-types/
│   │   │   ├── sizes/
│   │   │   ├── frames/
│   │   │   └── finishes/
│   │   ├── orders/
│   │   ├── inquiries/
│   │   ├── reviews/
│   │   ├── homepage/                # drag-and-drop section builder
│   │   ├── faqs/
│   │   ├── ai-assistant/
│   │   ├── gallery/
│   │   ├── coupons/
│   │   ├── shipping/
│   │   ├── payments/
│   │   ├── whatsapp/
│   │   ├── social/
│   │   ├── seo/
│   │   └── settings/
│   └── api/
│       ├── products/route.ts
│       ├── canvas/
│       │   ├── configure/route.ts       # save configuration, compute price
│       │   ├── upload/route.ts          # signed Cloudinary upload
│       │   └── inquiry/route.ts
│       ├── orders/route.ts
│       ├── chat/route.ts                # chatbot: knowledge lookup + fallback
│       ├── whatsapp/generate-link/route.ts
│       └── admin/...                    # mirrors admin sections, service-role only
├── lib/
│   ├── supabase/ (client.ts, server.ts, admin.ts)
│   ├── cloudinary.ts
│   ├── pricing.ts                       # single source of truth for price calc
│   ├── whatsapp.ts                      # message template builder
│   └── panel-crop.ts                    # panel-split cropping math
├── components/ui/                       # shared design-system components
├── styles/theme.css                     # light/dark CSS variables
├── schema.sql                           # (this file)
└── supabase/migrations/                 # versioned migrations derived from schema.sql
```

## Design tokens (starting point — refine visually in `frontend-design` pass)

```css
:root {
  --color-bg: #FFFDF9;            /* warm white */
  --color-surface: #F4F2EF;       /* light grey */
  --color-border: #E4E0DA;
  --color-text: #2B2825;          /* dark grey */
  --color-accent-yellow: #F2B705; /* primary CTA */
  --color-accent-pink: #F2A6B0;   /* secondary/badges */
  --color-muted: #8A8580;
}
[data-theme="dark"] {
  --color-bg: #1B1918;            /* charcoal */
  --color-surface: #262422;       /* deep grey */
  --color-border: #37342F;
  --color-text: #F2EFEA;
  --color-accent-yellow: #E0A63B; /* muted warm yellow */
  --color-accent-pink: #C97E8C;   /* muted pink */
  --color-muted: #A6A19A;
}
```
Theme persists via `localStorage` + a `data-theme` attribute on `<html>`, applied before hydration to avoid flash.

## Pricing formula (lib/pricing.ts — single source of truth)

```
final_price = base_price(panel_type, size)
            + size.price_adjustment
            + frame.price
            + finish.price
            - discount
final_price *= quantity
```
Every input comes from the DB (`panel_types`, `canvas_sizes`, `frames`, `finishes`, `coupons`). This function is called both when rendering the live preview price and when the order/inquiry is actually saved server-side — never trust a client-submitted price.

## Chatbot behavior (no hallucination)

1. Normalize the user's question.
2. Search `chat_knowledge` (keyword match, or pgvector embeddings if you want semantic search later) for the best match.
3. If confidence is high enough, return the admin-authored answer.
4. If the question is about price/size/delivery specifically, prefer pulling live values from `canvas_sizes` / `shipping_rules` and interpolating into a templated answer rather than a static `chat_knowledge` row, so it never goes stale.
5. Otherwise return the fallback message with "Chat on WhatsApp" / "Send Inquiry" buttons, and log the row in `chat_logs` with `needs_human = true`.

## Implementation phases (as you specified)

1. **Setup** — repo, Supabase project, run `schema.sql`, Tailwind theme, global layout, header/footer shells.
2. **Admin auth + dashboard shell + media library** — get Cloudinary signed uploads working end-to-end first, since almost everything else depends on it.
3. **Catalog admin** — categories, products, panel types, sizes, frames, finishes (CRUD screens).
4. **Homepage + shop + product page** — reading from real data, no hardcoding.
5. **Custom Canvas Builder** — upload → panel select → Konva editor → live preview → price calc. This is the highest-effort phase; build 1-panel first, then extend to 3/5 panel splitting.
6. **Inquiries, WhatsApp, cart, checkout, orders.**
7. **AI chat assistant + knowledge base + logs.**
8. **Reviews, FAQ, About, Contact, social.**
9. **SEO, performance, security hardening, analytics.**
10. **Testing pass** against the checklist in your spec, then deploy.

## Why Claude Code for the actual build

This chat environment has no network access, so I can hand you complete, correct source files and the schema, but I can't install real npm packages, run this against a live Supabase instance, or verify it end-to-end here. Claude Code (terminal, VS Code/JetBrains, or the desktop app) can create the repo, run `npm install`, apply migrations to a real Supabase project, and actually run/deploy the app — which matters a lot for a system this size, since you'll want to test each phase as it's built rather than receive one untested mega-drop at the end.
