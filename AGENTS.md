# nxtte — Website Design & Build Specification (Agent Reference)

> Source of truth: `nxtte_website_spec.pdf` (v1.1, light mode, September 2026).
> Prepared for Ms. Nemila (CEO) and Mr. Jay (CTO). nxtte is a sub-brand of Aurexis Solution.
> This file is the complete, structured transcription of that spec for any coding agent
> (Claude, Codex, Cursor, etc.) working in this repo. If this file and the PDF ever
> disagree, the PDF is authoritative — update this file to match, not the other way around.

> **2026 pricing update (supersedes the prices in the v1.1 PDF).** The client's
> *Services & Pricing 2026* sheet replaced the original numbers. The site uses:
> Starter **RM 1,199**/mo, Growth **RM 2,299**/mo (recommended), Pro **RM 3,399**/mo;
> the audit is **RM 199**, credited to month one if they sign within 14 days;
> packages are a **3-month minimum, then month to month** (30 days' notice), not
> "no lock-in"; first content calendar within **5 working days**; package clients get
> **15% off** the menu; Meta/TikTok Ads management **RM 1,200/month or 15% of ad spend,
> whichever is higher**; campaign setup **RM 499** each. Every other rule in this
> document still applies. Where a price below was changed, the old value is noted.

## 0. What this project is

A marketing website for **nxtte**, a social-media/content agency sub-brand of Aurexis
Solution. It is **not** a lead magnet on its own — almost nobody discovers an agency
through its website. The site exists to make nxtte look credible enough to justify a
**monthly retainer** (Growth, RM 2,299/month; was RM 1,590 in v1.1) when a prospect (from an Instagram DM, a referral, or an
Aurexis proposal) checks whether the business is real.

**Governing design principle (applies to every decision in this document):**
> Credibility first, beauty second, cleverness never. A prospect should be able to
> answer four questions in under sixty seconds: What do they do? Who is it for? What
> does it cost? How do I start? Any element that does not serve one of those four
> questions is decoration and should be cut.

### Success criteria

| Measure | Target at launch | Target by month 3 |
|---|---|---|
| Pages live | Home, Audit, Contact | All six plus Audit and Thanks |
| Time to first contentful paint | Under 1.8s on 4G | Under 1.5s |
| Lighthouse performance | 85+ | 95+ |
| Enquiries per month from site | 2 | 6 |
| Audit page conversion rate | Baseline recorded | 5% of visitors |

---

## 1. Positioning & Message Foundation

Every line of copy on the site must derive from this. **Write nothing that contradicts it.**

- **Category promise:** nxtte does not run social media accounts. nxtte builds the
  machine that turns attention into bookings. Content sits at the top of that machine.
  Most agencies sell only the top and have no answer when a client asks why sales
  didn't move.
- **The differentiator:** nxtte is attached to Aurexis Solution. That means the website,
  the landing page, the lead capture, the automation, and the content all come from one
  team. Competing SMMAs hand over reels and stop. This is the only genuine moat nxtte
  has today, and it should be given real estate on the homepage and the About page —
  not buried in a footer.

### Message hierarchy

| Level | What it says | Where it appears |
|---|---|---|
| Primary | Content that produces bookings, not just likes | Hero, meta title, IG bio |
| Secondary | Site, funnel and content from one team | Why nxtte section, About |
| Third | Published pricing, short commitment (3 months, then month to month), fast turnaround | Packages, FAQ, How we work |
| Proof | Our own accounts, built in public, with numbers | Proof strip, Work |

> **Do not write "AI-powered" as a marketing claim.** Every agency in the market now
> says it, so buyers read it as noise. Use AI internally to hold margin at RM
> 1,590/month with a two-person team. That is a weapon, not a headline.

### Tone of voice

- Plain over clever. Short sentences. No agency jargon: no "synergy", no "elevate", no "unlock".
- Specific over vague. Numbers, days, ringgit. "First calendar in 5 working days" beats "fast turnaround".
- Confident, not loud. No exclamation marks. State the price and move on.
- Second person. Speak to the reader as "you", not about "clients".
- English first, with natural Malaysian phrasing where it fits. No forced bahasa pasar.

---

## 2. Sitemap

Six pages appear in navigation. Two exist but are **deliberately unlinked** — they are
destinations for DMs, ads, and form submissions; putting them in the nav would only
give visitors somewhere else to wander.

| # | Route | Page | In nav | Job of the page |
|---|---|---|---|---|
| 1 | `/` | Home | Yes | Sell the whole proposition in one scroll |
| 2 | `/services` | Services | Yes | Answer exactly what is included and what it costs |
| 3 | `/work` | Work | Yes | Prove the work produces results |
| 4 | `/about` | About | Yes | Put faces to the brand and explain the Aurexis link |
| 5 | `/insights` | Insights | Yes | Show ongoing expertise; fed by repurposed content |
| 6 | `/contact` | Contact | Yes | Remove every obstacle between interest and WhatsApp |
| 7 | `/audit` | Audit landing page | No | Convert cold traffic into a paid RM 199 audit (was RM 299) |
| 8 | `/thanks` | Confirmation | No | Set expectations and fire the conversion pixel |

### Two warnings before you build

1. **Work is the page a serious buyer clicks first.** Launching it with two mockups and
   no numbers is worse than not having it. Build it, but keep it out of the nav until
   you have three real pieces with a result attached to each.
2. **A blog carrying no visible dates is public evidence the business went quiet.**
   Insights avoids this by carrying no visible dates and being fed entirely from
   Instagram carousels already being produced. If you cannot commit to that, leave the
   page out until you have ten posts ready.

### Navigation rules

- Sticky header on all pages. Logo left, five text links centre-right, one solid pink
  WhatsApp button far right.
- The WhatsApp button is the only button in the nav. Never place two competing calls to
  action in the header.
- Mobile: logo and WhatsApp button stay visible; the five links collapse into a
  full-screen overlay menu.
- Footer carries the SSM registration number, both social links, an email address, and
  a one-line address. Registration numbers build trust cheaply in the Malaysian market.
- `/audit` uses a stripped header: logo only, no links out.

---

## 3. Page Specification — Home (`/`)

Nine sections in a single scroll. Sections 4, 6, and 7 double as previews that feed
traffic into the deeper pages.

| # | Section | Contains | Background |
|---|---|---|---|
| 1 | Nav | Logo, five links, WhatsApp button, sticky | Ink, translucent on scroll |
| 2 | Hero | Outcome headline, one-line subhead, primary CTA button, "See packages" text link | White |
| 3 | Problem | Three cards: posting with no plan / content that doesn't convert / agency went quiet after month two | Surface tint |
| 4 | Services preview | Four blocks — Content Creation, Social Media Management, Ads & Growth, Brand & Business. Two lines each, link to `/services` | White |
| 5 | Why nxtte | The Aurexis angle plus three proof points | Surface tint |
| 6 | Packages | Three price cards: Starter, Growth (flagged most popular), Scale | Black, full-bleed |
| 7 | Work preview | Three tiles with one result each, link to `/work` | White |
| 8 | Proof strip | nxtte's own account growth, real numbers and dates | Surface tint |
| 9 | Final CTA + footer | RM 199 audit offer, WhatsApp button, SSM number, socials | Black, full-bleed |

### Hero rules

- The headline states an outcome the client wants, never the service you sell. Working
  line: **"Your content should bring in bookings, not just likes."**
- Exactly one primary button. The secondary action is a text link, styled clearly weaker.
- No carousel, no video background, no animated particles. They cost load time and buy nothing.
- The headline must be readable without scrolling on a 375px-wide screen. Test this
  first, not last.

### Packages block — exact contents

| Package | Price | Included |
|---|---|---|
| Starter | RM 1,199/mo (was RM 890) | 1 platform · 12 posts (single image and carousel) · captions and hashtags · monthly content calendar · monthly report |
| Growth | RM 2,299/mo (was RM 1,590) | 2 platforms · 12 posts + 4 reels or TikToks · captions, hashtags and calendar · monthly report · monthly strategy call |
| Pro (was Scale) | RM 3,399/mo (was RM 2,890) | 3 platforms · 16 posts + 6 reels or TikToks · ads management on 1 platform (up to RM 3,000 ad spend a month) · half-day weekend shoot every quarter · report and monthly strategy call |

- Mark **Growth** as the recommended tier and make its card visually heavier. Most
  buyers take the middle option when three are presented; the layout should encourage
  this. Ad spend is always stated as separate from management fees, directly beneath
  the Pro card.
- Packages sits on a full-bleed black section, white text, pink accents — the same
  treatment as the final CTA. On an otherwise white site, these two blocks are the only
  place the original dark brand personality survives, so give them real visual weight
  rather than treating black as just another background option.

---

## 4. Page Specifications — Services, Work, About

### Services (`/services`)

Purpose: answer "what exactly do I get and what does it cost" without a sales call.

- Header — one line on how you work, not a mission statement.
- Four service sections — Content Creation, Social Media Management, Ads & Growth,
  Brand & Business. Each states what is included, who it is for, and a starting price.
- À la carte table — the existing service menu, with firm prices.
- Packages block — reuse the component from Home.
- CTA — audit offer.

> **Delete the words "from RM" everywhere.** "From RM 39" anchors low and tells the
> buyer the price is soft before they've even asked. State a firm price. Where a job
> genuinely varies, write "Quoted after a 15-minute call" instead — that signals
> scoping, not softness. Separately, fill in the four blank prices on the current sheet
> (Meta Ads, TikTok Ads, both campaign setups). **Resolved in the 2026 sheet:** ads
> management **RM 1,200/month or 15% of ad spend, whichever is higher**; each campaign
> setup **RM 499**. (v1.1 had suggested RM 800/month or 18%.) Blank prices mean the
> highest-margin line cannot be sold.

### Work (`/work`)

Purpose: prove the work produces results. Three to six tiles, each opening a short
story rather than a gallery.

- Structure per case: the situation → what nxtte did → what changed, with a number.
- One real number outperforms ten mockups. Reach, follower growth, enquiries, cost per
  lead — any honest metric.
- Until client results exist, the first case is nxtte's own account and the second is
  unpaid work done deliberately to fill this page.
- Never publish a tile without a result. An empty case study reads as inexperience.

### About (`/about`)

Purpose: put faces to the brand. In the Malaysian SME market, buyers hire people, not
logos. This is a selling page, not filler.

- Hero — both founders, named, with real photographs. Not stock, not illustrations.
- Why we started nxtte — three short paragraphs. Honest beats polished.
- How we work — four principles: fast turnaround, published pricing, monthly
  reporting, short commitment (3 months, then month to month; was "no lock-in").
- The Aurexis connection — the strongest block on the page. Explain that the same team
  builds the site and the funnel that the content feeds.
- CTA — WhatsApp.

---

## 5. Page Specifications — Insights, Contact, Audit, Thanks

### Insights (`/insights`)

- Index of cards, newest first, **no visible dates** — this is what stops the page
  ageing badly.
- Post template: title, 400–700 words, one image, CTA at the end.
- Populate entirely by repurposing Instagram carousels already produced. No net-new
  writing commitment.
- Launch with a minimum of six posts, or keep the page out of the nav.

### Contact (`/contact`)

- WhatsApp button is the hero element — the largest object on the page. In this market
  WhatsApp will outperform any form; treat the form as the fallback, not the default.
- Form fields: name, business, Instagram handle, WhatsApp number, service interest.
  **Five fields maximum.**
- State a response promise in writing: **"We reply within 24 hours."**
- Email address and both social links below the fold.

### Audit landing page (`/audit`)

The page most likely to earn money directly. Stripped header, no links out except the logo.

- Hero — "Find out why your content is not converting. RM 199, credited to your first month." (was RM 299)
- What you get — profile and bio teardown, content performance review, competitor
  comparison, gap analysis, 90-day roadmap with weekly deliverables.
- Sample — two or three screenshots of a real audit deliverable. Produce one for a real
  business first, even unpaid, so this section is never empty.
- Turnaround — delivered in five working days, stated plainly.
- The offer — RM 199, fully credited against the first month if they sign within 14 days.
- Form — four fields only: name, business, Instagram handle, WhatsApp number.

> **Why the audit is the most important page on the site.** The audit is not the
> product. The gap it reveals is the product. Build the deliverable so the final
> section is a 90-day roadmap with weekly deliverables attached — a document that is
> obviously useless unless somebody executes it. Crediting the RM 199 against month one
> removes the last reason to hesitate. Expect 30–40% of audits to convert into a
> retainer if the roadmap is specific enough.

### Thanks (`/thanks`)

- Confirmation line with a time promise: **"We will WhatsApp you within 24 hours."**
- WhatsApp button, for anyone who would rather start immediately.
- Links to the nxtte Instagram and TikTok accounts.
- Conversion pixel fires here — this is the only reliable conversion event on the site.

---

## 6. Colour System — Light Mode

The site runs **light mode**: white base, dark ink type, pink reserved for accents and
two full-bleed black sections. This reads more trustworthy to SME buyers, screenshots
better into WhatsApp, and is easier for a two-person team to keep consistent than a
dark theme. The trade-off is differentiation — white-with-an-accent-colour is the
default look for agency sites, so the pink and the two black sections have to work
harder to keep nxtte from blending in.

> **The logo needs a light-mode lockup.** The pink-on-black mark does not sit cleanly
> on white. Do not recolour it — place it inside a solid black rounded container in the
> nav and footer, so the mark keeps its original colours inside its own dark frame.
> **Sample the exact pink from the logo file before writing any CSS** — every other
> pink value below is derived from that one sampled value.

### Core tokens

| Token | Hex | Where it is used |
|---|---|---|
| `--bg` | `#FFFFFF` | Page base for all standard sections |
| `--surface` | `#F7F6F4` | Alternating bands, cards, the Problem and Proof sections |
| `--border` | `#E6E4E1` | Hairlines, dividers, card outlines |
| `--pink` | `#C9507B` | Buttons, links, prices, accent rules — the working text-safe pink |
| `--pink-soft` | `#F2779F` | Large display type, decorative fills only — **never text under 24px** |
| `--pink-tint` | `#FDF2F6` | Highlight blocks, active/selected states |
| `--ink` | `#0A0A0A` | Headings and body copy |
| `--muted` | `#6B6B72` | Captions, labels, form hints, footer text |
| `--ink-section` | `#0A0A0A` | Full-bleed dark break sections — Packages, final CTA |

### Why the pink had to change

The original brand pink, `#F2779F`, was built to sit on black and fails contrast on
white at roughly 2.6:1 — unreadable as text, weak as a button fill. `#C9507B` is a
darker step of the same hue, clears 4.6:1 on white, and becomes the working pink
everywhere text, links, or buttons are involved. The original `#F2779F` is not retired
— it survives as `--pink-soft`, used decoratively at large sizes or as a fill behind
white text, never as small text on a light background.

### The three rules that matter more than the palette

1. Body text is always ink, never pink. `#C9507B` is reserved for links, prices, and
   buttons. `#F2779F` is never used as text at any size under 24px.
2. Primary buttons are a solid `#C9507B` fill with white text. Secondary buttons are a
   1px ink-bordered outline with ink text on transparent. **Never pink text on white**
   — it reads as a disabled state, not a call to action.
3. Packages and the final CTA are full-bleed black sections, white text, `#F2779F`
   accents. These two blocks are where the original dark brand personality survives on
   an otherwise white site — without them the page reads as generic
   agency-with-accent-colour and loses everything that made the logo distinctive in the
   first place.

> ⚠️ **Known spec inconsistency — resolve before building:** Section 9's component
> table lists the secondary button as "1px border in `--border`, white text,
> transparent fill", which contradicts the rule directly above (ink-bordered outline,
> **ink** text, never pink/white text on a white background — white text on a
> transparent fill over a white page would be invisible). This table row reads like an
> unmigrated leftover from the pre-v1.1 dark-mode version of the document. **Treat the
> prose rule above (ink border, ink text) as authoritative** and confirm with
> Ms. Nemila / Mr. Jay before shipping the secondary button style.

