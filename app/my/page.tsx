import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, CalendarRange, CheckCircle2, Clock3, Crosshair, Download, FileText, MessageCircle, Search, Sparkles, Ticket, UserRound } from "lucide-react";
import { SignInForm } from "@/components/my/my-ui";
import { Tracker } from "@/components/my/tracker";
import { getMessages, getMyAudit } from "@/lib/customer";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { auditSteps, creditDeadline, expectedDelivery, formatDate, type Audit } from "@/types/audit";

const PARTS = [
  { icon: UserRound, label: "Profile and bio teardown" },
  { icon: BarChart3, label: "Content performance review" },
  { icon: Crosshair, label: "Competitor comparison" },
  { icon: Search, label: "Gap analysis" },
  { icon: CalendarRange, label: "90-day roadmap with weekly deliverables" },
];

type Next = { tone: "act" | "wait" | "done" | "stop"; title: string; body: string; cta?: { href: string; label: string } };

function nextStep(a: Audit): Next {
  if (!a.details_submitted_at) return { tone: "act", title: "Tell us about your business", body: "Set your login and answer six short questions. It takes about three minutes and lets us make the audit about you, not a template.", cta: { href: "/my/details", label: "Add my details" } };
  if (a.declined_at) return { tone: "stop", title: "We cannot take this audit on", body: a.decline_reason || "We are not the right fit for this one. You have not been charged." };
  if (!a.approved_at) return { tone: "wait", title: "We are reviewing your details", body: "We check that the audit is a good fit for your business, usually within one working day. Payment opens as soon as we approve, and we email you." };
  if (a.payment_status === "unpaid") return { tone: "act", title: `You are approved. Pay RM ${a.amount} to start.`, body: "Bank transfer or DuitNow. It is credited to your first month if you sign a package within 14 days of your report.", cta: { href: "/my/payment", label: "See payment details" } };
  if (a.payment_status === "claimed") return { tone: "wait", title: "We are confirming your payment", body: "Thanks. We check it within one working day, then your audit starts. Nothing more for you to do right now." };
  if (a.report_ready_at) return { tone: "done", title: "Your report is ready", body: "Download your audit and 90-day roadmap, and see what to do first.", cta: { href: "/my/report", label: "Open my report" } };
  const due = expectedDelivery(a);
  return { tone: "wait", title: a.work_started_at ? "We are working on your audit" : "You are all set. We start next.", body: due ? `We have everything we need. Your report is expected by ${formatDate(due)}.` : "We have everything we need. Your report follows within five working days." };
}

function SignIn({ invalid }: { invalid: boolean }) {
  return (
    <main className="my-signin">
      <div className="ab-aurora" aria-hidden="true"><div className="ab-aurora-light"><i className="ab-c1" /><i className="ab-c2" /></div></div>
      <div className="my-signin-card">
        <Link href="/" className="logo-lockup" aria-label="nxtte home">
          <span className="logo-badge"><Image src="/brand/nxtte-logo.png" alt="nxtte" width={480} height={204} priority sizes="120px" /></span>
        </Link>
        <h1>Your audit dashboard</h1>
        <p>Sign in with the email and password you set when you booked your audit.</p>
        {invalid && <p className="my-error my-error-box" role="alert">That link is no longer valid. Sign in below, or ask for a new link.</p>}
        <SignInForm />
        <div className="my-signin-foot">
          <a href={buildWhatsAppLink("Hi nxtte, please send me the link to my audit dashboard.")} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Cannot get in? Ask us on WhatsApp</a>
          <Link href="/audit">Not booked yet? Book the RM 199 audit <ArrowRight size={15} /></Link>
        </div>
      </div>
    </main>
  );
}

