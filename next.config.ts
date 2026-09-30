import type { NextConfig } from 'next'

// Security headers on every page. The CSP only covers framing, forms, <base>
// and plugins; a full script policy would need nonces for Next's inline scripts.
const SECURITY_HEADERS = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }]
  },
  images: {
    formats: ['image/webp'],
    // Insight cover and in-post images live in the Supabase public bucket.
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' }],
  },
  experimental: {
    // Uploads go through server actions: images up to 5 MB, audit reports up to 10 MB.
    serverActions: { bodySizeLimit: '11mb' },
  },
}

export default nextConfig
