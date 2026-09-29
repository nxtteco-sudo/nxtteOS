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
}

export type InsightPost = InsightSummary & {
  body: string
  status: InsightStatus
  updated_at: string
}
