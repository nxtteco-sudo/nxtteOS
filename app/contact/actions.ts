'use server'

import { isAdminConfigured } from '@/lib/auth/admin'
import { TOO_MANY, looksAutomated, overLimit } from '@/lib/spam-guard'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { alertAdmin, esc } from '@/lib/email'
import { contactSchema, type ActionResult } from '@/lib/validation/forms'

export async function submitContactForm(formData: FormData): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '')
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { success: false, error: 'Check the highlighted fields.', fieldErrors }
  }

  if (!isAdminConfigured()) {
    console.error('[contact] Supabase env vars are not configured')
    return { success: false, error: 'Something went wrong. Message us on WhatsApp instead.' }
  }
  // Bots get a normal-looking success and nothing is saved.
  if (looksAutomated(formData)) return { success: true }
  if (await overLimit('contact')) return { success: false, error: TOO_MANY }

  // Saved with the server key: the public key cannot write to this table (migration 0010).
  const { error } = await supabaseAdmin().from('contact_submissions').insert(parsed.data)
  if (error) {
    console.error('[contact] insert failed', error.message)
    return { success: false, error: 'Something went wrong. Message us on WhatsApp instead.' }
  }

  const d = parsed.data
  await alertAdmin(
    `New enquiry: ${d.business}`,
    'New contact enquiry',
    [`<b>${esc(d.name)}</b>, ${esc(d.business)}`, `Wants: ${esc(d.service_interest)}`, `Instagram: ${esc(d.instagram)}`, `WhatsApp: ${esc(d.whatsapp)}`],
    '/admin/leads',
  )

  return { success: true }
}