### Accessibility floor

Body text must clear 4.5:1 contrast against its background; large headings must clear
3:1.
- `#0A0A0A` on `#FFFFFF` passes comfortably.
- `#C9507B` on `#FFFFFF` clears 4.6:1 and is safe for body-sized links and prices.
- `#F2779F` on `#FFFFFF` fails outright and must never carry text — confine it to
  large decorative shapes or as a fill behind white text on the black sections.
- Check every combination before launch rather than after.

### What this changes elsewhere in the build

- Photography carries more weight. Empty space read as intentional restraint on black;
  on white it reads as an unfinished page. Real founder photos and real work
  screenshots matter more than before, not less.
- Shadows replace some of the contrast that darkness used to provide — use soft,
  low-opacity shadows on cards rather than hard borders everywhere, or the page will
  look flat.
- The nav and footer logo containers (black, rounded) are new components not present
  in the dark-mode version — included in the component library below.

---

## 7. Typography

One typeface across the entire site. A single well-used geometric sans looks more
expensive than two families mixed adequately.

- **Primary:** Satoshi, with General Sans as the alternative. Both are modern
  geometric sans faces with tight, confident letterforms.
- **System fallback stack:** `Inter, -apple-system, Segoe UI, sans-serif`.

> **Do not use a serif.** Serif typography is Aurexis territory. nxtte is the younger,
> faster, social-native sub-brand and should not look like a smaller version of its
> parent. Keeping the two brands visually distinct also means nxtte can eventually be
> sold, spun out, or co-branded without confusing anybody.

