import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

// AGENTS.md §3 Home §6 + §6 Colour System: Packages is one of only two
// full-bleed BLACK sections on the whole site (the other is Final CTA) — this
// is where the original dark brand personality survives. White text,
// `--pink-soft` safe here as decorative accent since the background is dark,
// not white. Do not lighten this section's background.
const PACKAGES = [
  {
    name: 'Starter',
    price: 'RM 890',
    features: ['1 platform', '12 posts (static and carousel)', 'Captions', 'Monthly report'],
    popular: false,
  },
  {
    name: 'Growth',
    price: 'RM 1,590',
    features: ['2 platforms', '12 posts + 4 reels', 'Content calendar', 'Monthly report'],
    popular: true,
  },
  {
    name: 'Scale',
    price: 'RM 2,890',
    features: [
      '2 platforms + ads management',
      'Content + reels',
      'Landing page',
      'Biweekly reporting',
    ],
    popular: false,
  },
]

export function Packages() {
  return (
    <section id="packages" className="bg-ink-section py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.name}
              className={`flex flex-col rounded-xl border p-6 ${
                pkg.popular
                  ? 'border-2 border-pink bg-white/5 md:scale-105'
                  : 'border-white/10 bg-transparent'
              }`}
            >
              {pkg.popular && (
                <span className="mb-4 inline-block w-fit rounded-full bg-pink px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink">
                  Most popular
                </span>
              )}

              <h3 className="text-xl font-semibold text-white">{pkg.name}</h3>
              <p className="mt-2">
                <span className="text-3xl font-bold text-pink-soft">{pkg.price}</span>
                <span className="text-sm text-white/60">/mo</span>
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="mt-0.5 shrink-0 text-pink-soft" size={16} aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button href="/audit" className="mt-6 w-full">
                Get started
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-white/60">
          Ad spend is separate from management fees.
        </p>
      </div>
    </section>
  )
}
