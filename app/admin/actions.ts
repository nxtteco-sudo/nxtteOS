'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getAdminUser, requireAdmin } from '@/lib/auth/admin'
import { MEDIA_BUCKET, supabaseAdmin } from '@/lib/supabase/admin'
import { createSessionClient } from '@/lib/supabase/ssr'

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string }

// ---- Auth --------------------------------------------------------------------

export async function signIn(_prev: { error: string } | null, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) return { error: 'Enter your email and password.' }

  const supabase = await createSessionClient()
  if (!supabase) return { error: 'The admin portal is not connected to Supabase yet.' }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'That email and password do not match.' }
  if (!(await getAdminUser())) {
    await supabase.auth.signOut()
    return { error: 'This account does not have admin access.' }
  }
  redirect('/admin')
}

export async function signOut() {
  const supabase = await createSessionClient()
  await supabase?.auth.signOut()
  redirect('/admin/login')
}

// ---- Insights ----------------------------------------------------------------

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

const insightSchema = z.object({
  id: z.string().regex(UUID_RE).optional(),
  title: z.string().trim().min(1, 'Add a title.').max(200),
  slug: z.string().trim().max(80).regex(SLUG_RE, 'The URL can only use lowercase letters, numbers and dashes.'),
  excerpt: z.string().trim().max(300),
  body: z.string(),
  coverImageUrl: z.string().url().nullable(),
  coverAlt: z.string().trim().max(200),
  status: z.enum(['draft', 'published']),
})

export type InsightInput = z.input<typeof insightSchema>

function publishProblem(v: z.output<typeof insightSchema>) {
  if (!v.excerpt) return 'Add a short summary before publishing. It shows on the Insights page and in Google.'
  if (!v.coverImageUrl) return 'Add a cover image before publishing.'
  if (!v.coverAlt) return 'Describe the cover image (alt text) before publishing.'
  if (v.body.trim().split(/\s+/).filter(Boolean).length < 100) return 'The post is too short to publish. Aim for 400 to 700 words.'
  return null
}

function refreshPublic(...slugs: (string | undefined)[]) {
  revalidatePath('/insights')
  slugs.filter(Boolean).forEach((s) => revalidatePath(`/insights/${s}`))
  revalidatePath('/sitemap.xml')
  revalidatePath('/admin/insights')
}

export async function saveInsight(input: InsightInput): Promise<Result<{ id: string }>> {
  await requireAdmin()
  const parsed = insightSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the fields and try again.' }
  const v = parsed.data
  if (v.status === 'published') {
    const problem = publishProblem(v)
    if (problem) return { ok: false, error: problem }
  }

  const db = supabaseAdmin()
  let previous: { slug: string; published_at: string | null } | null = null
  if (v.id) {
    const { data } = await db.from('insight_posts').select('slug, published_at').eq('id', v.id).maybeSingle()
    previous = data
  }

  const row = {
    slug: v.slug,
    title: v.title,
    excerpt: v.excerpt,
    body: v.body,
    cover_image_url: v.coverImageUrl,
    cover_alt: v.coverAlt,
    status: v.status,
    // First publish stamps the date (used for ordering only); later saves keep it.
    published_at: previous?.published_at ?? (v.status === 'published' ? new Date().toISOString() : null),
  }

  const query = v.id
    ? db.from('insight_posts').update(row).eq('id', v.id).select('id').single()
    : db.from('insight_posts').insert(row).select('id').single()
  const { data, error } = await query
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'That URL is already used by another post.' }
    console.error('[admin] saveInsight failed', error.message)
    return { ok: false, error: 'Could not save. Try again.' }
  }

  refreshPublic(v.slug, previous?.slug !== v.slug ? previous?.slug : undefined)
  return { ok: true, id: data.id }
}

export async function deleteInsight(id: string): Promise<Result> {
  await requireAdmin()
  if (!UUID_RE.test(id)) return { ok: false, error: 'Unknown post.' }
  const db = supabaseAdmin()
  const { data } = await db.from('insight_posts').select('slug').eq('id', id).maybeSingle()
  const { error } = await db.from('insight_posts').delete().eq('id', id)
  if (error) {
    console.error('[admin] deleteInsight failed', error.message)
    return { ok: false, error: 'Could not delete. Try again.' }
  }
  refreshPublic(data?.slug)
  return { ok: true }
}

// ---- Images ------------------------------------------------------------------

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export async function uploadImage(formData: FormData): Promise<Result<{ url: string }>> {
  await requireAdmin()
  const file = formData.get('file')
  if (!(file instanceof File)) return { ok: false, error: 'No image received.' }
  const ext = IMAGE_TYPES[file.type]
  if (!ext) return { ok: false, error: 'Use a JPG, PNG, WebP or AVIF image.' }
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: 'Images must be 5 MB or smaller.' }

  const folder = formData.get('folder') === 'work' ? 'work' : 'insights'
  const path = `${folder}/${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`
  const storage = supabaseAdmin().storage.from(MEDIA_BUCKET)
  const { error } = await storage.upload(path, file, { contentType: file.type, cacheControl: '31536000' })
  if (error) {
    console.error('[admin] uploadImage failed', error.message)
    return { ok: false, error: 'Upload failed. Try again.' }
  }
  return { ok: true, url: storage.getPublicUrl(path).data.publicUrl }
}
