import type { Metadata } from 'next'
import { Instagram, MessageCircle } from 'lucide-react'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { MetaPixelLead } from '@/components/meta-pixel-lead'
import { buildWhatsAppLink } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Thanks — we will WhatsApp you within 24 hours | nxtte',
  description: 'Your audit request is in. We will WhatsApp you within 24 hours.',
  robots: { index: false, follow: false },
}

// AGENTS.md §5 Thanks: confirmation with a time promise, WhatsApp button, social
// links, and the conversion pixel — the only reliable conversion event on the site.
export default function ThanksPage() {
  return (
    <>
      <Nav />
      <main className="bg-bg px-4 py-24 text-center">
        <MetaPixelLead />
        <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-ink md:text-5xl">
          We will WhatsApp you within 24 hours.
        </h1>
        <p className="mx-auto mt-4 max-w-prose text-base text-muted">
          Would you rather start now? Message us directly.
        </p>

        <div className="mt-8 flex justify-center">
          <Button
            href={buildWhatsAppLink("Hi nxtte, I just requested the audit and I'd like to start now.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} aria-hidden className="mr-2" />
            Chat on WhatsApp
          </Button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          {/* TODO: real nxtte handles */}
          <a
            href="https://instagram.com/TODO_HANDLE"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center gap-2 text-sm font-medium text-ink hover:text-pink"
          >
            <Instagram size={18} aria-hidden />
            Instagram
          </a>
          <a
            href="https://tiktok.com/@TODO_HANDLE"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center text-sm font-medium text-ink hover:text-pink"
          >
            TikTok
          </a>
        </div>
      </main>
      <Footer />
    </>
  )
}
