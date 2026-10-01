import { NextResponse } from 'next/server'
import { getMyAudit } from '@/lib/customer'
import { auditReceiptFor } from '@/lib/documents/audit-receipt'
import { buildDocument, pdfResponse } from '@/lib/documents/build'

export const runtime = 'nodejs'

// The signed-in customer's receipt for their paid audit, as a PDF.
export async function GET(request: Request) {
  const audit = await getMyAudit()
  if (!audit || audit.payment_status !== 'paid') return NextResponse.redirect(new URL('/my/payment', request.url))
  const row = await auditReceiptFor(audit.id)
  const built = row ? buildDocument(row.kind, row.data) : null
  if (!built?.ok) return NextResponse.redirect(new URL('/my/payment?receipt=missing', request.url))
  return pdfResponse(built, 'attachment')
}
