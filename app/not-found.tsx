import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'

// AGENTS.md §11 pre-launch checklist: a styled 404 with a route back to Home.
export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="bg-bg px-4 py-24 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-pink">404</p>
        <h1 className="mx-auto mt-4 max-w-xl text-3xl font-bold leading-[1.1] tracking-tight text-ink md:text-4xl">
          That page doesn&apos;t exist.
        </h1>
        <p className="mx-auto mt-4 max-w-prose text-base text-muted">
          The link may be out of date. Head back to the homepage.
        </p>
        <div className="mt-8 flex justify-center">
          <Button href="/">Back to home</Button>
        </div>
      </main>
      <Footer />
    </>
  )
}
