import { createClient } from '@supabase/supabase-js'

// Public forms only: uses the anon key, so the tables rely on an insert-only RLS
// policy (see supabase/migrations). Returns null when env vars are missing so the
// caller can fail with a clean message instead of throwing at import time.
export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}
