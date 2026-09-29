import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp'],
    // Insight cover and in-post images live in the Supabase public bucket.
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' }],
  },
  experimental: {
    // Admin image uploads go through a server action; the bucket allows 5 MB.
    serverActions: { bodySizeLimit: '6mb' },
  },
}

export default nextConfig
