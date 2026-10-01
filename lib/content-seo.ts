// SEO and AEO rules for Insights posts and case studies: the live checklist and
// score in the editors, and the author list shared with the public post page.
// Pure, no imports, so it loads on the server and in the browser.

export const AUTHORS = [
  { slug: 'nemila', name: 'Ms. Nemila', schemaName: 'Nemila', role: 'CEO, co-founder', photo: '/team/nemila-portrait.jpg' },
  { slug: 'jay', name: 'Mr. Jay', schemaName: 'Jay', role: 'CTO, co-founder', photo: '/team/jay-portrait.jpg' },
] as const
export type AuthorSlug = (typeof AUTHORS)[number]['slug']
export const authorBySlug = (slug?: string | null) => AUTHORS.find((a) => a.slug === slug) ?? null

export type Faq = { q: string; a: string }
export const MAX_FAQS = 8

/** Google shows roughly 60 characters of a title and 155 to 160 of a description. */
export type Bands = [[number, number], [number, number]]
export const TITLE_BANDS: Bands = [[30, 60], [20, 70]]
export const DESCRIPTION_BANDS: Bands = [[120, 160], [70, 200]]

export type CheckStatus = 'good' | 'ok' | 'bad'
export type SeoCheck = { key: string; status: CheckStatus; label: string }

export function lengthStatus(len: number, good: [number, number], ok: [number, number]): CheckStatus {
  if (len >= good[0] && len <= good[1]) return 'good'
  if (len >= ok[0] && len <= ok[1]) return 'ok'
  return 'bad'
}

