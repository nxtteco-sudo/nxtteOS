import { TextLink } from '@/components/ui/button'

// AGENTS.md §2 warning: /work is not yet linked in the main nav until 3 real
// case studies with a result exist (CLAUDE.md rule 11). This preview section
// can still be built and shown on Home with placeholder tiles, clearly
// TODO'd — do not treat these as real results.
const CASES = [
  { clientType: 'TODO: real case study', result: 'TODO: real result metric' },
  { clientType: 'TODO: real case study', result: 'TODO: real result metric' },
  { clientType: 'TODO: real case study', result: 'TODO: real result metric' },
]

export function WorkPreview() {
  return (
    <section className="bg-bg py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-3">
          {CASES.map((item, index) => (
            <div key={index}>
              <div className="aspect-video rounded-lg bg-surface" aria-hidden />
              <p className="mt-3 text-sm text-muted">{item.clientType}</p>
              <p className="mt-1 text-lg font-bold text-pink">{item.result}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <TextLink href="/work">See all work →</TextLink>
        </div>
      </div>
    </section>
  )
}
