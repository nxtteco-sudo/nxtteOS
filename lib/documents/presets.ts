// Price shortcuts for the editors, built from the live price list, so a price
// change on the site is a price change here. Every price stays editable.
import { AUDIT_PRICE, MENU, packages, priceToNumber } from '@/lib/pricing'
import type { LineItem } from './model'

export type Preset = { group: string; label: string; price: number; note: string }

export const PRICE_PRESETS: { group: string; items: Preset[] }[] = [
  {
    group: 'Monthly packages',
    items: packages.map((p) => ({ group: 'Monthly packages', label: `${p.name} package`, price: priceToNumber(p.price), note: p.included.join(', ') })),
  },
  ...MENU.map((g) => ({
    group: g.label,
    items: g.items
      .filter((i) => i.amount !== undefined || /^RM [\d,]+\/month$/.test(i.price))
      .map((i) => ({ group: g.label, label: i.name, price: i.amount ?? priceToNumber(i.price), note: i.note ?? '' })),
  })),
  { group: 'Credits', items: [{ group: 'Credits', label: 'Audit credit', price: -AUDIT_PRICE, note: 'RM 199 audit credited to the first month' }] },
]

export const TEMPLATE_PACKAGES = packages.map((p) => ({ name: p.name, price: priceToNumber(p.price), detail: p.detail, included: p.included }))

export const blankLine = (): LineItem => ({ description: '', note: '', price: 0, qty: 1 })

export const DEFAULT_INVOICE_NOTES = (number: string) =>
  `Use ${number} as your payment reference. Monthly fees are due between the 1st and 7th. If unpaid by the 7th, work pauses until it is paid.`
