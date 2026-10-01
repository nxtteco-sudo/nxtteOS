// Private gate for /accounts: a Supabase Auth account AND a row in
// accounts_access. Separate from admin and from Documents. Every page, route and
// action re-checks it; the UI is never the boundary.
import 'server-only'
import { cache } from 'react'
import { isAdminConfigured } from '@/lib/auth/admin'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createSessionClient } from '@/lib/supabase/ssr'

export type AccountsUser = { id: string; email: string }

export const getAccountsUser = cache(async (): Promise<AccountsUser | null> => {
  if (!isAdminConfigured()) return null
  const supabase = await createSessionClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabaseAdmin().from('accounts_access').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!data) return null
  return { id: user.id, email: user.email ?? '' }
})

export async function requireAccounts(): Promise<AccountsUser> {
  const user = await getAccountsUser()
  if (!user) throw new Error('Not signed in to Accounts.')
  return user
}
