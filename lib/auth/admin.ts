import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createSessionClient } from '@/lib/supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase/admin'

export type AdminUser = { id: string; email: string }

// The security gate for /admin: a verified Supabase Auth user who is also on
// the admin_users allowlist. Cached per request.
export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  if (!isAdminConfigured()) return null
  const supabase = await createSessionClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabaseAdmin()
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!data) return null
  return { id: user.id, email: user.email ?? '' }
})

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser()
  if (!admin) redirect('/admin/login')
  return admin
}

export function isAdminConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
}
