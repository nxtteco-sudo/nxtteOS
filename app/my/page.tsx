import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, CalendarRange, CheckCircle2, Clock3, Crosshair, Download, MessageCircle, Search, Sparkles, UserRound } from "lucide-react";
import { SignInForm } from "@/components/my/my-ui";
import { Tracker } from "@/components/my/tracker";
import { getMessages, getMyAudit } from "@/lib/customer";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { creditDeadline, expectedDelivery, formatDate, type Audit } from "@/types/audit";

const PARTS = [
  { icon: UserRound, label: "Profile and bio teardown" },
  { icon: BarChart3, label: "Content performance review" },
  { icon: Crosshair, label: "Competitor comparison" },
  { icon: Search, label: "Gap analysis" },
  { icon: CalendarRange, label: "90-day roadmap with weekly deliverables" },
];

type Next = { tone: "act" | "wait" | "done"; title: string; body: string; cta?: { href: string; label: string } };

function nextStep(a: Audit): Next {
  if (!a.details_submitted_at) return { tone: "act", title: "Tell us about your business", body: "Seven short questions. It takes about three minutes and lets us make the audit about you, not a template.", cta: { href: "/my/details", label: "Add my details" } };
  if (a.payment_status === "unpaid") return { tone: "act", title: `Pay RM ${a.amount} to start your audit`, body: "Bank transfer or DuitNow. It is credited to your first month if you sign a package within 14 days of your report.", cta: { href: "/my/payment", label: "See payment details" } };
  if (a.payment_status === "claimed") return { tone: "wait", title: "We are confirming your payment", body: "Thanks. We check it within one working day, then your audit starts. Nothing more for you to do right now." };
  if (a.report_ready_at) return { tone: "done", title: "Your report is ready", body: "Download your audit and 90-day roadmap, and see what to do first.", cta: { href: "/my/report", label: "Open my report" } };
  const due = expectedDelivery(a);
  return { tone: "wait", title: a.work_started_at ? "We are working on your audit" : "You are all set. We start next.", body: due ? `We have everything we need. Your report is expected by ${formatDate(due)}.` : "We have everything we need. Your report follows within five working days." };
}

function SignIn({ invalid }: { invalid: boolean }) {
  return (
    <main className="my-signin">
      <div className="my-signin-card">
        <Link href="/" className="logo-lockup" aria-label="nxtte home">
          <span className="logo-badge"><Image src="/brand/nxtte-logo.png" alt="nxtte" width={480} height={204} priority sizes="120px" /></span>
        </Link>
        <h1>Your audit dashboard</h1>
        <p>Enter the email you gave us and we will send your private link. No password needed.</p>
        {invalid && <p className="my-error my-error-box" role="alert">That link is no longer valid. Enter your email and we will send a new one.</p>}
        <SignInForm />
        <div className="my-signin-foot">
          <a href={buildWhatsAppLink("Hi nxtte, please send me the link to my audit dashboard.")} target="_blank" rel="noreferrer"><MessageCircle size={16} /> No email with us yet? Ask on WhatsApp</a>
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
  const firstName = audit.name.trim().split(/\s+/)[0];

  return (
    <div className="my-page">
      <header className="my-head">
        <p className="my-kicker">Your RM {audit.amount} audit</p>
        <h1>Hi {firstName}<span>.</span></h1>
        <p>Everything about the audit for <strong>{audit.business}</strong> lives here: what we need from you, where we are, and your report.</p>
      </header>

      {params.welcome && !audit.details_submitted_at && (
        <div className="my-welcome" role="status">
          <CheckCircle2 size={22} />
          <span><strong>You are booked.</strong> Two quick things and we can start. Add your email in the next step so you can always get back to this page.</span>
        </div>
      )}

      <section className="my-card my-track-card" aria-label="Progress"><Tracker audit={audit} /></section>

      <section className={`my-next is-${next.tone}`}>
        <div>
          <span className="my-next-label">{next.tone === "act" ? "Your next step" : next.tone === "wait" ? "Where things stand" : "Ready for you"}</span>
          <h2>{next.title}</h2>
          <p>{next.body}</p>
        </div>
        {next.cta
          ? <Link className="my-btn my-btn-light" href={next.cta.href}>{next.tone === "done" && <Download size={17} />}{next.cta.label} <ArrowRight size={17} /></Link>
          : <span className="my-next-wait"><Clock3 size={18} /> Nothing needed from you</span>}
      </section>

      <div className="my-cols">
        <section className="my-card">
          <h2 className="my-card-title"><Sparkles size={18} /> What your report covers</h2>
          <ol className="my-parts">
            {PARTS.map(({ icon: Icon, label }, i) => (
              <li key={label} className={audit.report_ready_at ? "is-done" : ""}><span><Icon size={17} /></span><em>0{i + 1}</em>{label}</li>
            ))}
          </ol>
        </section>
        <section className="my-card">
          <h2 className="my-card-title"><MessageCircle size={18} /> Messages</h2>
          {last
            ? <p className="my-preview"><strong>{last.sender === "nxtte" ? "nxtte" : "You"}:</strong> {last.body.length > 160 ? `${last.body.slice(0, 160)}…` : last.body}</p>
            : <p className="my-preview">No messages yet. Ask us anything about your audit and we reply within 24 hours.</p>}
          <Link className="my-link" href="/my/messages">{last ? "Open messages" : "Send a message"} <ArrowRight size={15} /></Link>
          {credit && (
            <p className="my-credit-mini">Your RM {audit.amount} credit is valid until <strong>{formatDate(credit)}</strong>.</p>
          )}
        </section>
      </div>
    </div>
  );
}
