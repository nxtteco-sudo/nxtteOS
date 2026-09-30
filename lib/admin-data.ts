import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { AdminAudit } from '@/types/audit'

export const ADMIN_AUDIT_COLUMNS =
  'id, reference, name, business, instagram, whatsapp, email, goals, ideal_customer, best_sellers, competitors, other_platforms, notes, details_submitted_at, approved_at, declined_at, decline_reason, payment_status, payment_claimed_at, payment_proof_path, paid_at, amount, work_started_at, report_path, report_ready_at, admin_notes, created_at, updated_at'

export async function listAudits(): Promise<AdminAudit[]> {
  const { data } = await supabaseAdmin().from('audit_requests').select(ADMIN_AUDIT_COLUMNS).order('created_at', { ascending: false })
  return (data ?? []) as AdminAudit[]
}

// One short label for where an audit stands, and whether it is waiting on nxtte.
export function auditStage(a: AdminAudit): { label: string; tone: 'you' | 'them' | 'done' } {
  if (a.report_ready_at) return { label: 'Report delivered', tone: 'done' }
  if (a.declined_at) return { label: 'Declined', tone: 'done' }
  if (!a.details_submitted_at) return { label: 'Waiting for details', tone: 'them' }
  if (!a.approved_at) return { label: 'Review details', tone: 'you' }
  if (a.payment_status === 'claimed') return { label: 'Confirm payment', tone: 'you' }
  if (a.payment_status === 'paid') return { label: a.work_started_at ? 'In progress' : 'Ready to start', tone: 'you' }
  return { label: 'Waiting for payment', tone: 'them' }
}

export async function unreadByAudit(): Promise<Record<string, number>> {
  const { data } = await supabaseAdmin().from('audit_messages').select('audit_id').eq('sender', 'customer').is('read_at', null)
  const counts: Record<string, number> = {}
  for (const row of data ?? []) counts[row.audit_id] = (counts[row.audit_id] ?? 0) + 1
  return counts
}
