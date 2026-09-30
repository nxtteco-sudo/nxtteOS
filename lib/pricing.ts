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
