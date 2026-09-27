import Link from 'next/link'
import { Instagram } from 'lucide-react'
import { Logo } from '@/components/logo'

// AGENTS.md §2: footer carries SSM registration number, both social links,
// email, one-line address — cheap, powerful trust signals in this market.
// SSM number and email are content gaps (CLAUDE.md "Content gaps") — flagged
// with TODOs below rather than invented.
const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/insights', label: 'Insights' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg py-12">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-2 max-w-prose text-sm text-muted">
            Content that produces bookings, not just likes.
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm text-ink hover:text-pink">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 text-sm text-muted">
          {/* TODO: SSM registration number — content gap, do not fabricate */}
          <p>SSM: TODO_SSM_NUMBER</p>
          {/* TODO: business email — content gap, do not fabricate */}
          <a href="mailto:TODO_BUSINESS_EMAIL" className="hover:text-pink">
            TODO_BUSINESS_EMAIL
          </a>
          <div className="flex items-center gap-4 pt-1">
            <a
              href="https://instagram.com/TODO_HANDLE"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="nxtte on Instagram"
              className="flex h-11 w-11 items-center justify-center text-ink hover:text-pink"
            >
              <Instagram size={20} />
            </a>
            {/* lucide-react has no TikTok glyph; a labeled text link keeps this
                accessible without reproducing the brand mark. */}
            <a
              href="https://tiktok.com/@TODO_HANDLE"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center text-sm font-medium text-ink hover:text-pink"
            >
              TikTok
            </a>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-6xl px-4 text-xs text-muted">
        © nxtte 2026, a sub-brand of Aurexis Solution.
      </p>
    </footer>
  )
}
