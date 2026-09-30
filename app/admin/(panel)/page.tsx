import Link from "next/link";
import { ArrowRight, ArrowUpRight, Banknote, Briefcase, Check, ClipboardCheck, CreditCard, FileText, Inbox, Mail, MessagesSquare, PenLine, Play, Sparkles, Wallet } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { auditStage, listAudits, unreadByAudit } from "@/lib/admin-data";
import { getPaymentSettings } from "@/lib/customer";
import { formatRM } from "@/lib/pricing";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDate } from "@/types/audit";

// Spec thresholds: Insights needs 6 posts and Work needs 3 cases before they go in the site menu.
const POSTS_GOAL = 6;
const CASES_GOAL = 3;
const CHART_DAYS = 14;
const TZ = "Asia/Kuala_Lumpur";

const dayKey = (d: Date | string) => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ });

function greeting() {
  const hour = Number(new Date().toLocaleString("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }));
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days < 7 ? `${days} d ago` : formatDate(iso);
}

type Activity = { at: string; icon: typeof Inbox; tone: "pink" | "ink" | "green"; text: string; href: string };

export default async function AdminOverview() {
  const admin = await requireAdmin();
  const db = supabaseAdmin();
  const [audits, unread, leadsRes, msgRes, postsRes, casesRes, payment] = await Promise.all([
    listAudits(),
    unreadByAudit(),
    db.from("contact_submissions").select("id, business, name, status, created_at").order("created_at", { ascending: false }).limit(300),
    db.from("audit_messages").select("id, audit_id, body, created_at").eq("sender", "customer").order("created_at", { ascending: false }).limit(6),
    db.from("insight_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
    db.from("case_studies").select("id", { count: "exact", head: true }).eq("status", "published"),
    getPaymentSettings(),
  ]);
  const leads = leadsRes.data ?? [];
  const newLeads = leads.filter((l) => l.status === "new").length;
  const toConfirm = audits.filter((a) => a.payment_status === "claimed");
  const unreadTotal = Object.values(unread).reduce((a, b) => a + b, 0);
  const collected = audits.filter((a) => a.payment_status === "paid").reduce((sum, a) => sum + a.amount, 0);
  const needsYou = audits.filter((a) => auditStage(a).tone === "you" || unread[a.id]);
  const openCount = newLeads + needsYou.length;

  // Enquiries and audit bookings per day, last 14 days (Malaysia time).
  const days = Array.from({ length: CHART_DAYS }, (_, i) => {
    const d = new Date(Date.now() - (CHART_DAYS - 1 - i) * 86_400_000);
    const key = dayKey(d);
    return {
      key,
      label: d.toLocaleDateString("en-MY", { timeZone: TZ, day: "numeric", month: "short" }),
      leads: leads.filter((l) => dayKey(l.created_at) === key).length,
      audits: audits.filter((a) => dayKey(a.created_at) === key).length,
    };
  });
  const peak = Math.max(1, ...days.map((d) => d.leads + d.audits));
  const chartTotal = days.reduce((s, d) => s + d.leads + d.audits, 0);

  const open = audits.filter((a) => !a.report_ready_at && !a.declined_at);
  const toReview = open.filter((a) => a.details_submitted_at && !a.approved_at);
  const pipeline = [
    { label: "Waiting for details", count: open.filter((a) => !a.details_submitted_at).length, tone: "soft" },
    { label: "Details to review", count: toReview.length, tone: "hot" },
    { label: "Waiting for payment", count: open.filter((a) => a.approved_at && a.payment_status === "unpaid").length, tone: "soft" },
    { label: "Payment to confirm", count: toConfirm.length, tone: "hot" },
    { label: "In progress", count: open.filter((a) => a.payment_status === "paid").length, tone: "ink" },
    { label: "Delivered", count: audits.filter((a) => a.report_ready_at).length, tone: "done" },
  ];
  const pipePeak = Math.max(1, ...pipeline.map((p) => p.count));

  const byId = new Map(audits.map((a) => [a.id, a]));
  const activity: Activity[] = [
    ...leads.slice(0, 8).map((l): Activity => ({ at: l.created_at, icon: Inbox, tone: "pink", text: `New enquiry from ${l.business}`, href: "/admin/leads" })),
    ...audits.flatMap((a): Activity[] => [
      { at: a.created_at, icon: ClipboardCheck, tone: "ink", text: `${a.business} booked an audit`, href: `/admin/audits/${a.id}` },
      ...(a.details_submitted_at ? [{ at: a.details_submitted_at, icon: PenLine, tone: "ink" as const, text: `${a.business} added their details`, href: `/admin/audits/${a.id}` }] : []),
      ...(a.payment_claimed_at && a.payment_status === "claimed" ? [{ at: a.payment_claimed_at, icon: CreditCard, tone: "pink" as const, text: `${a.business} says they have paid`, href: `/admin/audits/${a.id}` }] : []),
      ...(a.paid_at ? [{ at: a.paid_at, icon: Banknote, tone: "green" as const, text: `Payment confirmed for ${a.business}`, href: `/admin/audits/${a.id}` }] : []),
      ...(a.report_ready_at ? [{ at: a.report_ready_at, icon: FileText, tone: "green" as const, text: `Report delivered to ${a.business}`, href: `/admin/audits/${a.id}` }] : []),
    ]),
    ...(msgRes.data ?? []).map((m): Activity => ({ at: m.created_at, icon: MessagesSquare, tone: "pink", text: `${byId.get(m.audit_id)?.business ?? "A customer"}: ${m.body.length > 70 ? `${m.body.slice(0, 70)}…` : m.body}`, href: `/admin/audits/${m.audit_id}` })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);

  const posts = postsRes.count ?? 0;
  const cases = casesRes.count ?? 0;
  const setup = [
    { label: "Email alerts", done: Boolean(process.env.RESEND_API_KEY), hint: process.env.RESEND_API_KEY ? "On" : "Add RESEND_API_KEY", href: "/admin/settings", icon: Mail },
    { label: "Payment details", done: Boolean(payment.account_number || payment.duitnow_id), hint: payment.account_number || payment.duitnow_id ? "Shown to customers" : "Add your bank details", href: "/admin/settings", icon: Wallet },
    { label: "Insight posts", done: posts >= POSTS_GOAL, hint: `${posts} of ${POSTS_GOAL} live`, href: "/admin/insights", icon: FileText, progress: posts / POSTS_GOAL },
    { label: "Case studies", done: cases >= CASES_GOAL, hint: `${cases} of ${CASES_GOAL} live`, href: "/admin/work", icon: Briefcase, progress: cases / CASES_GOAL },
  ];

  const tiles = [
    { icon: Inbox, label: "New enquiries", value: String(newLeads), hot: newLeads > 0, href: "/admin/leads" },
    { icon: PenLine, label: "Details to review", value: String(toReview.length), hot: toReview.length > 0, href: "/admin/audits" },
    { icon: CreditCard, label: "Payments to confirm", value: String(toConfirm.length), hot: toConfirm.length > 0, href: "/admin/audits" },
    { icon: MessagesSquare, label: "Unread messages", value: String(unreadTotal), hot: unreadTotal > 0, href: "/admin/audits" },
  ];

  const today = new Date().toLocaleDateString("en-MY", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="ov">
      <section className="ov-hero">
        <div className="ov-aurora" aria-hidden="true"><i /><i /><i /></div>
        <div className="ov-hero-copy">
          <p className="ov-date">{today}</p>
          <h1>{greeting()}<span>.</span></h1>
          <p className="ov-status">
            {openCount === 0
              ? "You are all caught up. Nothing is waiting on you."
              : <><strong>{openCount}</strong> thing{openCount === 1 ? "" : "s"} waiting on you today.</>}
          </p>
          <div className="ov-actions">
            <Link href="/admin/leads" className="ov-btn ov-btn-light"><Inbox size={16} /> Open leads</Link>
            <Link href="/admin/insights/new" className="ov-btn"><PenLine size={16} /> New post</Link>
            <Link href="/admin/work/new" className="ov-btn"><Sparkles size={16} /> New case study</Link>
            <a href="/audit" target="_blank" rel="noreferrer" className="ov-btn"><ArrowUpRight size={16} /> Audit page</a>
          </div>
        </div>
        <div className="ov-money">
          <span className="ov-money-label"><Banknote size={16} /> Collected from audits</span>
          <strong>{formatRM(collected)}</strong>
          <small>{toConfirm.length > 0 ? `${formatRM(toConfirm.reduce((s, a) => s + a.amount, 0))} more waiting for you to confirm` : `Signed in as ${admin.email}`}</small>
        </div>
      </section>

      <ul className="ov-tiles">
        {tiles.map(({ icon: Icon, label, value, hot, href }, i) => (
          <li key={label} style={{ "--i": i } as React.CSSProperties}>
            <Link href={href} className={hot ? "is-hot" : ""}>
              <span className="ov-tile-ic"><Icon size={19} /></span>
              <strong>{value}</strong>
              <span>{label}</span>
              <ArrowUpRight size={16} className="ov-tile-go" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="ov-grid">
        <section className="ov-card ov-chart-card">
          <header><h2>Enquiries and bookings</h2><span>{chartTotal} in the last {CHART_DAYS} days</span></header>
          <div className="ov-chart" role="img" aria-label={`${chartTotal} enquiries and audit bookings in the last ${CHART_DAYS} days`}>
            {days.map((d, i) => (
              <div key={d.key} className="ov-bar" title={`${d.label}: ${d.leads} enquiries, ${d.audits} bookings`} style={{ "--i": i } as React.CSSProperties}>
                <span className="ov-bar-stack">
                  <i className="ov-bar-audit" style={{ height: `${(d.audits / peak) * 100}%` }} />
                  <i className="ov-bar-lead" style={{ height: `${(d.leads / peak) * 100}%` }} />
                </span>
                <small>{i % 2 === 1 || i === CHART_DAYS - 1 ? d.label.split(" ")[0] : ""}</small>
              </div>
            ))}
            {chartTotal === 0 && <p className="ov-chart-empty">No enquiries yet. They will show here day by day.</p>}
          </div>
          <div className="ov-legend"><span><i className="ov-bar-lead" /> Enquiries</span><span><i className="ov-bar-audit" /> Audit bookings</span></div>
        </section>

        <section className="ov-card">
          <header><h2>Audit pipeline</h2><span>{audits.length} in total</span></header>
          <ol className="ov-pipe">
            {pipeline.map((p) => (
              <li key={p.label} className={`is-${p.tone}`}>
                <span>{p.label}</span>
                <span className="ov-pipe-track"><i style={{ width: `${Math.max(p.count ? 8 : 0, (p.count / pipePeak) * 100)}%` }} /></span>
                <strong>{p.count}</strong>
              </li>
            ))}
          </ol>
        </section>

        <section className="ov-card">
          <header><h2>Needs you</h2><Link href="/admin/audits">All audits <ArrowRight size={14} /></Link></header>
          {needsYou.length === 0 ? (
            <div className="ov-clear"><span><Check size={20} strokeWidth={3} /></span><strong>All clear</strong><p>No payments to confirm, audits to start or messages to answer.</p></div>
          ) : (
            <ul className="ov-list">
              {needsYou.slice(0, 6).map((a) => {
                const stage = auditStage(a);
                return (
                  <li key={a.id}>
                    <Link href={`/admin/audits/${a.id}`}>
                      <span className="ov-avatar" aria-hidden="true">{a.business.trim().charAt(0).toUpperCase()}</span>
                      <span className="ov-list-text"><strong>{a.business}</strong><small>{a.name}</small></span>
                      {unread[a.id] ? <em className="adm-pill is-hot">{unread[a.id]} new</em> : <em className={`adm-pill is-${stage.tone}`}>{stage.label}</em>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="ov-card">
          <header><h2>Recent activity</h2></header>
          {activity.length === 0 ? (
            <div className="ov-clear is-quiet"><span><Play size={18} /></span><strong>Nothing yet</strong><p>Enquiries, bookings, payments and messages will appear here as they happen.</p></div>
          ) : (
            <ol className="ov-feed">
              {activity.map(({ at, icon: Icon, tone, text, href }, i) => (
                <li key={`${at}-${i}`}>
                  <Link href={href}>
                    <span className={`ov-feed-ic is-${tone}`}><Icon size={15} /></span>
                    <span>{text}</span>
                    <time dateTime={at}>{timeAgo(at)}</time>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section className="ov-card ov-setup">
        <header><h2>Launch readiness</h2><span>{setup.filter((s) => s.done).length} of {setup.length} done</span></header>
        <ul>
          {setup.map(({ label, done, hint, href, icon: Icon, progress }) => (
            <li key={label} className={done ? "is-done" : ""}>
              <Link href={href}>
                <span className="ov-setup-ic">{done ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}</span>
                <span className="ov-list-text"><strong>{label}</strong><small>{hint}</small></span>
                {progress !== undefined && !done && <span className="ov-setup-bar"><i style={{ width: `${Math.min(100, progress * 100)}%` }} /></span>}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
