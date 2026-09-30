import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { auditStage, listAudits, unreadByAudit } from "@/lib/admin-data";
import { formatDate } from "@/types/audit";

export default async function AuditsPage() {
  await requireAdmin();
  const [audits, unread] = await Promise.all([listAudits(), unreadByAudit()]);
  const open = audits.filter((a) => !a.report_ready_at).length;
  return (
    <div className="adm-page">
      <header className="adm-head"><div><h1>Audits</h1><p>{open} open, {audits.length - open} delivered.</p></div></header>
      {audits.length === 0 ? (
        <div className="adm-empty"><h2>No audits booked yet</h2><p>Bookings from the audit page appear here, each with its own customer dashboard.</p></div>
      ) : (
        <ul className="adm-list">
          {audits.map((a) => {
            const stage = auditStage(a);
            return (
              <li key={a.id}>
                <Link href={`/admin/audits/${a.id}`} className="adm-row crm-audit-row">
                  <span className="adm-row-text"><strong>{a.business}</strong><small>{a.name} · {a.reference ?? "no reference"} · booked {formatDate(a.created_at)}</small></span>
                  {unread[a.id] ? <span className="adm-pill is-hot">{unread[a.id]} new</span> : null}
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
