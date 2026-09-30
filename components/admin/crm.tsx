"use client";

// Client controls for the admin CRM: lead cards, audit controls, the message
// thread and the payment settings form.
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, ExternalLink, FileUp, Loader2, MessageCircle, SendHorizontal, Undo2, X } from "lucide-react";
import { createCustomerLink, markCustomerMessagesRead, reviewAudit, saveAuditNotes, savePaymentSettings, sendAdminMessage, setPaid, setWorkStarted, updateLead, uploadReport } from "@/app/admin/crm-actions";
import { buildWhatsAppLinkTo } from "@/lib/whatsapp";
import { formatDate, type AdminAudit, type AuditMessage, type PaymentSettings } from "@/types/audit";

export type Lead = { id: string; name: string; business: string; instagram: string; whatsapp: string; service_interest: string; status: "new" | "contacted" | "won" | "lost"; admin_notes: string; created_at: string };

const LEAD_STATUS = [["new", "New"], ["contacted", "Contacted"], ["won", "Won"], ["lost", "Lost"]] as const;

function useSaver() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, okText = "Saved") =>
    start(async () => {
      const res = await fn();
      setNote(res.ok ? { ok: true, text: okText } : { ok: false, text: res.error ?? "Could not save." });
      if (res.ok) router.refresh();
    });
  return { pending, note, run, setNote };
}

function Note({ note }: { note: { ok: boolean; text: string } | null }) {
  if (!note) return null;
  return <span className={note.ok ? "crm-ok" : "adm-error"} role={note.ok ? "status" : "alert"}>{note.ok && <Check size={14} strokeWidth={3} />} {note.text}</span>;
}

export function LeadCard({ lead }: { lead: Lead }) {
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.admin_notes);
  const { pending, note, run } = useSaver();
  const dirty = status !== lead.status || notes !== lead.admin_notes;
  const handle = lead.instagram.replace(/^@/, "");
  return (
    <li className={`crm-lead is-${lead.status}`}>
      <div className="crm-lead-main">
        <div>
          <strong>{lead.business}</strong>
          <span>{lead.name} · {formatDate(lead.created_at)}</span>
        </div>
        <span className="crm-want">{lead.service_interest}</span>
      </div>
      <div className="crm-lead-actions">
        <a className="adm-btn adm-btn-primary" target="_blank" rel="noreferrer" href={buildWhatsAppLinkTo(lead.whatsapp, `Hi ${lead.name}, this is nxtte. Thanks for getting in touch about ${lead.business}.`)}><MessageCircle size={16} /> Reply on WhatsApp</a>
        <a className="adm-btn" target="_blank" rel="noreferrer" href={`https://www.instagram.com/${handle}/`}><ExternalLink size={15} /> @{handle}</a>
        <span className="adm-muted">{lead.whatsapp}</span>
      </div>
      <div className="crm-lead-edit">
        <label className="adm-field crm-status"><span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as Lead["status"])}>{LEAD_STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </label>
        <label className="adm-field"><span>Private notes</span>
          <textarea rows={2} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Only you see this" />
        </label>
        <div className="crm-row">
          <button type="button" className="adm-btn" disabled={pending || !dirty} onClick={() => run(() => updateLead({ id: lead.id, status, notes }))}>{pending && <Loader2 size={15} className="adm-spin" />} Save</button>
          <Note note={note} />
        </div>
      </div>
    </li>
  );
}

