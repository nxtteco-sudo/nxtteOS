import { ImageResponse } from 'next/og'
import { ogFonts } from '@/lib/og-font'

// Home-screen icon for iPhone (square; iOS rounds the corners itself).
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ fontFamily: 'Space Grotesk', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
        <span style={{ color: '#f2779f', fontSize: 110, fontWeight: 700, letterSpacing: -6, marginTop: -10 }}>n.</span>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  )
}
