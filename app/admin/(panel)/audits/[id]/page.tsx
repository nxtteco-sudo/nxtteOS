import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Banknote, ExternalLink, MessageCircle } from "lucide-react";
import { HeroStat, PageHero } from "@/components/admin/page-hero";
import { AdminThread, AuditControls } from "@/components/admin/crm";
import { Tracker } from "@/components/my/tracker";
import { requireAdmin } from "@/lib/auth/admin";
import { ADMIN_AUDIT_COLUMNS, auditStage } from "@/lib/admin-data";
import { getMessages, signedFileUrl } from "@/lib/customer";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { buildWhatsAppLinkTo } from "@/lib/whatsapp";
import { formatDate, type AdminAudit } from "@/types/audit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { data } = await supabaseAdmin().from("audit_requests").select(ADMIN_AUDIT_COLUMNS).eq("id", id).maybeSingle();
  if (!data) notFound();
  const audit = data as AdminAudit;
  const [messages, proofUrl, reportUrl] = await Promise.all([
    getMessages(id),
    audit.payment_proof_path ? signedFileUrl(audit.payment_proof_path, 600) : null,
    audit.report_path ? signedFileUrl(audit.report_path, 600) : null,
  ]);
  const handle = audit.instagram.replace(/^@/, "");
  const stage = auditStage(audit);
  const answers: [string, string][] = [
    ["What they want", audit.goals], ["Best customer", audit.ideal_customer], ["Want to sell more of", audit.best_sellers],
    ["Competitors", audit.competitors], ["Other accounts", audit.other_platforms], ["Anything else", audit.notes],
  ];

  return (
    <div className="ov crm-detail">
      <Link href="/admin/audits" className="crm-back"><ArrowLeft size={16} /> All audits</Link>
      <PageHero
        slim
        kicker={`Audit ${audit.reference ?? ""}`.trim()}
        title={audit.business}
        sub={<>{audit.name} · booked {formatDate(audit.created_at)} · <strong>{stage.label}</strong></>}
        actions={<>
          <a className="ov-btn ov-btn-light" target="_blank" rel="noreferrer" href={buildWhatsAppLinkTo(audit.whatsapp, `Hi ${audit.name.trim().split(/\s+/)[0]}, this is nxtte, about your audit for ${audit.business}.`)}><MessageCircle size={16} /> WhatsApp</a>
          <a className="ov-btn" target="_blank" rel="noreferrer" href={`https://www.instagram.com/${handle}/`}><ExternalLink size={15} /> @{handle}</a>
        </>}
        aside={<HeroStat icon={Banknote} label="Payment" value={audit.payment_status === "paid" ? "Paid" : audit.payment_status === "claimed" ? "Check" : "Unpaid"} sub={`RM ${audit.amount}${audit.paid_at ? `, paid ${formatDate(audit.paid_at)}` : ""}`} />}
      />
      <section className="adm-card crm-track"><Tracker audit={audit} /></section>
      <div className="crm-detail-grid">
        <div className="crm-col">
          <section className="adm-card">
            <h2 className="crm-h">Customer details {audit.details_submitted_at ? <span className="adm-pill is-live">Received {formatDate(audit.details_submitted_at)}</span> : <span className="adm-pill">Not added yet</span>}</h2>
            <dl className="crm-dl">
              <div><dt>WhatsApp</dt><dd>{audit.whatsapp}</dd></div>
              <div><dt>Email</dt><dd>{audit.email ? <a href={`mailto:${audit.email}`}>{audit.email}</a> : "Not added yet"}</dd></div>
              {answers.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || <span className="adm-muted">No answer</span>}</dd></div>)}
            </dl>
          </section>
          <AdminThread auditId={audit.id} messages={messages} customer={audit.name} />
        </div>
        <AuditControls audit={audit} proofUrl={proofUrl} reportUrl={reportUrl} />
      </div>
    </div>
  );
}
