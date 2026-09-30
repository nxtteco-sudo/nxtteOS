import { ImageResponse } from 'next/og'
import { STAR_PATH } from '@/components/brand-mark'

// Home-screen icon for iPhone (square; iOS rounds the corners itself).
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <svg width={76} height={96} viewBox="0 0 80 100"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e0b4ea" /><stop offset="1" stopColor="#c997d4" /></linearGradient></defs><path d={STAR_PATH} fill="url(#s)" /></svg>
      </div>
    ),
    size,
  )
}
