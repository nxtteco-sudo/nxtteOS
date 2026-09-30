import { ImageResponse } from 'next/og'
import { STAR_PATH } from '@/components/brand-mark'

// Browser tab icon: the sparkle from the nxtte logo, in its own colour, on a
// black rounded square. The full wordmark is unreadable at tab size.
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', borderRadius: 16 }}>
        <svg width={27} height={34} viewBox="0 0 80 100"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e0b4ea" /><stop offset="1" stopColor="#c997d4" /></linearGradient></defs><path d={STAR_PATH} fill="url(#s)" /></svg>
      </div>
    ),
    size,
  )
}
