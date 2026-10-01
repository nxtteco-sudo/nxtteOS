// Types and pure maths for proposals, invoices and receipts. No imports, so it
// can be loaded anywhere (server, client, scripts). No tax: nxtte charges none.

export type DocKind = 'proposal' | 'invoice' | 'receipt'

export interface LineItem {
  description: string
  /** Small second line under the description. */
  note: string
  /** Negative for a credit, e.g. the RM 199 audit credit. */
  price: number
  qty: number
}

export interface BillTo {
  name: string
  attn: string
  /** One address line per row. */
  address: string
  phone: string
}

export interface BankDetails {
  bank: string
  accountName: string
  accountNo: string
  duitnow: string
}

export interface InvoiceData {
  number: string
  /** YYYY-MM-DD */
  date: string
  dueDate: string | null
  billTo: BillTo
  items: LineItem[]
  bank: BankDetails
  notes: string
}

export interface ReceiptData {
  number: string
  date: string
  /** The invoice this pays, or empty (for example an audit paid online). */
  invoiceNumber: string
  billTo: BillTo
  items: LineItem[]
  method: string
  reference: string
  notes: string
}

// ---- Money and dates ---------------------------------------------------------

export const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

/** 2100 -> "RM 2,100.00"; -199 -> "- RM 199.00" */
export function formatRM(n: number): string {
  const v = r2(n)
  const body = Math.abs(v).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${v < 0 ? '- ' : ''}RM ${body}`
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const parts = (d: string) => {
  const [y, m, day] = d.split('-').map(Number)
  return { y, m, day }
}

/** 2026-10-01 -> "1 Oct 2026" */
export function formatDocDate(d: string): string {
  const { y, m, day } = parts(d)
  return `${day} ${MONTHS[m - 1].slice(0, 3)} ${y}`
}

/** 2026-10-01 -> "1 October 2026" */
export function formatLongDate(d: string): string {
  const { y, m, day } = parts(d)
  return `${day} ${MONTHS[m - 1]} ${y}`
}

export function addDays(d: string, n: number): string {
  const { y, m, day } = parts(d)
  const t = new Date(Date.UTC(y, m - 1, day + n))
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`
}

/** Today in Malaysia as YYYY-MM-DD. */
export function todayMY(): string {
  return new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10)
}

// ---- Totals --------------------------------------------------------------------

export const lineTotal = (i: { price: number; qty: number }) => r2(i.price * i.qty)

/** Subtotal of charges, total of credits (as a positive number) and the amount due. */
export function totals(items: LineItem[]) {
  const subtotal = r2(items.filter((i) => i.price >= 0).reduce((s, i) => s + lineTotal(i), 0))
  const credits = r2(-items.filter((i) => i.price < 0).reduce((s, i) => s + lineTotal(i), 0))
  return { subtotal, credits, total: r2(subtotal - credits) }
}

// ---- Numbering -------------------------------------------------------------------

/** Highest number seen for a prefix plus one. */
export function nextSequence(prefix: string, existing: string[]): number {
  let max = 0
  for (const n of existing) {
    if (!n.startsWith(prefix)) continue
    const m = /^(\d+)$/.exec(n.slice(prefix.length))
    if (m) max = Math.max(max, Number(m[1]))
  }
  return max + 1
}

const pad = (n: number, width: number) => String(n).padStart(width, '0')
export const invoiceNumber = (seq: number) => `INV-${pad(seq, 4)}`
export const receiptNumber = (seq: number) => `REC-${pad(seq, 4)}`
export const proposalRef = (year: number, seq: number) => `PRO-${year}-${pad(seq, 3)}`
export const proposalPrefix = (year: number) => `PRO-${year}-`
