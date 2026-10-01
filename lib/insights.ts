import 'server-only'
import { createSupabaseClient } from '@/lib/supabase/server'
import type { InsightPost, InsightSummary } from '@/types/insights'

// Public reads use the anon key; RLS only exposes published rows, and the
// status filter is repeated here so intent is explicit.
const SUMMARY_COLUMNS = 'id, slug, title, excerpt, cover_image_url, cover_alt, published_at, noindex'
const POST_COLUMNS = `${SUMMARY_COLUMNS}, body, status, updated_at, seo_title, meta_description, focus_keyword, og_image_url, canonical_url, author_slug, takeaways, faqs`

export async function getPublishedInsights(): Promise<InsightSummary[]> {
  const supabase = createSupabaseClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('insight_posts')
    .select(SUMMARY_COLUMNS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (error) {
    console.error('[insights] list failed', error.message)
    return []
  }
  return data ?? []
}

export async function getPublishedInsight(slug: string): Promise<InsightPost | null> {
  const supabase = createSupabaseClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('insight_posts')
    .select(POST_COLUMNS)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) {
    console.error('[insights] post failed', error.message)
    return null
  }
  return data as InsightPost | null
}

export function readingMinutes(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}
