import { LegalDoc, type LegalSection } from "@/components/legal/legal-doc";

// Privacy notice (Personal Data Protection Act 2010). Describes what the site
// actually does; update it whenever a form, tool or provider changes.
const SECTIONS: LegalSection[] = [
  {
    title: "Who we are",
    body: <p>nxtte is a brand of Aurexis Solution (SSM NS0315281-P), based in Kuala Lumpur, Malaysia. Aurexis Solution is responsible for the personal details described here.</p>,
  },
  {
    title: "What we collect",
    body: (
      <ul>
        <li><strong>Contact and audit forms:</strong> your name, business name, Instagram handle, WhatsApp number and what you need help with.</li>
        <li><strong>Your audit dashboard:</strong> your email address, a password you choose, the answers you give about your business, messages you send us, and a payment receipt if you upload one. Your password is stored scrambled, so we cannot see it.</li>
        <li><strong>Our notes:</strong> whether we approved your audit, the reason if we could not take it on, and when you paid.</li>
        <li><strong>WhatsApp:</strong> if you message us, WhatsApp shows us your number and what you write.</li>
        <li><strong>Visits:</strong> anonymous page statistics (which pages are viewed). These do not identify you.</li>
        <li><strong>Spam protection:</strong> when you send a form or sign in, we keep a scrambled form of your IP address for up to 24 hours, only to stop automated spam and repeated sign-in attempts. We do not use it to identify you.</li>
      </ul>
    ),
  },
  {
    title: "Why we use it",
    body: (
      <ul>
        <li>To reply to you and answer your enquiry.</li>
        <li>To check the audit is a good fit, carry it out and deliver your report.</li>
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
  return <LegalDoc eyebrow="Privacy" title="Privacy notice" lead="What we collect when you use this site, why, and what you can ask us to do with it." updated="1 October 2026" current="/privacy" sections={SECTIONS} />;
}
