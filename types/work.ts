import type { ServiceCategory } from '@/lib/pricing'

export type CaseType = 'client' | 'own' | 'trial'
export type GalleryImage = { url: string; alt: string }
export type CaseMetric = { value: string; label: string }

export type CaseSummary = {
  id: string
  slug: string
  headline: string
  client_type: string
  case_type: CaseType
  category: ServiceCategory
  result_value: string
  result_label: string
  result_period: string
  cover_image_url: string | null
  cover_alt: string
  noindex: boolean
}

export type CaseStudy = CaseSummary & {
  client_name: string
  situation: string
  what_we_did: string
  what_changed: string
  metrics: CaseMetric[]
  services: string[]
  gallery: GalleryImage[]
  before_image_url: string | null
  after_image_url: string | null
  testimonial_quote: string
  testimonial_author: string
  status: 'draft' | 'published'
  sort_order: number
  published_at: string | null
  updated_at: string
  // SEO and AEO (migration 0012). Empty values fall back to the headline and result.
  seo_title: string
  meta_description: string
  focus_keyword: string
  faqs: unknown
}

// Shown on every tile so a trial or our own account is never passed off as a client.
export const CASE_TYPE_LABEL: Record<CaseType, string> = {
  client: 'Client',
  own: "nxtte's own account",
  trial: 'Unpaid trial',
}
