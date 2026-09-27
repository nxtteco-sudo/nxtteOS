// AGENTS.md §3 Home §3 "Problem" section — surface tint background, 3 cards.
const PROBLEMS = [
  {
    title: 'Posting with no plan',
    body: 'Content goes out because it is Tuesday, not because it moves a buyer closer to booking.',
  },
  {
    title: 'Content that doesn’t convert',
    body: 'Likes go up, enquiries don’t. Nobody can point to what the account is actually for.',
  },
  {
    title: 'Agency went quiet after month two',
    body: 'The onboarding call was great. The reporting stopped. So did the ideas.',
  },
]

export function Problem() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-pink">
          The problem
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {PROBLEMS.map((problem) => (
            <div
              key={problem.title}
              className="rounded-xl border border-border bg-bg p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-ink">{problem.title}</h3>
              <p className="mt-2 max-w-prose text-sm text-muted">{problem.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
