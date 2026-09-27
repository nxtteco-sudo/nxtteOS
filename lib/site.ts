// TODO: replace with the real production domain once it's live. Used by
// metadataBase (Open Graph/canonical URLs) and sitemap.ts/robots.ts. Not in the
// spec's own "content gaps" list, but the site cannot generate correct absolute
// URLs without it — flagging here rather than inventing a domain.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://TODO_DOMAIN.com'
