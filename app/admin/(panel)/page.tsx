import Link from "next/link";
import { ArrowRight, ClipboardCheck, CreditCard, Inbox, MessagesSquare, Play } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { auditStage, listAudits, unreadByAudit } from "@/lib/admin-data";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDate } from "@/types/audit";

export default async function AdminOverview() {
  await requireAdmin();
  const [audits, unread, leads] = await Promise.all([
    listAudits(),
    unreadByAudit(),
    supabaseAdmin().from("contact_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  const toConfirm = audits.filter((a) => a.payment_status === "claimed");
  const ready = audits.filter((a) => a.payment_status === "paid" && a.details_submitted_at && !a.work_started_at && !a.report_ready_at);
  const inProgress = audits.filter((a) => a.work_started_at && !a.report_ready_at);
  const unreadTotal = Object.values(unread).reduce((a, b) => a + b, 0);
  const needsYou = audits.filter((a) => auditStage(a).tone === "you" || unread[a.id]);

  const tiles = [
    { icon: Inbox, label: "New enquiries", value: leads.count ?? 0, href: "/admin/leads" },
    { icon: CreditCard, label: "Payments to confirm", value: toConfirm.length, href: "/admin/audits" },
    { icon: Play, label: "Audits ready to start", value: ready.length, href: "/admin/audits" },
    { icon: ClipboardCheck, label: "Audits in progress", value: inProgress.length, href: "/admin/audits" },
    { icon: MessagesSquare, label: "Unread messages", value: unreadTotal, href: "/admin/audits" },
  ];

  return (
    <div className="adm-page">
      <header className="adm-head"><div><h1>Overview</h1><p>What needs you today.</p></div></header>
      <ul className="crm-tiles">
        {tiles.map(({ icon: Icon, label, value, href }) => (
          <li key={label}><Link href={href} className={value ? "is-hot" : ""}><Icon size={18} /><strong>{value}</strong><span>{label}</span></Link></li>
        ))}
      </ul>
      <h2 className="crm-sub">Needs you</h2>
      {needsYou.length === 0 ? (
        <div className="adm-empty"><h2>All clear</h2><p>No payments to confirm, audits to start or messages to answer.</p></div>
      ) : (
        <ul className="adm-list">
          {needsYou.map((a) => {
            const stage = auditStage(a);
            return (
              <li key={a.id}>
                <Link href={`/admin/audits/${a.id}`} className="adm-row crm-audit-row">
                  <span className="adm-row-text"><strong>{a.business}</strong><small>{a.name} · booked {formatDate(a.created_at)}</small></span>
                  {unread[a.id] ? <span className="adm-pill is-hot">{unread[a.id]} new message{unread[a.id] > 1 ? "s" : ""}</span> : null}
                  <span className={`adm-pill is-${stage.tone}`}>{stage.label}</span>
                  <ArrowRight size={16} className="adm-row-go" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
