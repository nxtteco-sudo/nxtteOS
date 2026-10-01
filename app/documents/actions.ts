'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getDocsUser, requireDocsAccess } from '@/lib/documents/access'
import { buildDocument } from '@/lib/documents/build'
import { TOO_MANY, overLimit } from '@/lib/spam-guard'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createSessionClient } from '@/lib/supabase/ssr'

type Fail = { ok: false; error: string }
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const isId = (v: unknown): v is string => typeof v === 'string' && UUID_RE.test(v)

// ---- Access --------------------------------------------------------------------

export async function docsSignIn(_prev: { error: string } | null, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) return { error: 'Enter your email and password.' }
  if (await overLimit('signin')) return { error: TOO_MANY }

  const supabase = await createSessionClient()
  if (!supabase) return { error: 'Documents is not connected to Supabase yet.' }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'That email and password do not match.' }
  if (!(await getDocsUser())) {
    await supabase.auth.signOut()
    return { error: 'This account does not have access to Documents.' }
  }
  redirect('/documents')
}

export async function docsSignOut() {
  const supabase = await createSessionClient()
  await supabase?.auth.signOut()
  redirect('/documents')
}

// ---- Documents -------------------------------------------------------------------

export async function saveDocument(input: {
  kind: 'invoice' | 'receipt' | 'proposal'
  data: unknown
  sourceId: string | null
  /** Set to change a saved document; its kind and source stay as they were. */
  id?: string
}): Promise<{ ok: true; id: string } | Fail> {
  await requireDocsAccess()
  if (input.id !== undefined && !isId(input.id)) return { ok: false, error: 'Unknown document.' }
  if (input.sourceId !== null && !isId(input.sourceId)) return { ok: false, error: 'Unknown invoice.' }

  const built = buildDocument(input.kind, input.data)
  if (!built.ok) return built
  const row = { number: built.number, title: built.title, data: built.data, total_myr: built.total, doc_date: built.date, updated_at: new Date().toISOString() }
  const db = supabaseAdmin()

  if (input.id) {
    const { data: current } = await db.from('documents').select('id, kind').eq('id', input.id).maybeSingle()
    if (!current || current.kind !== input.kind) return { ok: false, error: 'That document no longer exists.' }
    const { error } = await db.from('documents').update(row).eq('id', input.id)
    if (error) {
      if (error.code === '23505') return { ok: false, error: `${built.number} already exists. Use a different number.` }
      console.error('[documents] update failed', error.message)
      return { ok: false, error: 'Could not save your changes.' }
    }
    revalidatePath('/documents', 'layout')
    return { ok: true, id: input.id }
  }

  const { data, error } = await db
    .from('documents')
    .insert({ ...row, kind: input.kind, status: 'issued', source_id: input.sourceId })
    .select('id')
    .single()
  if (error) {
    if (error.code === '23505') return { ok: false, error: `${built.number} already exists. Use the next number.` }
    console.error('[documents] save failed', error.message)
    return { ok: false, error: 'Could not save the document.' }
  }
  revalidatePath('/documents', 'layout')
  return { ok: true, id: data.id as string }
}

export async function setDocumentVoid(id: string, isVoid: boolean): Promise<{ ok: true } | Fail> {
  await requireDocsAccess()
  if (!isId(id)) return { ok: false, error: 'Unknown document.' }
  const { error } = await supabaseAdmin().from('documents').update({ status: isVoid ? 'void' : 'issued', updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return { ok: false, error: 'Could not update the document.' }
  revalidatePath('/documents', 'layout')
  return { ok: true }
}
