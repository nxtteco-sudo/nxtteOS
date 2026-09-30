'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { PRIVATE_BUCKET, issueToken, privateLink } from '@/lib/customer'
import { esc, sendEmail } from '@/lib/email'
import { supabaseAdmin } from '@/lib/supabase/admin'

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const FAILED = { ok: false as const, error: 'Could not save. Try again.' }

function refresh(auditId?: string) {
  revalidatePath('/admin', 'layout')
  revalidatePath('/my', 'layout')
  if (auditId) revalidatePath(`/admin/audits/${auditId}`)
}

async function loadAudit(id: string) {
  if (!UUID_RE.test(id)) return null
  const { data } = await supabaseAdmin()
    .from('audit_requests')
    .select('id, name, business, email, amount, reference, paid_at, work_started_at, report_path')
    .eq('id', id)
    .maybeSingle()
  return data
}

// Emails the customer (when we have their email) with a fresh private link.
async function notifyCustomer(audit: { id: string; email: string | null }, subject: string, heading: string, lines: string[], label = 'Open my dashboard') {
  if (!audit.email) return
  await sendEmail({ to: audit.email, subject, heading, lines, cta: { label, href: privateLink(await issueToken(audit.id)) } })
}

// ---- Leads (contact form) ----------------------------------------------------

const leadSchema = z.object({
  id: z.string().regex(UUID_RE),
  status: z.enum(['new', 'contacted', 'won', 'lost']),
  notes: z.string().max(2000),
})

export async function updateLead(input: z.input<typeof leadSchema>): Promise<Result> {
  await requireAdmin()
  const parsed = leadSchema.safeParse(input)
  if (!parsed.success) return FAILED
  const { error } = await supabaseAdmin().from('contact_submissions').update({ status: parsed.data.status, admin_notes: parsed.data.notes }).eq('id', parsed.data.id)
  if (error) return FAILED
  refresh()
  return { ok: true }
}

// ---- Audits ------------------------------------------------------------------

export async function saveAuditNotes(id: string, notes: string): Promise<Result> {
  await requireAdmin()
  if (!UUID_RE.test(id) || notes.length > 4000) return FAILED
  const { error } = await supabaseAdmin().from('audit_requests').update({ admin_notes: notes }).eq('id', id)
  if (error) return FAILED
  refresh(id)
  return { ok: true }
}

// Approving the customer's details opens the Payment step for them. Declining
// closes the audit and shows the reason. Passing null undoes either.
export async function reviewAudit(id: string, decision: 'approve' | 'decline' | null, reason = ''): Promise<Result> {
  await requireAdmin()
  const audit = await loadAudit(id)
  if (!audit) return FAILED
  const text = reason.trim().slice(0, 500)
  if (decision === 'decline' && !text) return { ok: false, error: 'Write a short reason the customer will see.' }
  const now = new Date().toISOString()
  const patch =
    decision === 'approve' ? { approved_at: now, declined_at: null, decline_reason: '' }
    : decision === 'decline' ? { approved_at: null, declined_at: now, decline_reason: text }
    : { approved_at: null, declined_at: null, decline_reason: '' }
  const { error } = await supabaseAdmin().from('audit_requests').update(patch).eq('id', id)
  if (error) return FAILED
  if (decision === 'approve') {
    await notifyCustomer(audit, 'Your audit is approved: payment is open', 'You are approved. Payment is open.', [`We have reviewed your details for ${esc(audit.business)} and we are a good fit.`, `Pay RM ${audit.amount} in your dashboard and we start your audit.`], 'Pay for my audit')
  } else if (decision === 'decline') {
    await notifyCustomer(audit, 'About your nxtte audit request', 'We cannot take this audit on', [esc(text), 'You have not been charged. Reply to this email or message us on WhatsApp if you have questions.'])
  }
  refresh(id)
  return { ok: true }
}

export async function setPaid(id: string, paid: boolean): Promise<Result> {
  await requireAdmin()
  const audit = await loadAudit(id)
  if (!audit) return FAILED
  const { error } = await supabaseAdmin()
    .from('audit_requests')
    .update(paid ? { payment_status: 'paid', paid_at: new Date().toISOString() } : { payment_status: 'unpaid', paid_at: null, payment_claimed_at: null })
    .eq('id', id)
  if (error) return FAILED
  if (paid) {
    await notifyCustomer(audit, 'Payment confirmed: your nxtte audit', 'We have your payment. Thank you.', [`Your RM ${audit.amount} for the ${esc(audit.business)} audit is confirmed (reference ${esc(audit.reference ?? '')}).`, 'Your receipt is in your dashboard. We start as soon as we also have your details.'])
  }
  refresh(id)
  return { ok: true }
}

