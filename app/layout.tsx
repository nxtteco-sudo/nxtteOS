import type { Metadata } from 'next'
import { Inter, DM_Sans, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SITE_URL } from '@/lib/site'
import './globals.css'

// TODO: swap to next/font/local pointing at the real Satoshi .woff2 files once
// licensed and dropped into public/fonts/ (AGENTS.md §7 / CLAUDE.md content gaps —
// "exact pink sampled from logo file" is the same category of client-supplied asset
// this depends on). Inter is used here as the documented system-fallback face so the
// build isn't blocked on an asset we don't have yet, and it still satisfies "no
// third-party font CDN at runtime" since next/font self-hosts the served files.
const primaryFont = Inter({
  subsets: ['latin'],
  variable: '--font-primary',
  display: 'swap',
})

const bodyFont = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body', display: 'swap' })
const displayFont = Space_Grotesk({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'nxtte — Content that produces bookings, not just likes',
  description:
    'nxtte builds the machine that turns attention into bookings: content, funnel, and site from one team.',
  openGraph: {
    title: 'nxtte — Content that produces bookings, not just likes',
    description:
      'nxtte builds the machine that turns attention into bookings: content, funnel, and site from one team.',
    url: SITE_URL,
    siteName: 'nxtte',
    locale: 'en_MY',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${primaryFont.variable} ${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
