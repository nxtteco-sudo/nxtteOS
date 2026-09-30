// Production domain. NEXT_PUBLIC_SITE_URL can override it (for example on a preview deploy).
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nxtte.com'

// Contact details, used everywhere on the site (footer, contact, thanks).
export const CONTACT = {
  email: 'contact@nxtte.com',
  instagramUrl: 'https://www.instagram.com/nxtte.co/',
  tiktokUrl: 'https://www.tiktok.com/@nxtte.co',
  handle: '@nxtte.co',
} as const
