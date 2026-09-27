'use server'

import { createSupabaseClient } from '@/lib/supabase/server'
import { auditSchema, type ActionResult } from '@/lib/validation/forms'

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

  const supabase = createSupabaseClient()
  if (!supabase) {
    console.error('[audit] Supabase env vars are not configured')
    return { success: false, error: 'Something went wrong. Message us on WhatsApp instead.' }
  }

  const { error } = await supabase.from('audit_requests').insert(parsed.data)
  if (error) {
    console.error('[audit] insert failed', error.message)
    return { success: false, error: 'Something went wrong. Message us on WhatsApp instead.' }
  }

  // TODO: email alert on new audit request. No email provider or recipient has been
  // chosen yet (AGENTS.md §9: "Server action -> Supabase -> email alert"). Until then
  // new rows are only visible in Supabase.

  return { success: true }
}
