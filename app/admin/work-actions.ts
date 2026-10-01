'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { parseFaqs } from '@/lib/content-seo'

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

const metric = z.object({ value: z.string().trim().max(20), label: z.string().trim().max(80) })

const caseSchema = z.object({
  id: z.string().regex(UUID_RE).optional(),
  headline: z.string().trim().min(1, 'Add a headline.').max(160),
  slug: z.string().trim().max(80).regex(SLUG_RE, 'The URL can only use lowercase letters, numbers and dashes.'),
  clientName: z.string().trim().max(100),
  clientType: z.string().trim().max(100),
  caseType: z.enum(['client', 'own', 'trial']),
  category: z.enum(['social', 'content', 'growth', 'brand', 'start']),
  resultValue: z.string().trim().max(20),
  resultLabel: z.string().trim().max(80),
  resultPeriod: z.string().trim().max(60),
  situation: z.string(),
  whatWeDid: z.string(),
  whatChanged: z.string(),
  metrics: z.array(metric).max(3),
  services: z.array(z.string().trim().min(1).max(60)).max(12),
  gallery: z.array(z.object({ url: z.string().url(), alt: z.string().trim().max(200) })).max(8),
  beforeImageUrl: z.string().url().nullable(),
  afterImageUrl: z.string().url().nullable(),
  testimonialQuote: z.string().trim().max(400),
  testimonialAuthor: z.string().trim().max(100),
  coverImageUrl: z.string().url().nullable(),
  coverAlt: z.string().trim().max(200),
  sortOrder: z.number().int().min(0).max(999),
  status: z.enum(['draft', 'published']),
  // SEO and AEO (migration 0012). All optional.
  seoTitle: z.string().trim().max(120).default(''),
  metaDescription: z.string().trim().max(300).default(''),
  focusKeyword: z.string().trim().max(80).default(''),
  noindex: z.boolean().default(false),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).max(8).default([]),
})

export type CaseInput = z.input<typeof caseSchema>

// AGENTS.md: never publish a tile without a result.
function publishProblem(v: z.output<typeof caseSchema>) {
  if (!v.resultValue || !v.resultLabel) return 'Add the result number and what it measures. A case never goes live without a result.'
  if (!v.resultPeriod) return 'Say when or over what period the result was measured, for example "in the first 30 days".'
  if (!v.clientType) return 'Add the client type, for example "Café, Petaling Jaya".'
  if (!v.situation.trim() || !v.whatWeDid.trim() || !v.whatChanged.trim()) return 'Fill in all three parts of the story before publishing.'
  if (!v.coverImageUrl) return 'Add a cover image before publishing.'
  if (!v.coverAlt) return 'Describe the cover image (alt text) before publishing.'
  if (v.gallery.some((g) => !g.alt)) return 'Describe every gallery image before publishing.'
  if (Boolean(v.beforeImageUrl) !== Boolean(v.afterImageUrl)) return 'Add both a before and an after image, or neither.'
  return null
}

function refreshPublic(...slugs: (string | undefined)[]) {
  revalidatePath('/work')
  slugs.filter(Boolean).forEach((s) => revalidatePath(`/work/${s}`))
  revalidatePath('/sitemap.xml')
  revalidatePath('/admin/work')
}

export async function saveCaseStudy(input: CaseInput): Promise<Result<{ id: string }>> {
  await requireAdmin()
  const parsed = caseSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the fields and try again.' }
  const v = parsed.data
  if (v.status === 'published') {
    const problem = publishProblem(v)
    if (problem) return { ok: false, error: problem }
  }

  const db = supabaseAdmin()
  let previous: { slug: string; published_at: string | null } | null = null
  if (v.id) {
    const { data } = await db.from('case_studies').select('slug, published_at').eq('id', v.id).maybeSingle()
    previous = data
  }

  const row = {
    slug: v.slug,
    headline: v.headline,
    client_name: v.clientName,
    client_type: v.clientType,
    case_type: v.caseType,
    category: v.category,
    result_value: v.resultValue,
    result_label: v.resultLabel,
    result_period: v.resultPeriod,
    situation: v.situation,
    what_we_did: v.whatWeDid,
    what_changed: v.whatChanged,
    metrics: v.metrics.filter((m) => m.value && m.label),
    services: v.services,
    gallery: v.gallery,
    before_image_url: v.beforeImageUrl,
    after_image_url: v.afterImageUrl,
    testimonial_quote: v.testimonialQuote,
    testimonial_author: v.testimonialAuthor,
    cover_image_url: v.coverImageUrl,
    cover_alt: v.coverAlt,
    sort_order: v.sortOrder,
    status: v.status,
    seo_title: v.seoTitle,
    meta_description: v.metaDescription,
    focus_keyword: v.focusKeyword,
    noindex: v.noindex,
    faqs: parseFaqs(v.faqs),
    published_at: previous?.published_at ?? (v.status === 'published' ? new Date().toISOString() : null),
  }

  const query = v.id
    ? db.from('case_studies').update(row).eq('id', v.id).select('id').single()
    : db.from('case_studies').insert(row).select('id').single()
  const { data, error } = await query
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'That URL is already used by another case study.' }
    console.error('[admin] saveCaseStudy failed', error.message)
    return { ok: false, error: 'Could not save. Try again.' }
  }

  refreshPublic(v.slug, previous?.slug !== v.slug ? previous?.slug : undefined)
  return { ok: true, id: data.id }
}

export async function deleteCaseStudy(id: string): Promise<Result> {
  await requireAdmin()
  if (!UUID_RE.test(id)) return { ok: false, error: 'Unknown case study.' }
  const db = supabaseAdmin()
  const { data } = await db.from('case_studies').select('slug').eq('id', id).maybeSingle()
  const { error } = await db.from('case_studies').delete().eq('id', id)
  if (error) {
    console.error('[admin] deleteCaseStudy failed', error.message)
    return { ok: false, error: 'Could not delete. Try again.' }
  }
  refreshPublic(data?.slug)
  return { ok: true }
}
