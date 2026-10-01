// nxtte's public facts and every structured-data (JSON-LD) builder, in one place,
// so Google and AI answer engines read the same facts the pages show.
import type { Metadata } from 'next'
import { CONTACT, SITE_URL } from './site'
import { AUDIT_PRICE, packages, priceToNumber } from './pricing'

export const BRAND = {
  name: 'nxtte',
  legalName: 'Aurexis Solution',
  ssm: 'NS0315281-P',
  tagline: 'Content that produces bookings, not just likes',
  description:
    'nxtte is a social media and content agency in Kuala Lumpur, Malaysia. It plans, makes and posts content for Malaysian small businesses, with published monthly packages at RM 1,199, RM 2,299 and RM 3,399, and a RM 199 audit to start.',
  email: CONTACT.email,
  phone: '+601174721429',
  phoneDisplay: '+60 11-7472 1429',
  sameAs: [CONTACT.instagramUrl, CONTACT.tiktokUrl],
  founders: [
    { name: 'Nemila', honorific: 'Ms.', jobTitle: 'CEO, co-founder' },
    { name: 'Jay', honorific: 'Mr.', jobTitle: 'CTO, co-founder' },
  ],
  knowsAbout: [
    'Social media management',
    'Instagram and TikTok content',
    'Reels and short video',
    'Content calendars',
    'Meta and TikTok ads',
    'Social media audits',
    'Landing pages',
  ],
} as const

export const orgId = `${SITE_URL}/#organization`
const abs = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': orgId,
        name: BRAND.name,
        legalName: BRAND.legalName,
        identifier: { '@type': 'PropertyValue', propertyID: 'SSM registration number', value: BRAND.ssm },
        slogan: BRAND.tagline,
        description: BRAND.description,
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon`, width: 512, height: 512 },
        image: `${SITE_URL}/opengraph-image`,
        email: BRAND.email,
        telephone: BRAND.phone,
        address: { '@type': 'PostalAddress', addressLocality: 'Kuala Lumpur', addressCountry: 'MY' },
        areaServed: { '@type': 'Country', name: 'Malaysia' },
        priceRange: 'RM 199 to RM 3,399',
        knowsAbout: BRAND.knowsAbout,
        sameAs: BRAND.sameAs,
        parentOrganization: { '@type': 'Organization', name: BRAND.legalName },
        founder: BRAND.founders.map((f) => ({ '@type': 'Person', name: f.name, honorificPrefix: f.honorific, jobTitle: f.jobTitle, worksFor: { '@id': orgId } })),
        contactPoint: { '@type': 'ContactPoint', contactType: 'sales', email: BRAND.email, telephone: BRAND.phone, areaServed: 'MY', availableLanguage: ['English', 'Malay'] },
      },
      { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: BRAND.name, url: SITE_URL, inLanguage: 'en-MY', publisher: { '@id': orgId } },
    ],
  }
}

/** The three monthly packages, with their firm prices. */
export function packagesJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}/services#service`,
    name: 'Social media management by nxtte',
    serviceType: 'Social media management',
    description: 'Monthly social media packages for Malaysian small businesses: content, captions, calendar, reporting, and on Pro, ads and shoots.',
    url: `${SITE_URL}/services`,
    provider: { '@id': orgId },
    areaServed: { '@type': 'Country', name: 'Malaysia' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Monthly packages',
      itemListElement: packages.map((p) => ({
        '@type': 'Offer',
        name: `${p.name} package`,
        description: p.included.join(', '),
        priceCurrency: 'MYR',
        price: priceToNumber(p.price),
        priceSpecification: { '@type': 'UnitPriceSpecification', priceCurrency: 'MYR', price: priceToNumber(p.price), unitText: 'MONTH' },
        itemOffered: { '@type': 'Service', name: `${p.name} package` },
      })),
    },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  }
}

export function faqJsonLd(items: ReadonlyArray<readonly [string, string]>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }
}

/**
 * Title, description, canonical and social tags for one page, kept in step.
 * Without this, pages inherit the homepage's social title and URL, so a shared
 * link to /services would preview as the homepage.
 */
/** The site-wide share card (app/opengraph-image.tsx), 1200 by 630. */
const SHARE_IMAGE = { url: '/opengraph-image', width: 1200, height: 630, alt: 'nxtte: content that produces bookings, not just likes' }

export function pageMetadata({ title, description, path, type = 'website' }: { title: string; description: string; path: string; type?: 'website' | 'article' }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: abs(path), siteName: BRAND.name, locale: 'en_MY', type, images: [SHARE_IMAGE] },
    twitter: { card: 'summary_large_image', title, description, images: [SHARE_IMAGE.url] },
  }
}

/** The RM 199 audit as a priced offer. */
export function auditJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}/audit#service`,
    name: 'Social media audit',
    serviceType: 'Social media audit',
    description: 'A profile teardown, content performance review, competitor comparison, gap analysis and a 90-day roadmap with weekly deliverables, delivered within 5 working days of payment.',
    url: `${SITE_URL}/audit`,
    provider: { '@id': orgId },
    areaServed: { '@type': 'Country', name: 'Malaysia' },
    offers: { '@type': 'Offer', price: AUDIT_PRICE, priceCurrency: 'MYR', url: `${SITE_URL}/audit`, availability: 'https://schema.org/InStock' },
  }
}

/** An index page's items (posts or case studies), in the order shown. */
export function itemListJsonLd(name: string, items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: abs(it.path) })),
  }
}
