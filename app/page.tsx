import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Hero } from '@/components/sections/hero'
import { Problem } from '@/components/sections/problem'
import { ServicesPreview } from '@/components/sections/services-preview'
import { WhyNxtte } from '@/components/sections/why-nxtte'
import { Packages } from '@/components/sections/packages'
import { WorkPreview } from '@/components/sections/work-preview'
import { ProofStrip } from '@/components/sections/proof-strip'
import { FinalCta } from '@/components/sections/final-cta'

// AGENTS.md §3 — Home is a single scroll of 9 sections in this exact order.
export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <ServicesPreview />
        <WhyNxtte />
        <Packages />
        <WorkPreview />
        <ProofStrip />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
