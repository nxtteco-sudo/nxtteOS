"use client";

import { PageShell, Eyebrow } from "@/components/home/home-page";
import { CONTACT } from "@/lib/site";

// Privacy notice (Personal Data Protection Act 2010). Describes what the site
// actually does; update it whenever a form, tool or provider changes.
const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Who we are",
    body: <p>nxtte is a brand of Aurexis Solution (SSM NS0315281-P), based in Kuala Lumpur, Malaysia. Aurexis Solution is responsible for the personal details described here.</p>,
  },
  {
    title: "What we collect",
    body: (
      <ul>
        <li><strong>Contact and audit forms:</strong> your name, business name, Instagram handle, WhatsApp number and what you need help with.</li>
        <li><strong>Your audit dashboard:</strong> your email address, the answers you give about your business, messages you send us, and a payment receipt if you upload one.</li>
        <li><strong>WhatsApp:</strong> if you message us, WhatsApp shows us your number and what you write.</li>
        <li><strong>Visits:</strong> anonymous page statistics (which pages are viewed). These do not identify you.</li>
      </ul>
    ),
  },
  {
    title: "Why we use it",
    body: (
      <ul>
        <li>To reply to you and answer your enquiry.</li>
        <li>To carry out your audit and deliver your report.</li>
        <li>To confirm your payment and keep a record of it.</li>
        <li>To send you updates about work you have booked with us.</li>
      </ul>
    ),
  },
  {
    title: "What we do not do",
    body: <p>We do not sell your details. We do not add you to a mailing list because you filled in a form. We never ask for your social media passwords.</p>,
  },
  {
    title: "Who handles it for us",
    body: <p>The site runs on services from other companies: Vercel (hosting and page statistics), Supabase (database and file storage) and Resend (email). They process your details only to provide those services to us, and some of them store data outside Malaysia.</p>,
  },
  {
    title: "Cookies",
    body: <p>We use one cookie to keep you signed in to your audit dashboard. We do not use advertising cookies.</p>,
  },
  {
    title: "How long we keep it",
    body: <p>We keep your details for as long as we need them for the reasons above, and for as long as the law requires us to keep business and payment records. After that we delete them.</p>,
  },
  {
    title: "Your choices",
    body: <p>You can ask to see the details we hold about you, ask us to correct them, or ask us to delete them and stop using them. We will do so unless the law requires us to keep a record. If you do not give us the details a form asks for, we may not be able to reply or carry out the audit.</p>,
  },
];

export function PrivacyView() {
  return (
    <PageShell>
      <main className="lg">
        <div className="site-shell lg-shell">
          <Eyebrow>Privacy</Eyebrow>
          <h1>Privacy notice</h1>
          <p className="lg-lead">What we collect when you use this site, why, and what you can ask us to do with it.</p>
          <p className="lg-date">Last updated 30 September 2026</p>
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2>{s.title}</h2>
              {s.body}
            </section>
          ))}
          <section>
            <h2>Contact us about your details</h2>
            <p>Email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or message us on WhatsApp. We reply within 24 hours.</p>
          </section>
        </div>
      </main>
    </PageShell>
  );
}
