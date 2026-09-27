import { CalendarCheck, Eye, MessageCircle, UserRound } from 'lucide-react'
import { Button, TextLink } from '@/components/ui/button'

// AGENTS.md §3 Hero rules: outcome headline, exactly one primary button, weaker
// text link as the secondary action, no carousel/video/particles, headline readable
// without scrolling at 375px. Background is static CSS only (no image weight).

const MACHINE_STEPS = [
  { icon: Eye, title: 'Content gets seen', note: 'Posts, carousels, reels' },
  { icon: UserRound, title: 'Profile gets visited', note: 'Bio and highlights that sell' },
  { icon: MessageCircle, title: 'WhatsApp enquiry', note: 'One tap from the post' },
  { icon: CalendarCheck, title: 'Booking', note: 'The number that matters' },
]

const PROMISES = ['Published pricing', 'No lock-in', 'Monthly reporting']

function Rise({
  delay,
  className = '',
  children,
}: {
  delay: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`animate-rise ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hero-grid absolute inset-0" />
      <div className="absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full bg-pink-tint blur-3xl" />
      <div className="absolute -left-40 top-1/3 h-[380px] w-[380px] rounded-full bg-pink-soft/10 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bg" />
    </div>
  )
}

function MachineCard() {
  return (
    <div className="relative rounded-2xl border border-border bg-bg/90 p-5 shadow-[0_24px_60px_-24px_rgba(10,10,10,0.18)] backdrop-blur sm:p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted sm:text-xs">
        The machine we build
      </p>

      <ol className="relative mt-5 space-y-3">
        <span aria-hidden className="absolute bottom-6 left-5 top-6 w-px bg-border" />
        {MACHINE_STEPS.map(({ icon: Icon, title, note }, index) => {
          const last = index === MACHINE_STEPS.length - 1
          return (
            <li
              key={title}
              className={`relative flex items-center gap-4 rounded-xl p-2 ${last ? 'bg-pink-tint' : ''}`}
            >
              <span
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  last ? 'bg-pink text-ink' : 'border border-border bg-bg text-ink'
                }`}
              >
                <Icon size={18} aria-hidden />
              </span>
              <span>
                <span className="block text-base font-semibold text-ink">{title}</span>
                <span className="block text-sm text-muted">{note}</span>
              </span>
            </li>
          )
        })}
      </ol>

      <p className="mt-5 border-t border-border pt-4 text-sm text-muted">
        Most agencies stop at step one. We build all four.
      </p>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative -mt-[72px] overflow-hidden bg-bg pt-[72px]">
      <HeroBackground />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 md:pb-24 md:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <Rise delay={0}>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-bg/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink backdrop-blur sm:text-xs">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-pink" />
              Content, funnel and site from one team
            </p>
          </Rise>

          <Rise delay={60}>
            <h1 className="mt-6 max-w-[17ch] text-balance text-[36px] font-bold leading-[1.1] tracking-[-0.02em] text-ink sm:text-5xl md:text-6xl lg:text-[64px]">
              Your content should{' '}
              <span className="relative whitespace-nowrap text-pink">
                bring in bookings
                <svg
                  aria-hidden
                  viewBox="0 0 300 12"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1 left-0 h-2 w-full text-pink-soft/60"
                >
                  <path
                    d="M2 9 C 80 3, 220 3, 298 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              , not just likes.
            </h1>
          </Rise>

          <Rise delay={120}>
            <p className="mt-6 max-w-[34rem] text-base text-muted md:text-lg">
              We build the machine that turns attention into bookings. Content sits at
              the top. The site, the funnel and the follow-up sit underneath it.
            </p>
          </Rise>

          <Rise delay={180} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Button href="/audit" className="px-7 text-base">
              Book the RM 299 audit
            </Button>
            <TextLink href="#packages" className="self-center sm:self-auto">
              See packages
            </TextLink>
          </Rise>

          <Rise delay={240}>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {PROMISES.map((promise) => (
                <li key={promise} className="flex items-center gap-2 text-sm text-muted">
                  <span aria-hidden className="h-1 w-1 rounded-full bg-ink" />
                  {promise}
                </li>
              ))}
            </ul>
          </Rise>
        </div>

        <Rise delay={200} className="mx-auto w-full max-w-md lg:max-w-none">
          <MachineCard />
        </Rise>
      </div>
    </section>
  )
}
