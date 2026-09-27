import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildWhatsAppLink, DEFAULT_WHATSAPP_MESSAGE } from '@/lib/whatsapp'

// AGENTS.md §3 Home §9 + §6 Colour System: this is the second (and last) of
// the two full-bleed BLACK sections — same treatment as Packages. The spec's
// row groups "Final CTA + footer" together descriptively, but the Footer
// component itself is reused unchanged on every page (see Footer), so only
// this CTA band is black; Footer stays neutral immediately below it.
export function FinalCta() {
  const whatsAppHref = buildWhatsAppLink(DEFAULT_WHATSAPP_MESSAGE)

  return (
    <section className="bg-ink-section py-20 text-center">
      <div className="mx-auto max-w-2xl px-4">
        <h2 className="text-3xl font-bold leading-[1.1] tracking-tight text-white md:text-4xl">
          Find out why your content isn&apos;t converting.
        </h2>
        <p className="mt-4 text-base text-white/70">
          RM 299 audit, credited to your first month if you sign within 14 days.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <Button href="/audit">Book the audit</Button>
          <a
            href={whatsAppHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center gap-2 text-sm font-medium text-white/80 hover:text-pink-soft"
          >
            <MessageCircle size={18} aria-hidden />
            Chat on WhatsApp instead
          </a>
        </div>
      </div>
    </section>
  )
}
