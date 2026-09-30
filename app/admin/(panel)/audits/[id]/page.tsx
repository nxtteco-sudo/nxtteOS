import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MessageCircle } from "lucide-react";
import { AdminThread, AuditControls } from "@/components/admin/crm";
import { Tracker } from "@/components/my/tracker";
import { requireAdmin } from "@/lib/auth/admin";
import { ADMIN_AUDIT_COLUMNS } from "@/lib/admin-data";
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
  const answers: [string, string][] = [
    ["What they want", audit.goals], ["Best customer", audit.ideal_customer], ["Want to sell more of", audit.best_sellers],
    ["Competitors", audit.competitors], ["Other accounts", audit.other_platforms], ["Anything else", audit.notes],
  ];

  return (
    <div className="adm-page crm-detail">
      <Link href="/admin/audits" className="crm-back"><ArrowLeft size={16} /> All audits</Link>
      <header className="adm-head">
        <div><h1>{audit.business}</h1><p>{audit.name} · {audit.reference ?? "no reference"} · booked {formatDate(audit.created_at)}</p></div>
        <div className="crm-row">
          <a className="adm-btn adm-btn-primary" target="_blank" rel="noreferrer" href={buildWhatsAppLinkTo(audit.whatsapp, `Hi ${audit.name.trim().split(/\s+/)[0]}, this is nxtte, about your audit for ${audit.business}.`)}><MessageCircle size={16} /> WhatsApp</a>
          <a className="adm-btn" target="_blank" rel="noreferrer" href={`https://www.instagram.com/${handle}/`}><ExternalLink size={15} /> @{handle}</a>
        </div>
      </header>
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
