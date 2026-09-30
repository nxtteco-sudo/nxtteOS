# CLAUDE.md — nxtte website

This file is what Claude Code loads automatically for this repo. The **complete**
content + design + technical specification (every section, table, and warning from
`nxtte_website_spec.pdf`) lives in [`AGENTS.md`](./AGENTS.md) — read it before building
any page. This file is the operating layer on top of it: non-negotiable rules, tech
conventions, repo structure, and which installed skill/agent to reach for.

## What we're building

A marketing site for **nxtte** (social-media/content agency, sub-brand of Aurexis
Solution). The site's only job is to make nxtte look credible enough to justify a
**monthly retainer** (Growth, RM 2,299/month under the 2026 pricing). Governing principle: *credibility first, beauty second,
cleverness never.* If an element doesn't help a visitor answer "what do they do / who's
it for / what does it cost / how do I start" in under 60 seconds, cut it.

**2026 pricing (live on the site; supersedes the v1.1 PDF):** Starter RM 1,199,
Growth RM 2,299 (recommended), Pro RM 3,399 a month · RM 199 audit, credited to month one
within 14 days · 3-month minimum, then month to month (30 days' notice) · first calendar
in 5 working days · 15% off the menu for package clients · ads management RM 1,200/month
or 15% of ad spend, whichever is higher · campaign setup RM 499. Package and menu data
live in `components/home/home-page.tsx` (`packages`, `MENU`). See the note at the top of
AGENTS.md.

Full spec: [`AGENTS.md`](./AGENTS.md). Original source PDF: `nxtte_website_spec.pdf`
(do not delete — it's the ground truth if this file or AGENTS.md ever drift).

## Non-negotiable rules (check every PR against these)

1. **Never write "from RM" anywhere.** State a firm price, or "Quoted after a
   15-minute call." (Section 4/§Services of AGENTS.md)
2. **Never use "AI-powered" as a marketing claim.** It's internal leverage, not a headline.
3. **No exclamation marks, no agency jargon** ("synergy", "elevate", "unlock"). Plain,
   specific, second person. See AGENTS.md §1 tone of voice.
4. **Pink (`#F2779F` / `--pink-soft`) is never text under 24px.** Body text is always
   ink (`#0A0A0A`). Only `#C9507B` (`--pink`) is safe as body-sized link/price/button text
   (4.6:1 contrast). Check every color combo against the 4.5:1 (body) / 3:1 (large
   heading) floor before shipping a page.
5. **Do not recolour the logo.** Place it in a solid black rounded container on white
   backgrounds (nav, footer) rather than recoloring the mark itself.
6. **No serif font, anywhere.** Serif is Aurexis's territory, not nxtte's.
7. **WhatsApp is the primary CTA everywhere**, not a form. Forms are a fallback (Contact)
   and are capped at 5 fields (Contact) / 4 fields (Audit).
8. **Motion is fade-and-rise only, 200–300ms.** No bounce, no parallax, no carousels, no
   video backgrounds. Always respect `prefers-reduced-motion`.
9. **Focus rings are never removed.** 44×44px minimum touch target everywhere.
10. **Don't fabricate placeholder content** for the items listed in "Content gaps" below
    (SSM number, founder photos, real prices, real metrics, case studies). Use visible
    `TODO:` markers instead of inventing numbers or photos.
11. **`/work` only goes into the nav once 3 real case studies with a result exist.**
    `/insights` only goes into the nav once 6 posts exist. Both pages can be built, just
    kept unlinked until then (see Sitemap, AGENTS.md §2).
12. ⚠️ **Known spec inconsistency to resolve before implementing the secondary button:**
    AGENTS.md §6 flags a contradiction between the component table (white text) and the
    colour-system prose (ink text) for the secondary button. Default to **ink-bordered
    outline, ink text, transparent fill** per the prose rule, but confirm with the client
    before finalizing.

## Tech stack & conventions

| Layer | Choice |
|---|---|
| Framework | Next.js, App Router |
| Language | TypeScript |
| Styling | Tailwind CSS, colour tokens defined once in `tailwind.config` (see token table below) |
| Data | Supabase (Postgres) — form submissions, audit requests, insight posts |
| Forms | Server Action → Zod validation → Supabase insert → email alert. No third-party form service. |
| Hosting | Vercel |
| Images | `next/image`, WebP, compressed (source imagery is Instagram-sourced and heavy) |
| Fonts | Self-hosted `.woff2` (Satoshi primary, General Sans alt, system fallback: `Inter, -apple-system, Segoe UI, sans-serif`) — no third-party font CDN |
| Analytics | Vercel Analytics + Meta Pixel only. No other third-party scripts. |

### Architecture defaults

- **Server Components by default.** Only mark a component `'use client'` when it needs
  interactivity (accordion, mobile nav overlay, form inputs). Keep client components
  minimal — extract logic to hooks where it grows.
- **Server Action pattern for both forms** (`/contact`, `/audit`):
  ```ts
  'use server'
  import { z } from 'zod'
  import { createServerClient } from '@/lib/supabase/server'

  const schema = z.object({
    name: z.string().min(1).max(100),
    // ...remaining fields per form, see AGENTS.md §5 for exact field lists
  })

  export async function submitContactForm(formData: FormData) {
    const parsed = schema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { success: false, error: parsed.error.flatten() }

    const supabase = await createServerClient()
    const { error } = await supabase.from('contact_submissions').insert(parsed.data)
    if (error) return { success: false, error: 'Failed to submit' }

    // trigger email alert here
    return { success: true }
  }
  ```
  (Adapted from ECC's `saas-nextjs` example — this project has no auth/billing, so skip
  the `getUser()`/RLS-per-user parts of that template; forms here are unauthenticated
  public submissions into Supabase.)
- **No `select('*')`** — explicit column lists on every Supabase query.
- **Inline validation on blur, never only on submit.** Never clear what the user typed
  on a validation error (AGENTS.md §8).
- **Instrument the 4 tracking events** (`whatsapp_click`, `package_view`, `audit_submit`,
  `contact_submit`) — see AGENTS.md §9.
- Immutable patterns — spread, don't mutate. No emojis in code, comments, or copy.

### Design tokens (Tailwind config source of truth — full context in AGENTS.md §6)

```
--bg:          #FFFFFF   page base
--surface:     #F7F6F4   alternating bands / cards
--border:      #E6E4E1   hairlines / dividers
--pink:        #C9507B   buttons / links / prices (text-safe, 4.6:1 on white)
--pink-soft:   #F2779F   large decorative fills ONLY, never text <24px
--pink-tint:   #FDF2F6   highlight / active states
--ink:         #0A0A0A   headings + body copy
--muted:       #6B6B72   captions / labels / hints / footer text
--ink-section: #0A0A0A   full-bleed dark sections (Packages, final CTA)
```

Type scale, exact weights/tracking per role: AGENTS.md §7.

## Dashboards (added after the v1.1 spec, at the client's request)

The marketing spec has no accounts. The client asked for two dashboards on top of it:

- **Customer dashboard, `/my`.** Booking the audit (still 4 fields) creates the customer's
  private link and signs them in. No passwords: a long random token (only its SHA-256 hash
  is stored, `audit_tokens`) held in an httpOnly cookie; `/my/open/[token]` opens a link.
  Email is asked on the dashboard, after which "email me my link" works. Screens: overview
  with tracker, details, payment (bank/DuitNow, customer claims, admin confirms), messages,
  report download + 14-day credit countdown. Code: `app/my`, `components/my`, `lib/customer.ts`.
- **Admin, `/admin`.** Supabase Auth + `admin_users` allowlist. Overview, Leads (contact
  form), Audits (mark paid, start, upload report, reply, customer link), Insights, Work,
  Settings (payment details shown to customers). Code: `app/admin`, `components/admin`.
- **Rules:** every `/my` and `/admin` read and write goes through the service role on the
  server after a token or admin check; tables have RLS on and no public policies. Reports
  and receipts live in the private `nxtte-private` bucket behind short-lived signed links.
  Emails go through Resend (`lib/email.ts`) and are skipped, never fatal, without a key.
- **Payments:** manual for now ("Mark as paid"). HitPay is planned after launch; it should
  set `payment_status = 'paid'` from a signature-verified webhook, never from the redirect.
- **Interpretation to confirm with the client:** the 14-day credit counts from the day the
  report is delivered (`creditDeadline` in `types/audit.ts`).
- Migrations `0001` to `0006` must be run in order. `/privacy` describes all of this; update
  it whenever a form, tool or provider changes.

## Repo structure to build toward

```
app/
  (marketing)/
    page.tsx              # Home /
    services/page.tsx
    work/page.tsx
    about/page.tsx
    insights/page.tsx
    insights/[slug]/page.tsx
    contact/page.tsx
  audit/page.tsx           # stripped header, unlinked from nav
  thanks/page.tsx          # unlinked, fires conversion pixel
  layout.tsx               # root layout, fonts, analytics
  not-found.tsx            # styled 404 with route back to Home
  api/                      # only if a webhook/route handler is unavoidable
components/
  ui/                      # Button (primary/secondary), WhatsAppButton, FAQAccordion, Form
  marketing/                # ProblemCard, ServiceBlock, PackageCard, CaseTile, ProofStat
  layout/                   # NavBar, Footer, LogoContainer
lib/
  supabase/                # server + browser client factories
  whatsapp.ts              # deep-link builder with prefilled message
  analytics.ts             # event helpers for the 4 tracked events
  validation/              # Zod schemas per form
supabase/
  migrations/              # contact_submissions, audit_requests, insight_posts tables
content/
  insights/                # repurposed-post markdown/MDX, if not stored in Supabase
public/
  fonts/                   # self-hosted Satoshi / General Sans woff2
  images/                  # compressed WebP assets
```

Build in the **revenue order** from AGENTS.md §10, not top-to-bottom nav order:
tokens/nav/footer/buttons/form → Home → `/audit` + `/thanks` → `/contact` → **go live**
→ `/services` → `/about` → `/work` → `/insights`.

## Content gaps — do not fabricate, flag instead

These are client-supplied and currently missing (AGENTS.md §10). If a task touches one
of these, insert a visible `TODO:` and say so rather than inventing a value:

- Exact pink sampled from the logo file (we're using the spec's derived `#C9507B` /
  `#F2779F` until the real file is sampled)
- ~~Founder photos~~ supplied: public/team/*-portrait.jpg (originals in assets/team)
- ~~Firm prices for Meta Ads / TikTok Ads management + setup~~ Resolved in the 2026
  sheet: RM 1,200/month or 15% of ad spend, whichever is higher; setup RM 499.
- Real audit-deliverable screenshots: client decision, keep the labelled example report
  (fictional "sample.cafe") on /audit until a real audit exists.
- Current nxtte account metrics + dates: client decision, show no metrics anywhere until
  real, dated numbers exist (the homepage proof strip was removed).
- Meta Pixel ID: deferred by the client (no ads yet). /thanks already calls fbq("track", "Lead"),
  which is a no-op until the base script and ID are added. Add a privacy notice at the same time.
- Supplied and in use (lib/site.ts, lib/whatsapp.ts, public/brand): SSM NS0315281-P,
  WhatsApp +60 11-7472 1429, contact@nxtte.com, @nxtte.co on Instagram and TikTok,
  domain nxtte.com, and the logo (original in assets/nxtte-logo-original.jpg)
- 3 case studies for `/work` (or an explicit decision to launch without `/work` in nav)

## Installed skills — what's active in `.claude/skills/`, and when to reach for each

| Skill | Use it for |
|---|---|
| `frontend-patterns` | General Next.js/React component + app-router structure decisions |
| `nextjs-turbopack` | Next.js build/dev tooling, Turbopack-specific config |
| `accessibility` | WCAG 2.2 AA checks generally (contrast, semantics) |
| `frontend-a11y` | Implementation-level a11y: ARIA, focus management, keyboard nav, form labeling |
| `seo` | Per-page metadata, structured data, sitemap/robots, OG images (AGENTS.md §9) |
| `api-design` | Server Action / route-handler shape and error-response conventions |
| `design-system` | Building/auditing the shared component library (AGENTS.md §8) so Home/Services/Audit don't drift |
| `make-interfaces-feel-better` | Polish pass on spacing, hit areas, hover/focus states, text wrapping |
| `motion-foundations` | Implementing the fade-and-rise scroll motion + `prefers-reduced-motion` handling |
| `brand-voice` | Writing on-brand copy for any page — build the voice profile from AGENTS.md §1 tone rules before drafting copy |
| `postgres-patterns` | Supabase schema/index/RLS design for the 3 tables (contact, audit, insights) |
| `database-migrations` | Writing/reviewing the Supabase migration files safely |
| `deployment-patterns` | Vercel deploy setup, production-readiness before "go live" (Phase 5) |
| `canary-watch` | Post-deploy verification — maps almost 1:1 to the Pre-Launch Checklist (AGENTS.md §11): WhatsApp links, form submissions, pixel firing, OG previews |

## Installed agents — what's active in `.claude/agents/`

| Agent | Use it for |
|---|---|
| `react-reviewer` | Reviewing any `.tsx` component change |
| `a11y-architect` | Proactive accessibility review when building UI components/forms |
| `seo-specialist` | Reviewing metadata, structured data, sitemap work |
| `performance-optimizer` | Checking the page-weight (<1.2MB) and LCP (<2s on 4G Android) budgets before shipping a page |

Everything else (287 other skills, 64 other agents, all 97 commands, and the rest of
the ECC monorepo source) is archived, not deleted, in `.claude/_unused/` and
`_ecc-source/` at the repo root — restore anything from there if a task turns out to
need it.

## Pre-launch checklist reminder

Full checklist in AGENTS.md §11 — the one item that isn't a code task: **after launch,
send the `/audit` link to every Aurexis client from the last 18 months.** That's called
out in the spec as the single highest-leverage action in the whole document.