export default async function MyPage({ searchParams }: { searchParams: Promise<{ welcome?: string; link?: string }> }) {
  const params = await searchParams;
  const audit = await getMyAudit();
  if (!audit) return <SignIn invalid={params.link === "invalid"} />;

  const messages = await getMessages(audit.id);
  const last = messages[messages.length - 1];
  const next = nextStep(audit);
  const credit = creditDeadline(audit);
  const due = expectedDelivery(audit);
  const firstName = audit.name.trim().split(/\s+/)[0];
  const steps = auditSteps(audit);
  const done = steps.filter((s) => s.state === "done").length;
  const RING = 2 * Math.PI * 52;
  const facts: [string, string][] = [
    ["Reference", audit.reference ?? "-"],
    ["Booked", formatDate(audit.created_at)],
    ["Report", audit.report_ready_at ? `Delivered ${formatDate(audit.report_ready_at)}` : due ? `Expected by ${formatDate(due)}` : "5 working days after payment"],
    ["Price", `RM ${audit.amount}, one-off`],
  ];

  return (
    <div className="my-page my-home">
      <section className={`my-hero is-${next.tone}`}>
        <div className="my-hero-aurora" aria-hidden="true"><i /><i /><i /></div>
        <div className="my-hero-copy">
          <p className="my-hero-kicker">Audit for {audit.business}</p>
          <h1>Hi {firstName}<span>.</span></h1>
          <p className="my-hero-label">{next.tone === "act" ? "Your next step" : next.tone === "done" ? "Ready for you" : "Where things stand"}</p>
          <h2>{next.title}</h2>
          <p className="my-hero-body">{next.body}</p>
          {next.cta
            ? <Link className="my-btn my-btn-light" href={next.cta.href}>{next.tone === "done" && <Download size={17} />}{next.cta.label} <ArrowRight size={17} /></Link>
            : next.tone === "stop"
              ? <a className="my-btn my-btn-light" href={buildWhatsAppLink(`Hi nxtte, about my audit request (${audit.reference ?? audit.business}).`)} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Message us</a>
              : <span className="my-next-wait"><Clock3 size={18} /> Nothing needed from you</span>}
        </div>
        <div className="my-ring" role="img" aria-label={`${done} of ${steps.length} steps complete`}>
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" className="my-ring-track" />
            <circle cx="60" cy="60" r="52" className="my-ring-fill" strokeDasharray={RING} strokeDashoffset={RING * (1 - done / steps.length)} />
          </svg>
          <span><strong>{done}<small>/{steps.length}</small></strong>steps done</span>
        </div>
      </section>

      {params.welcome && !audit.details_submitted_at && (
        <div className="my-welcome" role="status">
          <CheckCircle2 size={22} />
          <span><strong>You are booked.</strong> Two quick things and we can start. In the next step you set your email and password, so you can sign in again any time.</span>
        </div>
      )}

      <section className="my-card my-track-card" aria-label="Progress">
        <h2 className="my-card-title"><Sparkles size={18} /> Your audit, step by step</h2>
        <Tracker audit={audit} />
      </section>

      <div className="my-bento">
        <section className="my-card my-bento-parts">
          <h2 className="my-card-title"><FileText size={18} /> What your report covers</h2>
          <ol className="my-parts">
            {PARTS.map(({ icon: Icon, label }, i) => (
              <li key={label} className={audit.report_ready_at ? "is-done" : ""}><span><Icon size={17} /></span><em>0{i + 1}</em>{label}</li>
            ))}
          </ol>
        </section>
        <section className="my-card my-glance">
          <h2 className="my-card-title"><Ticket size={18} /> At a glance</h2>
          <dl>{facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          {credit && <p className="my-credit-mini">Your RM {audit.amount} credit is valid until <strong>{formatDate(credit)}</strong>.</p>}
        </section>
        <section className="my-card my-bento-msg">
          <h2 className="my-card-title"><MessageCircle size={18} /> Messages</h2>
          {last
            ? <p className="my-preview"><strong>{last.sender === "nxtte" ? "nxtte" : "You"}:</strong> {last.body.length > 160 ? `${last.body.slice(0, 160)}…` : last.body}</p>
            : <p className="my-preview">No messages yet. Ask us anything about your audit and we reply within 24 hours.</p>}
          <Link className="my-link" href="/my/messages">{last ? "Open messages" : "Send a message"} <ArrowRight size={15} /></Link>
        </section>
      </div>
    </div>
  );
}