export async function setWorkStarted(id: string, started: boolean): Promise<Result> {
  await requireAdmin()
  const audit = await loadAudit(id)
  if (!audit) return FAILED
  const { error } = await supabaseAdmin().from('audit_requests').update({ work_started_at: started ? new Date().toISOString() : null }).eq('id', id)
  if (error) return FAILED
  if (started) await notifyCustomer(audit, 'We have started your audit', 'Your audit is under way', [`We have everything we need for ${esc(audit.business)} and have started work. Your report follows within five working days.`])
  refresh(id)
  return { ok: true }
}

const MAX_REPORT_BYTES = 10 * 1024 * 1024

// Uploading the PDF delivers the report: the customer can download it at once
// and the 14-day credit starts counting.
export async function uploadReport(formData: FormData): Promise<Result> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const file = formData.get('file')
  const audit = await loadAudit(id)
  if (!audit) return FAILED
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'Choose the report PDF first.' }
  if (file.type !== 'application/pdf') return { ok: false, error: 'The report must be a PDF.' }
  if (file.size > MAX_REPORT_BYTES) return { ok: false, error: 'The PDF must be 10 MB or smaller.' }

  const path = `reports/${id}/${Date.now()}-${randomUUID().slice(0, 8)}.pdf`
  const storage = supabaseAdmin().storage.from(PRIVATE_BUCKET)
  const { error: uploadError } = await storage.upload(path, file, { contentType: 'application/pdf' })
  if (uploadError) {
    console.error('[admin] report upload failed', uploadError.message)
    return { ok: false, error: 'Upload failed. Try again.' }
  }
  const now = new Date().toISOString()
  const { error } = await supabaseAdmin()
    .from('audit_requests')
    .update({ report_path: path, report_ready_at: now, work_started_at: audit.work_started_at ?? now })
    .eq('id', id)
  if (error) return FAILED
  if (audit.report_path) await storage.remove([audit.report_path])

  await notifyCustomer(audit, 'Your nxtte audit report is ready', 'Your report is ready', [`The audit and 90-day roadmap for ${esc(audit.business)} are ready to download.`, `Sign a package within 14 days and your RM ${audit.amount} comes off the first month.`], 'Open my report')
  refresh(id)
  return { ok: true }
}

export async function sendAdminMessage(id: string, body: string): Promise<Result> {
  await requireAdmin()
  const audit = await loadAudit(id)
  const text = body.trim()
  if (!audit || !text || text.length > 2000) return { ok: false, error: 'Write a message first (up to 2,000 characters).' }
  const { error } = await supabaseAdmin().from('audit_messages').insert({ audit_id: id, sender: 'nxtte', body: text })
  if (error) return FAILED
  await notifyCustomer(audit, 'New message from nxtte', 'You have a new message', [esc(text)], 'Reply in my dashboard')
  refresh(id)
  return { ok: true }
}

export async function markCustomerMessagesRead(id: string) {
  await requireAdmin()
  if (!UUID_RE.test(id)) return
  await supabaseAdmin().from('audit_messages').update({ read_at: new Date().toISOString() }).eq('audit_id', id).eq('sender', 'customer').is('read_at', null)
  revalidatePath('/admin', 'layout')
}

// A fresh private link for this customer, to copy or send on WhatsApp.
export async function createCustomerLink(id: string): Promise<Result<{ link: string }>> {
  await requireAdmin()
  if (!UUID_RE.test(id)) return FAILED
  try {
    return { ok: true, link: privateLink(await issueToken(id)) }
  } catch {
    return FAILED
  }
}

// ---- Settings ----------------------------------------------------------------

const paymentSchema = z.object({
  bank_name: z.string().trim().max(80),
  account_name: z.string().trim().max(120),
  account_number: z.string().trim().max(40),
  duitnow_id: z.string().trim().max(60),
  note: z.string().trim().max(300),
})

export async function savePaymentSettings(input: z.input<typeof paymentSchema>): Promise<Result> {
  await requireAdmin()
  const parsed = paymentSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'One of the fields is too long.' }
  const { error } = await supabaseAdmin().from('app_settings').upsert({ key: 'payment', value: parsed.data, updated_at: new Date().toISOString() })
  if (error) return FAILED
  refresh()
  return { ok: true }
}
