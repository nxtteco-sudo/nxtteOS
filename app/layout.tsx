import type { Metadata } from 'next'
import { DM_Sans, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SITE_URL } from '@/lib/site'
import './globals.css'

// Fonts are served from this site by next/font (no runtime font CDN). The client
// chose to keep these instead of switching to Satoshi (1 Oct 2026).
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
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
