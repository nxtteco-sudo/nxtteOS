import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ogFonts } from '@/lib/og-font'

// Link preview for WhatsApp, Instagram, Facebook and search. Pages without
// their own image (every page except posts and case studies) use this one.
export const alt = 'nxtte: content that produces bookings, not just likes'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), 'public/brand/nxtte-logo.png'))).toString('base64')}`
  return new ImageResponse(
    (
      <div style={{ fontFamily: 'Space Grotesk', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, background: 'linear-gradient(140deg, #fdf2f6 0%, #f9d3e0 55%, #f2a7c1 100%)', color: '#0a0a0a' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 22px', borderRadius: 22, background: '#000', alignSelf: 'flex-start' }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img */}
          <img src={logo} alt="nxtte" width={226} height={96} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 78, fontWeight: 700, lineHeight: 1, letterSpacing: -4 }}>Content that produces</span>
          <span style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.05, letterSpacing: -4, color: '#a83963' }}>bookings, not just likes.</span>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {['Every price published', 'We reply within 24 hours', 'Kuala Lumpur, Malaysia'].map((t) => (
            <span key={t} style={{ display: 'flex', padding: '12px 22px', borderRadius: 999, background: '#0a0a0a', color: '#fff', fontSize: 26, fontWeight: 700 }}>{t}</span>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  )
}
