import { Lock, ShieldCheck } from "lucide-react";
import { DetailsForm } from "@/components/my/my-ui";
import { requireMyAudit } from "@/lib/customer";

export default async function DetailsPage() {
  const audit = await requireMyAudit();
  return (
    <div className="my-page">
      <header className="my-head">
        <p className="my-kicker">Step 2 of 5</p>
        <h1>Tell us about {audit.business}<span>.</span></h1>
        <p>Short answers are fine. The more specific you are, the more specific your 90-day roadmap will be.</p>
      </header>
      <div className="my-cols my-cols-wide">
        <section className="my-card"><DetailsForm audit={audit} /></section>
        <aside className="my-aside">
          <div className="my-card my-tip">
            <span className="my-tip-ic"><Lock size={18} /></span>
            <strong>Never send passwords here</strong>
            <p>We do not need your login. If we need access to your accounts, we will walk you through adding us the safe way on WhatsApp.</p>
          </div>
          <div className="my-card my-tip">
            <span className="my-tip-ic"><ShieldCheck size={18} /></span>
            <strong>Only we see this</strong>
            <p>Your answers are used for your audit and nothing else. You can change them any time before we start.</p>
          </div>
          <dl className="my-card my-known">
            <dt>We already have</dt>
            <dd><span>Name</span>{audit.name}</dd>
            <dd><span>Business</span>{audit.business}</dd>
            <dd><span>Instagram</span>{audit.instagram}</dd>
            <dd><span>WhatsApp</span>{audit.whatsapp}</dd>
          </dl>
        </aside>
      </div>
    </div>
  );
}
