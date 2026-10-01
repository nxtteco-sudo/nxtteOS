export type InsightStatus = 'draft' | 'published'

// What the public site needs for a card.
export type InsightSummary = {
  id: string
  slug: string
  title: string
  excerpt: string
  cover_image_url: string | null
  cover_alt: string
  published_at: string | null
  noindex: boolean
}

export type InsightPost = InsightSummary & {
  body: string
  status: InsightStatus
  updated_at: string
  // SEO and AEO (migration 0012). Empty values fall back to the title, summary and cover.
  seo_title: string
  meta_description: string
  focus_keyword: string
  og_image_url: string | null
  canonical_url: string
  noindex: boolean
  author_slug: string | null
  takeaways: string
  faqs: unknown
}