### Type scale

| Role | Desktop | Mobile | Weight | Tracking |
|---|---|---|---|---|
| Hero headline | 56–64px | 34–38px | Bold | −2% |
| Section heading | 34–40px | 26–28px | Bold | −1.5% |
| Card title | 20–22px | 18px | Semibold | −0.5% |
| Body | 17px | 16px | Regular | 0 |
| Small / caption | 14px | 13px | Regular | 0 |
| Label / eyebrow | 12px | 11px | Bold, uppercase | +8% |

### Rules

- Line height 1.5 for body, 1.1 for headlines. Do not compress body leading to fit
  more text on screen.
- Maximum line length 68 characters. Full-width paragraphs are the most common
  readability failure.
- Headlines are tight and large. This is where the brand personality lives — do not
  be timid with size.
- Never centre a paragraph longer than two lines.
- Numbers and prices are set in bold weight — they are the most-scanned elements on
  the site.
- **Self-host the font files** rather than calling a third-party CDN. Faster, removes
  an external dependency.

---

## 8. Component Library

Build each component once and compose pages from them. Several homepage sections
reappear on `/services` and `/audit`; duplicating markup is how a two-person team ends
up with a site that is inconsistent within a month.

| Component | Used on | Notes |
|---|---|---|
| Nav bar | All pages | Sticky. Stripped variant for `/audit` with logo only |
| Button — primary | All pages | Solid pink fill, near-black text, 12px radius, no shadow |
| Button — secondary | All pages | 1px ink-bordered outline, ink text, transparent fill — see inconsistency note in §6 above |
| WhatsApp button | Nav, contact, footers | Deep link prefilled with an opening message |
| Problem card | Home | Three across desktop, stacked on mobile |
| Service block | Home, Services | Icon, title, two lines, optional price |
| Package card | Home, Services | Three across; middle card raised with pink border |
| Case tile | Home, Work | Image, client type, one result line |
| Proof stat | Home, About | Large number in pink, label in `--muted` beneath |
| FAQ accordion | Home, Services, Audit | Closed by default; opens one at a time |
| Form | Contact, Audit | Shared component, field set passed as a prop |
| Footer | All pages | SSM number, socials, email, one-line address |
| Logo container (nav/footer) | All pages | New in light mode — solid black rounded container holding the unmodified pink-on-black logo mark |

