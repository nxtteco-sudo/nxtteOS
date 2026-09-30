import 'server-only'
import { CONTACT, SITE_URL } from '@/lib/site'

// Email through Resend's HTTP API (no SDK). Never throws: a failed alert must
// not break a form submission. Does nothing until RESEND_API_KEY is set.
const FROM = process.env.EMAIL_FROM ?? `nxtte <${CONTACT.email}>`
export const ALERT_EMAIL = process.env.ALERT_EMAIL ?? CONTACT.email

export const esc = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

type Mail = { to: string; subject: string; heading: string; lines: string[]; cta?: { label: string; href: string }; replyTo?: string }

function layout({ heading, lines, cta }: Mail) {
  const button = cta
    ? `<p style="margin:24px 0 0"><a href="${cta.href}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:#c9507b;color:#fff;font-weight:700;text-decoration:none">${esc(cta.label)}</a></p>`
    : ''
  return `<div style="margin:0;padding:24px;background:#fdf2f6;font-family:Arial,Helvetica,sans-serif;color:#0a0a0a">
  <div style="max-width:520px;margin:0 auto;padding:28px;border-radius:20px;background:#fff">
    <p style="margin:0 0 18px;font-weight:700;font-size:18px">nxtte</p>
    <h1 style="margin:0 0 14px;font-size:22px;line-height:1.25">${esc(heading)}</h1>
    ${lines.map((l) => `<p style="margin:0 0 10px;font-size:15px;line-height:1.55;color:#3d2530">${l}</p>`).join('')}
    ${button}
    <p style="margin:26px 0 0;font-size:12px;color:#6b6b72">nxtte, a brand of Aurexis Solution (SSM NS0315281-P) &middot; ${esc(SITE_URL.replace('https://', ''))}</p>
  </div></div>`
}

export async function sendEmail(mail: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[email] RESEND_API_KEY is not set; skipped:', mail.subject)
    return false
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: mail.to, subject: mail.subject, html: layout(mail), reply_to: mail.replyTo }),
    })
    if (!res.ok) console.error('[email] send failed', res.status, await res.text())
    return res.ok
  } catch (error) {
    console.error('[email] send failed', error)
    return false
  }
}

export const alertAdmin = (subject: string, heading: string, lines: string[], path: string) =>
  sendEmail({ to: ALERT_EMAIL, subject, heading, lines, cta: { label: 'Open in admin', href: `${SITE_URL}${path}` } })
