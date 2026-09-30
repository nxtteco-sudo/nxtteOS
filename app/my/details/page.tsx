import { AtSign, Lock, MessageCircle, ShieldCheck, Store, UserRound } from "lucide-react";
import { DetailsForm } from "@/components/my/my-ui";
import { hasPassword, requireMyAudit } from "@/lib/customer";

export default async function DetailsPage() {
  const audit = await requireMyAudit();
  const done = Boolean(audit.details_submitted_at);
  return (
    <div className="my-page">
      <section className={`my-hero my-hero-slim ${done ? "is-done" : "is-act"}`}>
        <div className="my-hero-aurora" aria-hidden="true"><i /><i /><i /></div>
        <div className="my-hero-copy">
          <p className="my-hero-kicker">Step 2 of 6</p>
          <h1>Tell us about {audit.business}<span>.</span></h1>
          <p className="my-hero-body">Short answers are fine. The more specific you are, the more specific your 90-day roadmap will be.</p>
        </div>
        <p className="my-hero-chip">{done ? "Received. Edit any time before we start" : "One required question, five optional"}</p>
      </section>
      <div className="my-cols my-cols-wide">
        <DetailsForm audit={audit} hasPassword={await hasPassword(audit.id)} />
        <aside className="my-aside my-aside-sticky">
          <dl className="my-card my-known">
            <dt>We already have</dt>
            <dd><span><UserRound size={15} /> Name</span>{audit.name}</dd>
            <dd><span><Store size={15} /> Business</span>{audit.business}</dd>
            <dd><span><AtSign size={15} /> Instagram</span>{audit.instagram}</dd>
            <dd><span><MessageCircle size={15} /> WhatsApp</span>{audit.whatsapp}</dd>
          </dl>
          <div className="my-card my-tips">
            <div className="my-tip">
              <span className="my-tip-ic"><Lock size={18} /></span>
              <strong>Never send passwords here</strong>
              <p>We do not need your Instagram or TikTok login. If we need access, we will walk you through adding us the safe way on WhatsApp.</p>
            </div>
            <div className="my-tip">
              <span className="my-tip-ic"><ShieldCheck size={18} /></span>
              <strong>Only we see this</strong>
              <p>Your answers are used for your audit and nothing else.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