### Interaction and motion

- Motion is limited to fade-and-rise on scroll, at 200–300ms. Nothing bounces, nothing parallaxes.
- Every interactive element has a visible hover and focus state. **Focus rings must
  never be removed** — they are a keyboard-accessibility requirement, not a style choice.
- Respect `prefers-reduced-motion` and disable all transitions when it is set.
- Minimum touch target 44×44px. Most visitors will arrive from Instagram on a phone.
- Forms validate inline on blur, never only on submit, and never clear what the user
  typed on error.

### FAQ content — the five questions that stall deals

1. How long is the contract, and can I stop?
2. What actually happens in the first month?
3. Who owns the content you produce?
4. Is ad spend included in the management fee?
5. How fast is turnaround once I sign?

Answer these publicly and they stop consuming your time in DMs. Every one of them is a
question a hesitant buyer asks privately before they commit.

---

## 9. Technical Specification

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js (App Router) | Already the in-house standard at Aurexis |
| Hosting | Vercel | Zero-config deploys, preview URLs per branch |
| Styling | Tailwind with the colour tokens above | Tokens defined once in the config |
| Data | Supabase | Form submissions, audit requests, insight posts |
| Forms | Server action → Supabase → email alert | No third-party form service needed |
| Primary contact | WhatsApp deep link | Outperforms forms in this market |
| Images | `next/image`, WebP | Instagram-sourced imagery is heavy and must be compressed |
| Fonts | Self-hosted woff2 | Faster, removes an external dependency |
| Analytics | Vercel Analytics + Meta Pixel | Pixel required for retargeting ad traffic |

