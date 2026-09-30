import { CheckCircle2, Clock3, Ticket } from "lucide-react";
import { PaymentPanel } from "@/components/my/my-ui";
import { getPaymentSettings, requireMyAudit } from "@/lib/customer";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { formatDate } from "@/types/audit";

export default async function PaymentPage() {
  const audit = await requireMyAudit();
  const settings = await getPaymentSettings();
  const helpHref = buildWhatsAppLink(`Hi nxtte, please send me the payment details for my audit (${audit.reference ?? audit.business}).`);

  return (
    <div className="my-page">
      <header className="my-head">
        <p className="my-kicker">Step 3 of 5</p>
        <h1>Payment<span>.</span></h1>
        <p>One payment of RM {audit.amount}. No subscription, nothing else to pay for the audit.</p>
      </header>
      <div className="my-cols my-cols-wide">
        <div>
          {audit.payment_status === "paid" ? (
            <section className="my-card my-receipt">
              <span className="my-receipt-ok"><CheckCircle2 size={26} /></span>
              <h2>Paid. Thank you.</h2>
              <dl>
                <div><dt>Amount</dt><dd>RM {audit.amount}.00</dd></div>
                <div><dt>Paid on</dt><dd>{audit.paid_at ? formatDate(audit.paid_at) : ""}</dd></div>
                <div><dt>Reference</dt><dd>{audit.reference}</dd></div>
                <div><dt>For</dt><dd>Social media audit, {audit.business}</dd></div>
                <div><dt>Received by</dt><dd>Aurexis Solution (SSM NS0315281-P), trading as nxtte</dd></div>
              </dl>
            </section>
          ) : audit.payment_status === "claimed" ? (
            <section className="my-card my-receipt is-wait">
              <span className="my-receipt-ok"><Clock3 size={26} /></span>
              <h2>We are confirming your payment</h2>
              <p>You told us you paid on {audit.payment_claimed_at ? formatDate(audit.payment_claimed_at) : "today"}. We check it within one working day and this page updates as soon as it is confirmed.</p>
              <p className="my-hint">Reference {audit.reference} · RM {audit.amount}.00</p>
            </section>
          ) : (
            <PaymentPanel audit={audit} settings={settings} helpHref={helpHref} />
          )}
        </div>
        <aside className="my-aside">
          <div className="my-card my-amount">
            <small>Social media audit</small>
            <strong>RM {audit.amount}</strong>
            <span>One-off</span>
          </div>
          <div className="my-card my-tip">
            <span className="my-tip-ic"><Ticket size={18} /></span>
            <strong>It comes off your first month</strong>
            <p>Sign a package within 14 days of getting your report and the full RM {audit.amount} is credited to month one.</p>
          </div>
          <p className="my-fineprint">Payments go to Aurexis Solution (SSM NS0315281-P), the registered business behind nxtte.</p>
        </aside>
      </div>
    </div>
  );
}
