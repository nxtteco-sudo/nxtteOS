import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getPublishedInsights } from '@/lib/insights'
import { getPublishedCases } from '@/lib/work'

export const revalidate = 3600

// Live, indexable pages plus every published insight. /thanks is noindex and
// /admin is private.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ['/', '/services', '/about', '/work', '/insights', '/audit', '/contact', '/privacy']
  const [posts, cases] = await Promise.all([getPublishedInsights(), getPublishedCases()])
  return [
    ...routes.map((route) => ({ url: `${SITE_URL}${route}`, lastModified: new Date() })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/insights/${post.slug}`,
      lastModified: post.published_at ? new Date(post.published_at) : new Date(),
    })),
    ...cases.map((c) => ({ url: `${SITE_URL}/work/${c.slug}`, lastModified: new Date() })),
  ]
}
