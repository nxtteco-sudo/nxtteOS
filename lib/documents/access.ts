// Private gate for /documents: a Supabase Auth account AND a row in
// documents_access. Being an admin does not grant access. Every page, route and
// action re-checks it; the UI is never the boundary.
import 'server-only'
import { cache } from 'react'
import { isAdminConfigured } from '@/lib/auth/admin'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createSessionClient } from '@/lib/supabase/ssr'

export type DocsUser = { id: string; email: string }

export const getDocsUser = cache(async (): Promise<DocsUser | null> => {
  if (!isAdminConfigured()) return null
  const supabase = await createSessionClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabaseAdmin().from('documents_access').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!data) return null
  return { id: user.id, email: user.email ?? '' }
})

export async function requireDocsAccess(): Promise<DocsUser> {
  const user = await getDocsUser()
  if (!user) throw new Error('Not signed in to Documents.')
  return user
}