### SEO baseline

- Unique title and meta description per page. Titles lead with the outcome, not the
  brand name.
- One H1 per page, containing the primary message.
- LocalBusiness structured data with the SSM number, service area, and both social profiles.
- Open Graph image per page — links get pasted into WhatsApp constantly, and an
  unstyled preview looks careless.
- Sitemap and `robots.txt` generated at build. Submit to Google Search Console on launch day.
- Every image carries descriptive alt text. Serves accessibility first, search second.

### Performance budget

- Total page weight under 1.2MB on the homepage.
- No third-party script that is not analytics or the Meta pixel.
- Largest Contentful Paint under 2.0s on a mid-range Android phone over 4G — **not on your laptop**.
- Test on a real phone on mobile data before launch. Desktop-only testing is how slow sites ship.

### Tracking events to instrument

| Event | Fires when | Why it matters |
|---|---|---|
| `whatsapp_click` | Any WhatsApp button is tapped | The real primary conversion |
| `package_view` | Packages section enters viewport | Shows whether the price kills or converts |
| `audit_submit` | Audit form submitted | The revenue event |
| `contact_submit` | Contact form submitted | Secondary lead |

---

## 10. Build Order & Sequence

Build in **revenue order, not menu order**. The first three pages can earn money on
their own; ship them, go live, and fill in the rest while the site is already working.

