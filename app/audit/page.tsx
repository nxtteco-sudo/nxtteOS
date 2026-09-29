import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Form, type FormField } from '@/components/ui/form'
import { submitAuditRequest } from './actions'

export const metadata: Metadata = {
  title: 'Find out why your content is not converting — RM 199 audit | nxtte',
  description:
    'A profile teardown, content review, competitor comparison and a 90-day roadmap, delivered in five working days. RM 199, credited to your first month.',
}

const AUDIT_FIELDS: FormField[] = [
  { name: 'name', label: 'Your name', autoComplete: 'name' },
  { name: 'business', label: 'Business name', autoComplete: 'organization' },
  { name: 'instagram', label: 'Instagram handle', placeholder: '@yourbrand' },
  { name: 'whatsapp', label: 'WhatsApp number', type: 'tel', autoComplete: 'tel', placeholder: '+60 12 345 6789' },
]

const WHAT_YOU_GET = [
  'Profile and bio teardown',
  'Content performance review',
  'Competitor comparison',
  'Gap analysis',
  '90-day roadmap with weekly deliverables',
]

// AGENTS.md §5 Audit landing page. Stripped header, no links out except the logo.
export default function AuditPage() {
  return (
    <>
      <Nav variant="stripped" />
      <main>
        <section className="bg-bg px-4 py-20 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-ink md:text-6xl">
            Find out why your content is not converting.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted md:text-lg">
            RM 199, credited to your first month.
          </p>
          <div className="mt-8 flex justify-center">
            <Button href="#audit-form">Book the audit</Button>
          </div>
        </section>

        <section className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold leading-[1.1] tracking-tight text-ink md:text-4xl">
              What you get
            </h2>
            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {WHAT_YOU_GET.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-border bg-bg p-5 text-base font-medium text-ink shadow-sm"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-bg py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold leading-[1.1] tracking-tight text-ink md:text-4xl">
              Sample
            </h2>
            {/* TODO: two or three screenshots of a real audit deliverable. Produce one
                for a real business first (even unpaid) so this section is never empty
                (AGENTS.md §5). Do not use mockups. */}
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="flex aspect-[4/3] items-center justify-center rounded-lg bg-surface text-sm text-muted"
                >
                  TODO: real audit screenshot
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold leading-[1.1] tracking-tight text-ink md:text-4xl">
                Turnaround
              </h2>
              <p className="mt-4 max-w-prose text-base text-muted">
                Delivered in five working days.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold leading-[1.1] tracking-tight text-ink md:text-4xl">
                The offer
              </h2>
              <p className="mt-4 max-w-prose text-base text-muted">
                <span className="font-bold text-pink">RM 199</span>, fully credited against
                your first month if you sign within 14 days.
              </p>
            </div>
          </div>
        </section>

        <section id="audit-form" className="bg-bg py-20">
          <div className="mx-auto max-w-md px-4">
            <h2 className="text-3xl font-bold leading-[1.1] tracking-tight text-ink">
              Book your audit
            </h2>
            <p className="mt-2 text-sm text-muted">We will WhatsApp you within 24 hours.</p>
            <div className="mt-8">
              <Form
                formKey="audit"
                fields={AUDIT_FIELDS}
                action={submitAuditRequest}
                submitLabel="Book the audit"
                trackingEvent="audit_submit"
                redirectTo="/thanks"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
