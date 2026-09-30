import { LegalDoc, type LegalSection } from "@/components/legal/legal-doc";
import { AUDIT_PRICE } from "@/lib/pricing";

// Refund policy. All rules confirmed by the client on 1 Oct 2026.
const SECTIONS: LegalSection[] = [
  {
    title: "The RM 199 audit",
    body: (
      <ul>
        <li>You can cancel and get a full refund of RM {AUDIT_PRICE} at any time before we deliver your report.</li>
        <li>Once your report is delivered, the audit is not refundable.</li>
        <li>If we review your details and cannot take the audit on, you pay nothing. Payment only opens after we approve it.</li>
      </ul>
    ),
  },
  {
    title: "Monthly packages",
    body: (
      <ul>
        <li>A month that has already started is not refunded.</li>
        <li>After the 3-month minimum, you can stop with 30 days&rsquo; notice, and you are not charged for months after that.</li>
      </ul>
    ),
  },
  {
    title: "Menu services",
    body: <p>If you cancel before we start, we refund you in full. Once we have started, the service is not refundable.</p>,
  },
  {
    title: "Ad spend",
    body: <p>Money spent on ads goes to the ad platform, such as Meta or TikTok, so we cannot refund it.</p>,
  },
  {
    title: "How to ask for a refund",
    body: <p>Message us on WhatsApp or email us with your payment reference. We reply within 24 hours. Approved refunds are sent by bank transfer to the account you paid from, within 14 days.</p>,
  },
];

export function RefundsView() {
  return <LegalDoc eyebrow="Refunds" title="Refund policy" lead="When you can get your money back, and how to ask." updated="1 October 2026" current="/refunds" sections={SECTIONS} />;
}
