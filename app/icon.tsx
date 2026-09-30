import { ImageResponse } from 'next/og'
import { ogFonts } from '@/lib/og-font'

// Browser tab icon: the "n." mark in a black rounded square (the logo is never
// recoloured; it sits in a solid black container). Replace with the real logo
// file once supplied (CLAUDE.md content gaps).
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default async function Icon() {
  return new ImageResponse(
    (
      <div style={{ fontFamily: 'Space Grotesk', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', borderRadius: 16 }}>
        <span style={{ color: '#f2779f', fontSize: 40, fontWeight: 700, letterSpacing: -2, marginTop: -4 }}>n.</span>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  )
}
