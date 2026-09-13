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
