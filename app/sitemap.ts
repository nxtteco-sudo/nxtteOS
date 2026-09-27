import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Only pages that are actually live and indexable at this phase. /thanks is
// noindex (see its own metadata). /services, /about, /work, /insights don't
// exist yet (CLAUDE.md build order phases 6-9).
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['/', '/audit', '/contact']
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }))
}
