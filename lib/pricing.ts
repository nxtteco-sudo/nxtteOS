// Package prices and inclusions (Services & Pricing 2026). One source for the
// marketing site and the customer dashboard.
export type Package = { name: string; price: string; note: string; detail: string; included: string[]; featured?: boolean }

export const packages: Package[] = [
  {
    name: "Starter",
    price: "RM 1,199",
    note: "per month",
    detail: "Show up consistently on one platform.",
    included: ["1 platform", "12 posts (single image and carousel)", "Captions and hashtags", "Monthly content calendar", "Monthly report"],
  },
  {
    name: "Growth",
    price: "RM 2,299",
    note: "per month",
    detail: "Reels, where most new customers find local businesses today.",
    included: ["2 platforms", "12 posts + 4 reels or TikToks", "Captions, hashtags and calendar", "Monthly report", "Monthly strategy call"],
    featured: true,
  },
  {
    name: "Pro",
    price: "RM 3,399",
    note: "per month",
    detail: "Content, ads and shoots handled together.",
    included: ["3 platforms", "16 posts + 6 reels or TikToks", "Ads management on 1 platform", "Half-day weekend shoot every quarter", "Report and monthly strategy call"],
  },
]

export const AUDIT_PRICE = 199

// "RM 2,299" -> 2299
export const priceToNumber = (price: string) => Number(price.replace(/[^0-9]/g, ''))
export const formatRM = (value: number) => `RM ${value.toLocaleString('en-MY')}`

// THE MENU: fixed prices for single pieces of work, from Services & Pricing 2026.
// `amount` is set only for one-off fixed prices, so the order total never guesses.
export type MenuItem = { name: string; note?: string; price: string; time: string; amount?: number };
export const MENU: { key: string; label: string; items: MenuItem[] }[] = [
  { key: "start", label: "Start here", items: [
    { name: "Social media audit", note: "Full review of your accounts, content and competitors, with a 90-day plan. Credited to your first month if you sign a package within 14 days.", price: "RM 199", time: "5 working days", amount: 199 },
    { name: "Profile makeover", note: "New bio, highlight covers, post templates and a clean grid.", price: "RM 399", time: "5 working days", amount: 399 },
    { name: "WhatsApp Business setup", note: "Catalogue, quick replies, greeting and away messages, and labels to track enquiries.", price: "RM 299", time: "3 working days", amount: 299 },
  ] },
  { key: "content", label: "Content", items: [
    { name: "Static post design", note: "Feed post or story", price: "RM 39", time: "3 working days", amount: 39 },
    { name: "Carousel design", note: "Minimum 3 slides", price: "RM 89", time: "3 to 5 working days", amount: 89 },
    { name: "Reel or TikTok scriptwriting", note: "Scene by scene", price: "RM 59", time: "3 working days", amount: 59 },
    { name: "Reel or TikTok editing", price: "RM 99", time: "5 working days", amount: 99 },
    { name: "Captions and hashtags", note: "Search and AI-search optimised", price: "RM 29 per post", time: "2 working days" },
    { name: "Monthly content calendar", price: "RM 299", time: "5 working days", amount: 299 },
    { name: "Content strategy", price: "RM 499", time: "7 working days", amount: 499 },
    { name: "Videography", note: "Weekends only, plus RM 100 transport", price: "Quoted per shoot", time: "Booked in advance" },
  ] },
  { key: "growth", label: "Marketing & growth", items: [
    { name: "Meta Ads management", note: "Facebook and Instagram. Or 15% of ad spend if higher", price: "RM 1,200/month", time: "Monthly" },
    { name: "TikTok Ads management", note: "Or 15% of ad spend if higher", price: "RM 1,200/month", time: "Monthly" },
    { name: "Monthly performance report", note: "Included free in every package", price: "RM 250/month", time: "Monthly" },
    { name: "Meta Ads campaign setup", note: "One-off, per campaign", price: "RM 499", time: "One-off", amount: 499 },
    { name: "TikTok Ads campaign setup", note: "One-off, per campaign", price: "RM 499", time: "One-off", amount: 499 },
    { name: "Basic landing page", note: "One page with your offer, WhatsApp button and enquiry form", price: "RM 1,399", time: "10 to 14 working days", amount: 1399 },
  ] },
  { key: "brand", label: "Brand & business", items: [
    { name: "Company profile design", note: "Booklet or presentation, in portrait and landscape", price: "RM 699", time: "7 to 10 working days", amount: 699 },
    { name: "Digital name card", price: "RM 19", time: "2 working days", amount: 19 },
  ] },
];

// Case study categories: one for the monthly packages, then one per menu group,
// so a case study can be filed under anything nxtte sells.
export const SERVICE_CATEGORIES = [
  { key: 'social', label: 'Social media management', services: packages.map((p) => `${p.name} package`) },
  { key: 'content', label: 'Content', services: MENU.find((g) => g.key === 'content')!.items.map((i) => i.name) },
  { key: 'growth', label: 'Ads and growth', services: MENU.find((g) => g.key === 'growth')!.items.map((i) => i.name) },
  { key: 'brand', label: 'Brand and business', services: MENU.find((g) => g.key === 'brand')!.items.map((i) => i.name) },
  { key: 'start', label: 'Audit and setup', services: MENU.find((g) => g.key === 'start')!.items.map((i) => i.name) },
] as const

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]['key']
export const CATEGORY_LABEL = Object.fromEntries(SERVICE_CATEGORIES.map((c) => [c.key, c.label])) as Record<ServiceCategory, string>
