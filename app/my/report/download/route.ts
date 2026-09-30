import { NextResponse } from 'next/server'
import { getMyAudit, signedFileUrl } from '@/lib/customer'

// Hands the signed-in customer a short-lived link to their own report.
export async function GET(request: Request) {
  const audit = await getMyAudit()
  if (!audit?.report_path || !audit.report_ready_at) return NextResponse.redirect(new URL('/my/report', request.url))
  const url = await signedFileUrl(audit.report_path)
  if (!url) return NextResponse.redirect(new URL('/my/report?download=failed', request.url))
  return NextResponse.redirect(url)
}
