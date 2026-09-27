// AGENTS.md §3 Home §8 — nxtte's own account growth, real numbers and dates.
// Surface tint background, bordered top/bottom. Numbers below are placeholders
// — real metrics + dates are a content gap (CLAUDE.md "Content gaps").
const STATS = [
  { number: 'TODO', label: 'Followers gained' },
  { number: 'TODO', label: 'Avg. reach / post' },
  { number: 'TODO', label: 'Enquiries from IG' },
  { number: 'TODO', label: 'Since (date)' },
]

export function ProofStrip() {
  return (
    <section className="border-y border-border bg-surface py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center sm:text-left">
            <p className="text-2xl font-bold text-pink">{stat.number}</p>
            <p className="mt-1 text-xs text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
