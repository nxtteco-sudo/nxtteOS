import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