const stripMarkdown = (s: string) =>
  s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s*(#{1,6}|[-*+]|\d+\.|>)\s+/gm, '')
    .replace(/[*_`~]/g, '')

export const countWords = (body: string) => stripMarkdown(body).split(/\s+/).filter((w) => /\w/.test(w)).length

/** The first line of real prose (not a heading, image, list or quote). */
export function firstParagraph(body: string): string {
  return body.split('\n').map((l) => l.trim()).find((l) => l && !/^(#{1,6}\s|!\[|[-*+]\s|\d+\.\s|>)/.test(l)) ?? ''
}

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
const has = (text: string, kw: string) => !!kw && ` ${norm(text)} `.includes(` ${norm(kw)} `)
const cleanFaqs = (faqs: Faq[] = []) => faqs.filter((f) => f.q.trim() && f.a.trim())

export type SeoInput = {
  kind: 'post' | 'case'
  title: string
  seoTitle: string
  metaDescription: string
  /** Post summary, or the case study's result line, used when the description is empty. */
  fallbackDescription: string
  slug: string
  /** Post body, or the three case study story sections joined. */
  body: string
  focusKeyword: string
  coverImageUrl: string | null
  coverAlt: string
  takeaways?: string
  faqs?: Faq[]
}

/** The text used on Google when the SEO fields are left empty. */
export const shownTitle = (p: Pick<SeoInput, 'seoTitle' | 'title'>) => (p.seoTitle || p.title).trim()
export const shownDescription = (p: Pick<SeoInput, 'metaDescription' | 'fallbackDescription'>) => (p.metaDescription || p.fallbackDescription).trim()

export function seoChecks(p: SeoInput): SeoCheck[] {
  const title = shownTitle(p)
  const description = shownDescription(p)
  const kw = p.focusKeyword.trim()
  const words = countWords(p.body)
  const headings = p.body.split('\n').filter((l) => /^#{2,3}\s/.test(l.trim()))
  const images = [...p.body.matchAll(/!\[([^\]]*)\]\([^)]*\)/g)].map((m) => m[1].trim())
  const internal = /\]\((\/(services|audit|contact|insights|work|about)|https?:\/\/(www\.)?nxtte\.com)/i.test(p.body)
  const slugWords = p.slug.split('-').filter(Boolean)
  const faqs = cleanFaqs(p.faqs)
  const isPost = p.kind === 'post'

  const out: SeoCheck[] = [
    { key: 'title', status: lengthStatus(title.length, ...TITLE_BANDS), label: `Search title is ${title.length} characters (aim for 30 to 60)` },
    { key: 'description', status: description ? lengthStatus(description.length, ...DESCRIPTION_BANDS) : 'bad', label: description ? `Description is ${description.length} characters (aim for 120 to 160)` : 'Add a search description' },
  ]

  if (!kw) {
    out.push({ key: 'keyword', status: 'ok', label: 'Add a focus keyword to unlock the keyword checks' })
  } else {
    out.push(
      { key: 'kwTitle', status: has(title, kw) ? 'good' : 'bad', label: 'Focus keyword in the search title' },
      { key: 'kwDescription', status: has(description, kw) ? 'good' : 'bad', label: 'Focus keyword in the description' },
      { key: 'kwSlug', status: norm(kw).split(' ').every((w) => slugWords.includes(w)) ? 'good' : 'bad', label: 'Focus keyword in the URL' },
      { key: 'kwIntro', status: has(firstParagraph(p.body), kw) ? 'good' : 'bad', label: 'Focus keyword in the first paragraph' },
    )
    if (isPost) out.push({ key: 'kwHeading', status: headings.some((h) => has(h, kw)) ? 'good' : 'bad', label: 'Focus keyword in a subheading' })
  }

  if (isPost) {
    out.push(
      { key: 'length', status: words >= 400 && words <= 900 ? 'good' : words >= 250 ? 'ok' : 'bad', label: `${words} words (aim for 400 to 700)` },
      { key: 'headings', status: headings.length >= 2 ? 'good' : headings.length === 1 ? 'ok' : 'bad', label: `${headings.length} subheading${headings.length === 1 ? '' : 's'} (use 2 or more)` },
      { key: 'internalLink', status: internal ? 'good' : 'ok', label: internal ? 'Links to another nxtte page' : 'Link to Services, the audit or another post' },
      { key: 'takeaways', status: (p.takeaways ?? '').trim().length >= 40 ? 'good' : 'ok', label: 'Key takeaways at the top (AI answers quote these)' },
    )
  } else {
    out.push({ key: 'story', status: words >= 150 ? 'good' : words >= 60 ? 'ok' : 'bad', label: `${words} words across the story (aim for 150 or more)` })
  }

  out.push({ key: 'faqs', status: faqs.length >= 2 ? 'good' : faqs.length === 1 ? 'ok' : 'ok', label: faqs.length ? `${faqs.length} question${faqs.length === 1 ? '' : 's'} answered (2 or more is best)` : 'Answer 2 or 3 common questions (helps Google and AI answers)' })

  if (images.length) {
    const missing = images.filter((a) => !a || a === 'describe the image').length
    out.push({ key: 'imageAlt', status: missing ? 'bad' : 'good', label: missing ? `${missing} image${missing > 1 ? 's' : ''} missing a description` : 'Every image has a description' })
  }
  out.push(
    { key: 'cover', status: p.coverImageUrl ? (p.coverAlt.trim() ? 'good' : 'ok') : 'ok', label: p.coverImageUrl ? (p.coverAlt.trim() ? 'Cover image with a description' : 'Describe the cover image') : 'Add a cover image for shares' },
    { key: 'slug', status: p.slug && p.slug.length <= 60 && slugWords.length <= 6 ? 'good' : 'ok', label: 'Short, readable URL (6 words or fewer)' },
  )
  return out
}

const POINTS: Record<CheckStatus, number> = { good: 1, ok: 0.5, bad: 0 }
export const seoScore = (checks: SeoCheck[]) => (checks.length ? Math.round((checks.reduce((n, c) => n + POINTS[c.status], 0) / checks.length) * 100) : 0)

/** FAQs from the database or a form, cleaned and capped. */
export function parseFaqs(raw: unknown): Faq[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((r) => (r && typeof r === 'object' ? (r as Record<string, unknown>) : {}))
    .map((r) => ({ q: String(r.q ?? '').trim().slice(0, 200), a: String(r.a ?? '').trim().slice(0, 800) }))
    .filter((f) => f.q && f.a)
    .slice(0, MAX_FAQS)
}
