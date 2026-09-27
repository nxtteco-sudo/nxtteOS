'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, MessageCircle, X } from 'lucide-react'
import { Logo } from '@/components/logo'
import { buildWhatsAppLink, DEFAULT_WHATSAPP_MESSAGE } from '@/lib/whatsapp'
import { trackEvent } from '@/lib/analytics'

// AGENTS.md §2: sticky, logo left, 5 links centre-right, one WhatsApp button far
// right (the only button in the nav). On mobile the logo and WhatsApp button stay
// visible and the links collapse into a full-screen overlay.
const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/insights', label: 'Insights' },
]

const SCROLL_THRESHOLD = 8

export function Nav({ variant = 'full' }: { variant?: 'full' | 'stripped' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const whatsAppHref = buildWhatsAppLink(DEFAULT_WHATSAPP_MESSAGE)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  // AGENTS.md §2: /audit uses a stripped header — logo only, no links out.
  if (variant === 'stripped') {
    return (
      <header className="border-b border-border bg-bg">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center px-4">
          <Logo />
        </div>
      </header>
    )
  }

  const solid = scrolled || menuOpen

  // The overlay renders as a sibling of <header>, not inside it: the header's
  // backdrop-filter would otherwise become the containing block for position:fixed
  // and collapse the overlay to zero height.
  return (
    <>
    <header
      className={`sticky top-0 z-50 transition-colors duration-200 ${
        solid ? 'border-b border-border bg-bg/85 backdrop-blur-md' : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />

        <ul className="ml-auto hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition-colors hover:bg-surface ${
                    active ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 bottom-1.5 h-0.5 rounded-full bg-pink"
                    />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-1 md:ml-4">
          <a
            href={whatsAppHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('whatsapp_click', { location: 'nav' })}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-button bg-pink px-4 text-sm font-semibold text-ink transition-colors hover:bg-pink/90"
          >
            <MessageCircle size={18} aria-hidden />
            <span className="sm:hidden">WhatsApp</span>
            <span className="hidden sm:inline">Chat on WhatsApp</span>
          </a>

          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink hover:bg-surface md:hidden"
          >
            {menuOpen ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
          </button>
        </div>
      </nav>
    </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[72px] z-40 flex flex-col bg-bg md:hidden"
        >
          <ul className="flex flex-col px-4 pt-6">
            {NAV_LINKS.map((link, index) => {
              const active = pathname === link.href
              return (
                <li
                  key={link.href}
                  className="animate-rise border-b border-border"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-[64px] items-center justify-between text-2xl font-semibold tracking-[-0.015em] text-ink"
                  >
                    {link.label}
                    {active && <span aria-hidden className="h-2 w-2 rounded-full bg-pink" />}
                  </Link>
                </li>
              )
            })}
          </ul>
          <p className="mt-auto px-4 pb-8 text-sm text-muted">We reply within 24 hours.</p>
        </div>
      )}
    </>
  )
}
