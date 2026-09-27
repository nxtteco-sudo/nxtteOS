// AGENTS.md §3 Home §5 "Why nxtte" — surface tint background (the spec's own
// token, not an off-brand "cream"), the Aurexis angle plus 3 proof points.
// Proof numbers are placeholders — real metrics are a content gap
// (CLAUDE.md "Content gaps"); do not treat these as real figures.
const PROOF_POINTS = [
  { number: 'TODO', label: 'Accounts grown' },
  { number: 'TODO', label: 'Avg. reach increase' },
  { number: 'TODO', label: 'Days to first content calendar' },
]

export function WhyNxtte() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="max-w-2xl text-3xl font-bold leading-[1.1] tracking-tight text-ink md:text-4xl">
          Content, funnel, and site — from one team.
        </h2>
        <p className="mt-4 max-w-prose text-base text-muted">
          nxtte is attached to Aurexis Solution. The same team that builds your website
          and your lead funnel also builds the content that feeds them. Most agencies
          hand over reels and stop — we own the whole path from a post to a booking.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {PROOF_POINTS.map((point) => (
            <div key={point.label}>
              <p className="text-3xl font-bold text-pink">{point.number}</p>
              <p className="mt-1 text-sm text-muted">{point.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
