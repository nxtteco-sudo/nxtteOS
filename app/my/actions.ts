'use server'

import { randomUUID } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { isAdminConfigured } from '@/lib/auth/admin'
import { MY_COOKIE, PRIVATE_BUCKET, issueToken, privateLink, requireMyAudit } from '@/lib/customer'
import { alertAdmin, esc, sendEmail } from '@/lib/email'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { auditDetailsSchema } from '@/lib/validation/forms'

type Result = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> }

const refresh = () => revalidatePath('/my', 'layout')

// "Email me my link": always answers the same way so nobody can test which
// emails have booked an audit.
export async function requestLink(_prev: { sent: boolean; error?: string } | null, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { sent: false, error: 'Enter a valid email address.' }
  if (!isAdminConfigured()) return { sent: false, error: 'The dashboard is not connected yet. Message us on WhatsApp instead.' }

  const { data } = await supabaseAdmin()
    .from('audit_requests')
    .select('id, name, business')
    .ilike('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (data) {
    const link = privateLink(await issueToken(data.id))
    await sendEmail({
      to: email,
      subject: 'Your nxtte audit dashboard link',
      heading: `Here is your dashboard, ${data.name}`,
      lines: [`This private link opens the audit dashboard for ${esc(data.business)}. Keep it to yourself: anyone with the link can open it.`],
      cta: { label: 'Open my dashboard', href: link },
    })
  }
  return { sent: true }
}

export async function saveDetails(values: Record<string, string>): Promise<Result> {
  const audit = await requireMyAudit()
  const parsed = auditDetailsSchema.safeParse(values)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '')
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ok: false, error: 'Check the highlighted fields.', fieldErrors }
  }
  const first = !audit.details_submitted_at
  const { error } = await supabaseAdmin()
    .from('audit_requests')
    .update({ ...parsed.data, details_submitted_at: audit.details_submitted_at ?? new Date().toISOString() })
    .eq('id', audit.id)
  if (error) {
    console.error('[my] saveDetails failed', error.message)
    return { ok: false, error: 'Could not save. Try again.' }
  }

  if (first) {
    await alertAdmin(`Audit details in: ${audit.business}`, 'A customer added their audit details', [`<b>${esc(audit.name)}</b>, ${esc(audit.business)}`, `Goals: ${esc(parsed.data.goals)}`], `/admin/audits/${audit.id}`)
  }
  if (first || audit.email !== parsed.data.email) {
    await sendEmail({
      to: parsed.data.email,
      subject: 'Your nxtte audit dashboard link',
      heading: 'Keep this link to get back in',
      lines: [`This is the private link to the audit dashboard for ${esc(audit.business)}. Use it on any device. Anyone with the link can open it, so keep it to yourself.`],
      cta: { label: 'Open my dashboard', href: privateLink(await issueToken(audit.id)) },
    })
  }
  refresh()
  return { ok: true }
}

const PROOF_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' }
const MAX_PROOF_BYTES = 5 * 1024 * 1024

// The customer says they have paid (optionally with a receipt). nxtte confirms
// it in the admin; only then does the audit count as paid.
export async function claimPayment(formData: FormData): Promise<Result> {
  const audit = await requireMyAudit()
  if (audit.payment_status === 'paid') return { ok: true }

  let proofPath = audit.payment_proof_path
  const file = formData.get('proof')
  if (file instanceof File && file.size > 0) {
    const ext = PROOF_TYPES[file.type]
    if (!ext) return { ok: false, error: 'Upload a JPG, PNG, WebP or PDF.' }
    if (file.size > MAX_PROOF_BYTES) return { ok: false, error: 'The file must be 5 MB or smaller.' }
    proofPath = `proofs/${audit.id}/${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`
    const { error } = await supabaseAdmin().storage.from(PRIVATE_BUCKET).upload(proofPath, file, { contentType: file.type })
    if (error) {
      console.error('[my] proof upload failed', error.message)
      return { ok: false, error: 'Could not upload the receipt. Try again, or send it on WhatsApp.' }
    }
  }

  const { error } = await supabaseAdmin()
    .from('audit_requests')
    .update({ payment_status: 'claimed', payment_claimed_at: new Date().toISOString(), payment_proof_path: proofPath })
    .eq('id', audit.id)
  if (error) return { ok: false, error: 'Could not save. Try again.' }

  await alertAdmin(`Payment to confirm: ${audit.business}`, 'A customer says they have paid', [`<b>${esc(audit.name)}</b>, ${esc(audit.business)}`, `RM ${audit.amount}, reference ${esc(audit.reference ?? '')}`, proofPath ? 'A receipt is attached in the admin.' : 'No receipt attached.'], `/admin/audits/${audit.id}`)
  refresh()
  return { ok: true }
}

export async function sendMessage(body: string): Promise<Result> {
  const audit = await requireMyAudit()
  const text = body.trim()
  if (!text) return { ok: false, error: 'Write a message first.' }
  if (text.length > 2000) return { ok: false, error: 'Keep it under 2,000 characters.' }
  const { error } = await supabaseAdmin().from('audit_messages').insert({ audit_id: audit.id, sender: 'customer', body: text })
  if (error) return { ok: false, error: 'Could not send. Try again.' }
  await alertAdmin(`New message: ${audit.business}`, `Message from ${audit.name}`, [esc(text)], `/admin/audits/${audit.id}`)
  refresh()
  return { ok: true }
}

export async function markMessagesRead() {
  const audit = await requireMyAudit()
  await supabaseAdmin().from('audit_messages').update({ read_at: new Date().toISOString() }).eq('audit_id', audit.id).eq('sender', 'nxtte').is('read_at', null)
}

export async function signOutCustomer() {
  ;(await cookies()).delete({ name: MY_COOKIE, path: '/my' })
  redirect('/my')
}
