import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHash, randomBytes } from 'node:crypto'
import { isAdminConfigured } from '@/lib/auth/admin'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { SITE_URL } from '@/lib/site'
import { EMPTY_PAYMENT, type Audit, type AuditMessage, type PaymentSettings } from '@/types/audit'

// The customer dashboard has no passwords. A customer holds a private link
// (a long random token); opening it stores the token in an httpOnly cookie.
// Only a SHA-256 hash of each token is kept in the database.
export const MY_COOKIE = 'nx_my'
const NINETY_DAYS = 60 * 60 * 24 * 90

export const CUSTOMER_AUDIT_COLUMNS =
  'id, reference, name, business, instagram, whatsapp, email, goals, ideal_customer, best_sellers, competitors, other_platforms, notes, details_submitted_at, payment_status, payment_claimed_at, payment_proof_path, paid_at, amount, work_started_at, report_path, report_ready_at, created_at'

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export async function issueToken(auditId: string): Promise<string> {
  const token = randomBytes(32).toString('base64url')
  const { error } = await supabaseAdmin().from('audit_tokens').insert({ token_hash: hashToken(token), audit_id: auditId })
  if (error) throw new Error(`Could not create the private link: ${error.message}`)
  return token
}

export const privateLink = (token: string) => `${SITE_URL}/my/open/${token}`

export async function setMyCookie(token: string) {
  const store = await cookies()
  store.set(MY_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/my',
    maxAge: NINETY_DAYS,
  })
}

export async function auditIdForToken(token: string): Promise<string | null> {
  if (!isAdminConfigured() || !/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null
  const { data } = await supabaseAdmin().from('audit_tokens').select('audit_id').eq('token_hash', hashToken(token)).maybeSingle()
  return data?.audit_id ?? null
}

export const getMyAudit = cache(async (): Promise<Audit | null> => {
  const token = (await cookies()).get(MY_COOKIE)?.value
  if (!token) return null
  const auditId = await auditIdForToken(token)
  if (!auditId) return null
  const { data } = await supabaseAdmin().from('audit_requests').select(CUSTOMER_AUDIT_COLUMNS).eq('id', auditId).maybeSingle()
  return (data as Audit | null) ?? null
})

export async function requireMyAudit(): Promise<Audit> {
  const audit = await getMyAudit()
  if (!audit) redirect('/my')
  return audit
}

export async function getMessages(auditId: string): Promise<AuditMessage[]> {
  const { data } = await supabaseAdmin()
    .from('audit_messages')
    .select('id, sender, body, read_at, created_at')
    .eq('audit_id', auditId)
    .order('created_at', { ascending: true })
  return (data ?? []) as AuditMessage[]
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const { data } = await supabaseAdmin().from('app_settings').select('value').eq('key', 'payment').maybeSingle()
  return { ...EMPTY_PAYMENT, ...((data?.value as Partial<PaymentSettings> | undefined) ?? {}) }
}

export const PRIVATE_BUCKET = 'nxtte-private'

export async function signedFileUrl(path: string, seconds = 120): Promise<string | null> {
  const { data } = await supabaseAdmin().storage.from(PRIVATE_BUCKET).createSignedUrl(path, seconds)
  return data?.signedUrl ?? null
}

// "NX-" plus 6 unambiguous characters, shown to the customer as a payment reference.
export function newReference() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(6)
  return `NX-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`
}
