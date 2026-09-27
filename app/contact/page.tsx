import type { Metadata } from 'next'
import { Instagram, MessageCircle } from 'lucide-react'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Form, type FormField } from '@/components/ui/form'
import { buildWhatsAppLink, DEFAULT_WHATSAPP_MESSAGE } from '@/lib/whatsapp'
import { SERVICE_INTERESTS } from '@/lib/validation/forms'
import { submitContactForm } from './actions'

export const metadata: Metadata = {
  title: 'Contact nxtte — content that produces bookings, not just likes',
  description:
    'Message nxtte on WhatsApp, or send your details and we will reply within 24 hours.',
}

const CONTACT_FIELDS: FormField[] = [
  { name: 'name', label: 'Your name', autoComplete: 'name' },
  { name: 'business', label: 'Business name', autoComplete: 'organization' },
  { name: 'instagram', label: 'Instagram handle', placeholder: '@yourbrand' },
  { name: 'whatsapp', label: 'WhatsApp number', type: 'tel', autoComplete: 'tel', placeholder: '+60 12 345 6789' },
  {
    name: 'service_interest',
    label: 'What do you need help with?',
    type: 'select',
    placeholder: 'Choose one',
    options: SERVICE_INTERESTS.map((service) => ({ value: service, label: service })),
  },
]

// AGENTS.md §5 Contact: WhatsApp is the hero element, the largest object on the
// page — the form is a fallback, not the default. Email + both social links sit
// below the fold.
export default function ContactPage() {
  const whatsAppHref = buildWhatsAppLink(DEFAULT_WHATSAPP_MESSAGE)

  return (
    <>
      <Nav />
      <main>
        <section className="bg-bg px-4 py-20 text-center">
          <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-ink md:text-6xl">
            Message us on WhatsApp.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted md:text-lg">
            We reply within 24 hours.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 text-base"
            >
              <MessageCircle size={20} aria-hidden className="mr-2" />
              Chat on WhatsApp
            </Button>
          </div>
        </section>

        <section className="bg-surface py-20">
          <div className="mx-auto max-w-md px-4">
            <h2 className="text-2xl font-bold leading-[1.1] tracking-tight text-ink">
              Prefer to send your details instead?
            </h2>
            <p className="mt-2 text-sm text-muted">We reply within 24 hours.</p>
            <div className="mt-8">
              <Form
                formKey="contact"
                fields={CONTACT_FIELDS}
                action={submitContactForm}
                submitLabel="Send"
                trackingEvent="contact_submit"
                redirectTo="/thanks"
              />
            </div>
          </div>
        </section>

        <section className="bg-bg py-16">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center">
            {/* TODO: business email — content gap, do not fabricate */}
            <a href="mailto:TODO_BUSINESS_EMAIL" className="text-sm text-ink hover:text-pink">
              TODO_BUSINESS_EMAIL
            </a>
            <div className="flex items-center gap-4">
              {/* TODO: real nxtte handles */}
              <a
                href="https://instagram.com/TODO_HANDLE"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="nxtte on Instagram"
                className="flex h-11 w-11 items-center justify-center text-ink hover:text-pink"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://tiktok.com/@TODO_HANDLE"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] items-center text-sm font-medium text-ink hover:text-pink"
              >
                TikTok
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
