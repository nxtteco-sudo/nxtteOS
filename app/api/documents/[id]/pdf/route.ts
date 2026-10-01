import { NextResponse } from 'next/server'
import { getDocsUser } from '@/lib/documents/access'
import { buildDocument, pdfResponse } from '@/lib/documents/build'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Re-download a saved document exactly as it was issued.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getDocsUser())) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  const { id } = await ctx.params
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  const { data: row } = await supabaseAdmin().from('documents').select('kind, data').eq('id', id).maybeSingle()
  if (!row) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  const built = buildDocument(row.kind as string, row.data)
  if (!built.ok) return NextResponse.json({ error: 'This document cannot be rebuilt.' }, { status: 422 })
  return pdfResponse(built)
}
