import Link from 'next/link'

// AGENTS.md §6: the pink-on-black mark does not sit cleanly on white, so it lives
// inside a solid black rounded container rather than being recoloured.
// TODO: replace the text wordmark with the real logo file once supplied.
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="nxtte home"
      className={`inline-flex min-h-[44px] items-center rounded-xl bg-ink-section px-3.5 text-lg font-bold tracking-[-0.02em] text-pink-soft ${className}`.trim()}
    >
      nxtte
    </Link>
  )
}
