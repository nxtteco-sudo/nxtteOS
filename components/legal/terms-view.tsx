import Link from "next/link";
import { LegalDoc, type LegalSection } from "@/components/legal/legal-doc";
import { AUDIT_PRICE, packages } from "@/lib/pricing";

// Terms of service. Business decisions confirmed by the client on 1 Oct 2026:
// audit refundable until the report is delivered; monthly fees due on the 1st
// to 7th with work paused after the 7th; client owns content once paid.
const packageList = packages.map((p) => `${p.name} ${p.price}`).join(", ");

const SECTIONS: LegalSection[] = [
  {
    title: "Who we are",
    body: <p>nxtte is a brand of Aurexis Solution (SSM NS0315281-P), based in Kuala Lumpur, Malaysia. In these terms, &ldquo;we&rdquo; and &ldquo;us&rdquo; means Aurexis Solution, and &ldquo;you&rdquo; means the business that books our services. These terms apply when you book the audit, a monthly package or any service from our menu.</p>,
  },
  {
    title: "Prices",
    body: (
      <ul>
        <li>All prices are in Malaysian ringgit and are shown on our <Link href="/services">Services page</Link>.</li>
        <li>Monthly packages: {packageList} a month.</li>
        <li>Anything we quote for you is confirmed in writing, on WhatsApp or by email, before we start.</li>
        <li>Package clients get 15% off the menu.</li>
      </ul>
    ),
  },
  {
    title: "The RM 199 audit",
    body: (
      <ul>
        <li>After you book, we review your details to check the audit is a good fit. You only pay once we approve it. If we cannot take it on, we tell you why and you pay nothing.</li>
        <li>The audit costs RM {AUDIT_PRICE}, paid once. Your report follows within five working days of your payment.</li>
        <li>If you sign a monthly package within 14 days of receiving your report, the full RM {AUDIT_PRICE} comes off your first month.</li>
      </ul>
    ),
  },
  {
    title: "Monthly packages",
    body: (
      <ul>
        <li>Packages run for a minimum of 3 months, then continue month to month.</li>
        <li>After the minimum, you can stop with 30 days&rsquo; notice on WhatsApp or by email.</li>
        <li>Your first content calendar is ready within five working days of your first payment.</li>
      </ul>
    ),
  },
  {
    title: "Paying us",
    body: (
      <ul>
        <li>You pay by bank transfer or DuitNow, using the reference we give you.</li>
        <li>Your first month is paid before we start.</li>
        <li>After that, each month is due between the 1st and the 7th of the month.</li>
        <li>If a month is not paid by the 7th, we pause work until it is paid.</li>
        <li>Menu services are paid before we start.</li>
      </ul>
    ),
  },
  {
    title: "Ads management",
    body: <p>Ads management is RM 1,200 a month or 15% of your ad spend, whichever is higher, plus RM 499 to set up each campaign. Your ad spend is separate from our fee and is not included in it.</p>,
  },
  {
    title: "What we need from you",
    body: (
      <ul>
        <li>Accurate information about your business, and replies to our questions in good time. Delays on your side can delay our work.</li>
        <li>Permission to use anything you send us, such as your logo, photos and videos.</li>
        <li>Never send us your passwords. If we need access to an account, we will show you how to add us the safe way.</li>
      </ul>
    ),
  },
  {
    title: "Results",
    body: <p>We do the work we agree to, carefully and on time. We cannot promise a set number of followers, views, enquiries or sales, because platforms such as Instagram and TikTok decide who sees your content. We are not responsible for changes, outages or account decisions made by those platforms.</p>,
  },
  {
    title: "Who owns the content",
    body: (
      <ul>
        <li>Once a month is paid, you own the finished content we made for you that month.</li>
        <li>Your brand, logo and the materials you give us stay yours.</li>
        <li>We may show work we made for you on our website and social media. If you would rather we did not, tell us and we will not.</li>
      </ul>
    ),
  },
  {
    title: "Refunds",
    body: <p>See our <Link href="/refunds">Refund policy</Link>.</p>,
  },
  {
    title: "Changes to these terms",
    body: <p>We may update these terms. If a change affects work you have already booked, we will tell you before it applies.</p>,
  },
  {
    title: "Law",
    body: <p>These terms are governed by the laws of Malaysia.</p>,
  },
];

export function TermsView() {
  return <LegalDoc eyebrow="Terms" title="Terms of service" lead="What you can expect from us, and what we need from you, when you book nxtte." updated="1 October 2026" current="/terms" sections={SECTIONS} />;
}