export function AuditControls({ audit, proofUrl, reportUrl }: { audit: AdminAudit; proofUrl: string | null; reportUrl: string | null }) {
  const { pending, note, run, setNote } = useSaver();
  const [notes, setNotes] = useState(audit.admin_notes);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");
  const reviewState = audit.approved_at ? "approved" : audit.declined_at ? "declined" : audit.details_submitted_at ? "waiting" : "none";
  const firstName = audit.name.trim().split(/\s+/)[0];

  async function makeLink() {
    const res = await createCustomerLink(audit.id);
    if (!res.ok) { setNote({ ok: false, text: res.error }); return null; }
    setLink(res.link);
    return res.link;
  }

  return (
    <div className="crm-controls">
      <section className={`adm-card ${reviewState === "waiting" ? "crm-review-due" : ""}`}>
        <h2 className="crm-h">Review <span className={`adm-pill ${reviewState === "approved" ? "is-live" : reviewState === "waiting" ? "is-wait" : ""}`}>{reviewState === "approved" ? "Approved" : reviewState === "declined" ? "Declined" : reviewState === "waiting" ? "Waiting for you" : "No details yet"}</span></h2>
        <p className="adm-muted">
          {reviewState === "approved" ? `Approved ${formatDate(audit.approved_at as string)}. The customer can now pay.`
            : reviewState === "declined" ? `Declined ${formatDate(audit.declined_at as string)}: ${audit.decline_reason}`
            : reviewState === "waiting" ? "Read their details on the left. Approving opens the Payment step and emails them."
            : "The customer has not added their details yet. Payment stays locked until you approve."}
        </p>
        {reviewState === "waiting" && !declining && (
          <div className="crm-row">
            <button type="button" className="adm-btn adm-btn-primary" disabled={pending} onClick={() => run(() => reviewAudit(audit.id, "approve"), "Approved. Payment is open.")}><Check size={16} /> Approve, open payment</button>
            <button type="button" className="adm-btn adm-btn-danger" disabled={pending} onClick={() => setDeclining(true)}><X size={15} /> Decline</button>
          </div>
        )}
        {reviewState === "waiting" && declining && (
          <div className="crm-decline">
            <label className="adm-field"><span>Reason the customer will see</span>
              <textarea rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: we are not the right fit for this type of business yet." />
            </label>
            <div className="crm-row">
              <button type="button" className="adm-btn adm-btn-danger" disabled={pending || !reason.trim()} onClick={() => run(() => reviewAudit(audit.id, "decline", reason), "Declined. Customer emailed.")}>Decline audit</button>
              <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setDeclining(false)}>Cancel</button>
            </div>
          </div>
        )}
        {(reviewState === "approved" || reviewState === "declined") && audit.payment_status === "unpaid" && (
          <div className="crm-row"><button type="button" className="adm-btn adm-btn-ghost" disabled={pending} onClick={() => run(() => reviewAudit(audit.id, null), "Back to waiting for review")}><Undo2 size={15} /> Undo</button></div>
        )}
      </section>

      <section className="adm-card">
        <h2 className="crm-h">Payment <span className={`adm-pill ${audit.payment_status === "paid" ? "is-live" : audit.payment_status === "claimed" ? "is-wait" : ""}`}>{audit.payment_status === "paid" ? "Paid" : audit.payment_status === "claimed" ? "Customer says paid" : "Unpaid"}</span></h2>
        <p className="adm-muted">RM {audit.amount} · reference {audit.reference ?? "none"}{audit.paid_at ? ` · paid ${formatDate(audit.paid_at)}` : audit.payment_claimed_at ? ` · claimed ${formatDate(audit.payment_claimed_at)}` : ""}</p>
        <div className="crm-row">
          {audit.payment_status === "paid"
            ? <button type="button" className="adm-btn adm-btn-ghost" disabled={pending} onClick={() => run(() => setPaid(audit.id, false), "Marked unpaid")}><Undo2 size={15} /> Undo</button>
            : <button type="button" className="adm-btn adm-btn-primary" disabled={pending} onClick={() => run(() => setPaid(audit.id, true), "Marked paid. Customer emailed.")}><Check size={16} /> Mark as paid</button>}
          {proofUrl && <a className="adm-btn" href={proofUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> View receipt</a>}
        </div>
      </section>

      <section className="adm-card">
        <h2 className="crm-h">Work <span className={`adm-pill ${audit.report_ready_at ? "is-live" : audit.work_started_at ? "is-wait" : ""}`}>{audit.report_ready_at ? "Report delivered" : audit.work_started_at ? "In progress" : "Not started"}</span></h2>
        <div className="crm-row">
          {!audit.report_ready_at && (audit.work_started_at
            ? <button type="button" className="adm-btn adm-btn-ghost" disabled={pending} onClick={() => run(() => setWorkStarted(audit.id, false), "Set back to not started")}><Undo2 size={15} /> Not started</button>
            : <button type="button" className="adm-btn" disabled={pending} onClick={() => run(() => setWorkStarted(audit.id, true), "Started. Customer emailed.")}>Start the audit</button>)}
          {reportUrl && <a className="adm-btn" href={reportUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Open current report</a>}
        </div>
        <form className="crm-upload" onSubmit={(e) => { e.preventDefault(); const data = new FormData(e.currentTarget); run(() => uploadReport(data), "Report delivered. Customer emailed."); }}>
          <input type="hidden" name="id" value={audit.id} />
          <label className="adm-field"><span>{audit.report_ready_at ? "Replace the report (PDF)" : "Upload the report (PDF) to deliver it"}</span>
            <input ref={fileRef} type="file" name="file" accept="application/pdf" required />
          </label>
          <button type="submit" className="adm-btn adm-btn-primary" disabled={pending}>{pending ? <Loader2 size={15} className="adm-spin" /> : <FileUp size={16} />} {audit.report_ready_at ? "Replace report" : "Deliver report"}</button>
        </form>
        <p className="adm-muted">Delivering starts the customer&rsquo;s 14-day credit countdown.</p>
      </section>

      <section className="adm-card">
        <h2 className="crm-h">Customer link</h2>
        <p className="adm-muted">Their private dashboard link. Send it on WhatsApp if they have not added an email yet.</p>
        <div className="crm-row">
          <button type="button" className="adm-btn" onClick={async () => { const l = link ?? (await makeLink()); if (!l) return; try { await navigator.clipboard.writeText(l); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* shown below to copy by hand */ } }}>{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy link"}</button>
          <button type="button" className="adm-btn adm-btn-primary" onClick={async () => { const l = link ?? (await makeLink()); if (l) window.open(buildWhatsAppLinkTo(audit.whatsapp, `Hi ${firstName}, this is nxtte. Here is your private audit dashboard for ${audit.business}: ${l}`), "_blank", "noopener"); }}><MessageCircle size={16} /> Send on WhatsApp</button>
        </div>
        {link && <p className="crm-link">{link}</p>}
      </section>

      <section className="adm-card">
        <h2 className="crm-h">Private notes</h2>
        <label className="adm-field"><span className="adm-sr">Private notes</span>
          <textarea rows={4} maxLength={4000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Only you see this" />
        </label>
        <div className="crm-row">
          <button type="button" className="adm-btn" disabled={pending || notes === audit.admin_notes} onClick={() => run(() => saveAuditNotes(audit.id, notes))}>Save notes</button>
        </div>
      </section>
      <Note note={note} />
    </div>
  );
}

export function AdminThread({ auditId, messages, customer }: { auditId: string; messages: AuditMessage[]; customer: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [messages.length]);
  useEffect(() => {
    if (messages.some((m) => m.sender === "customer" && !m.read_at)) void markCustomerMessagesRead(auditId);
  }, [auditId, messages]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    start(async () => {
      const res = await sendAdminMessage(auditId, text);
      if (!res.ok) return setError(res.error);
      setText("");
      router.refresh();
    });
  }

  return (
    <section className="adm-card crm-thread">
      <h2 className="crm-h">Messages</h2>
      <div className="crm-log" role="log" aria-live="polite">
        {messages.length === 0 && <p className="adm-muted">No messages yet. Your reply shows in their dashboard and is emailed to them if they added an email.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`crm-msg ${m.sender === "nxtte" ? "is-us" : "is-them"}`}>
            <p>{m.body}</p>
            <time dateTime={m.created_at}>{m.sender === "nxtte" ? "nxtte" : customer} · {formatDate(m.created_at)}</time>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form className="crm-reply" onSubmit={submit}>
        <label className="adm-field"><span className="adm-sr">Reply</span>
          <textarea rows={3} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} placeholder={`Reply to ${customer}`} />
        </label>
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button type="submit" className="adm-btn adm-btn-primary" disabled={pending || !text.trim()}>{pending ? <Loader2 size={15} className="adm-spin" /> : <SendHorizontal size={16} />} Send reply</button>
      </form>
    </section>
  );
}

const PAYMENT_FIELDS = [
  ["bank_name", "Bank", "For example: Maybank"],
  ["account_name", "Account name", "The name customers will see, for example Aurexis Solution"],
  ["account_number", "Account number", ""],
  ["duitnow_id", "DuitNow ID (optional)", "Business registration or phone number registered with DuitNow"],
  ["note", "Note shown under the details (optional)", "For example: Transfers may take a few minutes to arrive."],
] as const;

export function PaymentSettingsForm({ settings }: { settings: PaymentSettings }) {
  const [values, setValues] = useState(settings);
  const { pending, note, run } = useSaver();
  return (
    <form className="adm-card crm-settings" onSubmit={(e) => { e.preventDefault(); run(() => savePaymentSettings(values)); }}>
      <h2 className="crm-h">Payment details shown to customers</h2>
      <p className="adm-muted">Customers see these on their Payment page to pay the RM 199. Leave the account number and DuitNow ID empty and they are told you will send details on WhatsApp.</p>
      {PAYMENT_FIELDS.map(([key, label, hint]) => (
        <label key={key} className="adm-field"><span>{label}</span>
          <input value={values[key]} placeholder={hint} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} />
        </label>
      ))}
      <div className="crm-row">
        <button type="submit" className="adm-btn adm-btn-primary" disabled={pending}>{pending && <Loader2 size={15} className="adm-spin" />} Save payment details</button>
        <Note note={note} />
      </div>
    </form>
  );
}
