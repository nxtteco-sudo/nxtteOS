import Link from "next/link";
import { ArrowRight, ClipboardCheck, FileSearch, Sparkles, Ticket } from "lucide-react";
import { EmptyState, HeroStat, PageHero } from "@/components/admin/page-hero";
import { requireAdmin } from "@/lib/auth/admin";
import { auditStage, listAudits, unreadByAudit } from "@/lib/admin-data";
import { formatDate } from "@/types/audit";

export default async function AuditsPage() {
  await requireAdmin();
  const [audits, unread] = await Promise.all([listAudits(), unreadByAudit()]);
  const open = audits.filter((a) => !a.report_ready_at).length;
  const yourMove = audits.filter((a) => auditStage(a).tone === "you" || unread[a.id]).length;
  const initials = (s: string) => s.trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("");

  return (
    <div className="ov">
      <PageHero
        slim
        kicker="Customers"
        title="Audits"
        accent={yourMove ? "need you." : "on track."}
        sub={<><strong>{open}</strong> open, {audits.length - open} delivered. Open one to approve details, confirm payment, deliver the report or reply.</>}
        aside={<HeroStat icon={ClipboardCheck} label="Your move" value={String(yourMove)} sub={`${audits.length} booked in total`} />}
      />
      {audits.length === 0 ? (
        <EmptyState icons={[Ticket, FileSearch, Sparkles]} title="No audits booked yet." body="Bookings from the RM 199 audit page appear here, each with its own customer dashboard, tracker and messages." action={<a href="/audit" target="_blank" rel="noreferrer" className="adm-btn adm-btn-primary">Open the audit page</a>} />
      ) : (
        <ul className="adm-list">
          {audits.map((a) => {
            const stage = auditStage(a);
            return (
              <li key={a.id}>
                <Link href={`/admin/audits/${a.id}`} className="adm-row crm-audit-row pg-audit-row">
                  <span className={`pg-row-ic is-${stage.tone}`} aria-hidden="true">{initials(a.business) || "A"}</span>
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
