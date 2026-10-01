import 'server-only'
import { createSupabaseClient } from '@/lib/supabase/server'
import type { CaseStudy, CaseSummary } from '@/types/work'

// Public reads use the anon key; RLS only exposes published rows.
const SUMMARY_COLUMNS =
  'id, slug, headline, client_type, case_type, category, result_value, result_label, result_period, cover_image_url, cover_alt, noindex'
const CASE_COLUMNS = `${SUMMARY_COLUMNS}, client_name, situation, what_we_did, what_changed, metrics, services, gallery, before_image_url, after_image_url, testimonial_quote, testimonial_author, status, sort_order, published_at, updated_at, seo_title, meta_description, focus_keyword, faqs`

export async function getPublishedCases(): Promise<CaseSummary[]> {
  const supabase = createSupabaseClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('case_studies')
    .select(SUMMARY_COLUMNS)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('published_at', { ascending: false })
  if (error) {
    console.error('[work] list failed', error.message)
    return []
  }
  return (data ?? []) as CaseSummary[]
}

export async function getPublishedCase(slug: string): Promise<CaseStudy | null> {
  const supabase = createSupabaseClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('case_studies')
    .select(CASE_COLUMNS)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) {
    console.error('[work] case failed', error.message)
    return null
  }
  return data as CaseStudy | null
}
