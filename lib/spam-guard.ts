import 'server-only'
import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Spam protection for public forms and sign-in: a hidden trap field, a minimum
// fill time, and a per-visitor limit stored in form_attempts (migration 0010).
// Only a SHA-256 hash of the IP is stored, and rows older than a day are removed.
export type GuardBucket = 'audit' | 'contact' | 'signin' | 'link'

const LIMITS: Record<GuardBucket, { max: number; minutes: number }> = {
  audit: { max: 3, minutes: 60 },
  contact: { max: 5, minutes: 60 },
  signin: { max: 20, minutes: 15 },
  link: { max: 5, minutes: 60 },
}
const KEEP_MS = 24 * 60 * 60 * 1000
const MIN_FILL_MS = 2500

export const TRAP_FIELD = 'website'
export const STARTED_FIELD = 'started'
export const TOO_MANY = 'Too many tries from this device. Wait a while, or message us on WhatsApp.'

// True when the submission looks automated: the hidden field was filled in, or
// the form was sent faster than a person could type it.
export function looksAutomated(formData: FormData): boolean {
  if (String(formData.get(TRAP_FIELD) ?? '').trim() !== '') return true
  const started = Number(formData.get(STARTED_FIELD))
  return !Number.isFinite(started) || Date.now() - started < MIN_FILL_MS
}

async function visitorKey(): Promise<string> {
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  return createHash('sha256').update(`nxtte:${process.env.RATE_LIMIT_SALT ?? ''}:${ip}`).digest('hex')
}

// Records an attempt and returns true when this visitor is over the limit.
// If the check itself fails (for example the table is missing), it lets the
// attempt through so real customers are never locked out by our own error.
export async function overLimit(bucket: GuardBucket): Promise<boolean> {
  const { max, minutes } = LIMITS[bucket]
  try {
    const db = supabaseAdmin()
    const ipHash = await visitorKey()
    const since = new Date(Date.now() - minutes * 60_000).toISOString()
    const { count, error } = await db
      .from('form_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('bucket', bucket)
      .eq('ip_hash', ipHash)
      .gte('created_at', since)
    if (error) throw new Error(error.message)
    if ((count ?? 0) >= max) return true
    await db.from('form_attempts').insert({ bucket, ip_hash: ipHash })
    await db.from('form_attempts').delete().lt('created_at', new Date(Date.now() - KEEP_MS).toISOString())
    return false
  } catch (e) {
    console.error('[spam-guard] check skipped', e instanceof Error ? e.message : e)
    return false
  }
}
