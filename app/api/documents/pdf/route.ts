import { NextResponse } from 'next/server'
import { getDocsUser } from '@/lib/documents/access'
import { buildDocument, pdfResponse } from '@/lib/documents/build'

export const runtime = 'nodejs'

// Live preview: renders the PDF for the form as it stands, without saving.
export async function POST(req: Request) {
  if (!(await getDocsUser())) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  const body = (await req.json().catch(() => null)) as { kind?: string; data?: unknown } | null
  if (!body) return NextResponse.json({ error: 'Bad request.' }, { status: 400 })
  const built = buildDocument(String(body.kind), body.data)
  if (!built.ok) return NextResponse.json({ error: built.error }, { status: 422 })
  try {
    return await pdfResponse(built)
  } catch (err) {
    console.error('[documents] preview render failed', err)
    return NextResponse.json({ error: 'Could not build the PDF.' }, { status: 500 })
  }
}