| Phase | Build | Output | Effort |
|---|---|---|---|
| 1 | Design tokens, nav, footer, buttons, form component | Foundation everything else composes from | 1 day |
| 2 | Home | The full pitch, live | 1 day |
| 3 | `/audit` and `/thanks` | A page that can take money | Half a day |
| 4 | `/contact` | Enquiries captured | Half a day |
| 5 | **Go live here** | Domain, analytics, Search Console, pixel | Half a day |
| 6 | `/services` | Removes pricing questions from DMs | Half a day |
| 7 | `/about` | Faces and the Aurexis story | Half a day |
| 8 | `/work` | Added to nav only once three real cases exist | 1 day |
| 9 | `/insights` | Six repurposed posts minimum before it goes in the nav | 1 day |

> **Do not wait for completeness to launch.** A live four-page site earning enquiries
> beats a perfect eight-page site that ships in November. Phases 1–5 are roughly three
> and a half days of focused work. Everything after that can be added to a site that is
> already in front of prospects.

### Content that must be gathered before building (client-supplied — do not fabricate placeholders)

- [ ] The exact pink, sampled from the logo file.
- [ ] Founder photographs of Ms. Nemila and Mr. Jay — real, well-lit, not stock.
- [ ] Final firm prices for the four blank ad-service lines (Meta Ads, TikTok Ads, both campaign setups).
- [ ] Screenshots of a completed sample audit deliverable.
- [ ] Current nxtte account metrics, with the dates they were recorded.
- [ ] The SSM registration number and business email address.
- [ ] Three case studies, or an explicit decision to launch without `/work` in the nav.

These are hard blockers for specific sections (proof stats, About hero, footer trust
signals, Work page, firm à la carte pricing). Use clearly-marked `TODO:` placeholders
in code/content and flag them, rather than inventing numbers, photos, or a fake SSM
number.

---

## 11. Pre-Launch Checklist

| Check | Detail |
|---|---|
| [ ] Every price is firm | No instance of the words "from RM" remains anywhere on the site |
| [ ] Four blank ad prices filled | Meta Ads, TikTok Ads, both campaign setups |
| [ ] WhatsApp deep links tested | On a real phone, with the prefilled message appearing correctly |
| [ ] Both forms tested end to end | Submission lands in Supabase and triggers an email alert |
| [ ] `/thanks` fires the pixel | Verified in Meta Events Manager, not assumed |
| [ ] Mobile tested on 4G | Real device, mobile data, not a desktop simulator |
| [ ] Contrast checked | No pink body text anywhere; all body copy clears 4.5:1 |
| [ ] Open Graph previews | Paste every URL into WhatsApp and check the card renders |
| [ ] 404 page exists | Styled, with a route back to Home |
| [ ] Search Console connected | Sitemap submitted on launch day |
| [ ] SSM number in footer | Cheap, powerful trust signal in this market |
| [ ] Instagram bio updated | Link points to `/audit`, not to Home |
| [ ] Aurexis proposal template updated | Carries the nxtte content-retainer line item |

> **The highest-leverage action in this entire document is not on the website.** List
> every Aurexis client from the last eighteen months and send them the `/audit` link. A
> client who has just paid for a website has an obvious, urgent problem — a new site
> with nobody driving traffic to it. That is the easiest retainer conversation
> available, and you are already in the room. The website exists mainly to make that
> conversation credible.

---

*Prepared for Ms. Nemila (CEO) and Mr. Jay (CTO). Spec version 1.1, September 2026 —
updated to the light-mode palette. Revise `nxtte_website_spec.pdf` (and this file to
match it) before deviating from it in the build.*
