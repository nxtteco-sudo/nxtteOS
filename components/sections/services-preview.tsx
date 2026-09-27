import { Palette, Share2, TrendingUp, Building2 } from 'lucide-react'
import { TextLink } from '@/components/ui/button'

// AGENTS.md §3 Home §4 — 4 blocks, two lines each, no price shown here
// (pricing lives on /services and the Packages block). White background.
const SERVICES = [
  {
    icon: Share2,
    title: 'Content Creation',
    body: 'Static posts, carousels, and reels shot and edited for your platforms.',
  },
  {
    icon: Palette,
    title: 'Social Media Management',
    body: 'Calendar, captions, and posting handled end to end, every week.',
  },
  {
    icon: TrendingUp,
    title: 'Ads & Growth',
    body: 'Meta and TikTok campaigns built to turn reach into enquiries.',
  },
  {
    icon: Building2,
    title: 'Brand & Business',
    body: 'Positioning, landing pages, and the systems that turn content into bookings.',
  },
]

export function ServicesPreview() {
  return (
    <section className="bg-bg py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <Icon className="text-pink" size={28} aria-hidden />
              <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 max-w-prose text-sm text-muted">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <TextLink href="/services">See all services →</TextLink>
        </div>
      </div>
    </section>
  )
}
