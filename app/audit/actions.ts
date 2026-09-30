'use server'

import { isAdminConfigured } from '@/lib/auth/admin'
import { issueToken, newReference, setMyCookie } from '@/lib/customer'
import { alertAdmin, esc } from '@/lib/email'
import { TOO_MANY, looksAutomated, overLimit } from '@/lib/spam-guard'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { auditSchema, type ActionResult } from '@/lib/validation/forms'

const FAILED = 'Something went wrong. Message us on WhatsApp instead.'

// Books an audit: saves the request, creates the customer's private dashboard
// link, signs them in to it and alerts nxtte. The customer lands on /my.
export async function submitAuditRequest(formData: FormData): Promise<ActionResult> {
  const parsed = auditSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '')
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { success: false, error: 'Check the highlighted fields.', fieldErrors }
  }

  if (!isAdminConfigured()) {
    console.error('[audit] Supabase env vars are not configured')
    return { success: false, error: FAILED }
  }
  // Bots get a normal-looking success and nothing is saved.
  if (looksAutomated(formData)) return { success: true, redirectTo: '/thanks' }
  if (await overLimit('audit')) return { success: false, error: TOO_MANY }

  const { data, error } = await supabaseAdmin()
    .from('audit_requests')
    .insert({ ...parsed.data, reference: newReference() })
    .select('id, reference')
    .single()
  if (error || !data) {
    console.error('[audit] insert failed', error?.message)
    return { success: false, error: FAILED }
  }

  try {
    await setMyCookie(await issueToken(data.id))
  } catch (e) {
    console.error('[audit] could not create the private link', e)
    return { success: true, redirectTo: '/thanks' }
  }

  const { name, business, instagram, whatsapp } = parsed.data
  await alertAdmin(
    `New audit booked: ${business}`,
    'New audit booked',
    [`<b>${esc(name)}</b>, ${esc(business)}`, `Instagram: ${esc(instagram)}`, `WhatsApp: ${esc(whatsapp)}`, `Reference: ${esc(data.reference ?? '')}`],
    `/admin/audits/${data.id}`,
  )
  return { success: true, redirectTo: '/my?welcome=1' }
}
