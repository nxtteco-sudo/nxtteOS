import { NextResponse } from 'next/server'
import { MY_COOKIE, auditIdForToken } from '@/lib/customer'

// Opens a private dashboard link: checks the token, stores it in an httpOnly
// cookie and moves on to /my so the token does not stay in the address bar.
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const url = new URL('/my', request.url)
  if (!(await auditIdForToken(token))) {
    url.searchParams.set('link', 'invalid')
    return NextResponse.redirect(url)
  }
  const response = NextResponse.redirect(url)
  response.cookies.set(MY_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/my',
    maxAge: 60 * 60 * 24 * 90,
  })
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}
