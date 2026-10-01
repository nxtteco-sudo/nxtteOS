// Turns whatever the browser sends into safe document data, or an error message.
import { totals, type BillTo, type InvoiceData, type LineItem, type ReceiptData } from './model'
import type { ProposalData } from './proposal'

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\r/g, '').trim().slice(0, max) : '')
const date = (v: unknown) =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(new Date(`${v}T00:00:00Z`).getTime()) ? v : null
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {})
const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : NaN
}

export type Checked<T> = { ok: true; data: T } | { ok: false; error: string }

function billTo(raw: unknown): BillTo {
  const b = obj(raw)
  return { name: str(b.name, 160), attn: str(b.attn, 120), address: str(b.address, 400), phone: str(b.phone, 40) }
}

function lines(raw: unknown): LineItem[] | string {
  if (!Array.isArray(raw) || raw.length === 0) return 'Add at least one line.'
  if (raw.length > 12) return 'A document can hold at most 12 lines.'
  const out: LineItem[] = []
  for (const r of raw) {
    const o = obj(r)
    const price = num(o.price)
    const qty = num(o.qty)
    const description = str(o.description, 120)
    if (!description) return 'Every line needs a description.'
    if (!(Math.abs(price) < 1e8)) return `Enter a valid price for "${description}".`
    if (!(qty > 0 && qty <= 10000)) return `Enter a valid quantity for "${description}".`
    out.push({ description, note: str(o.note, 160), price: Math.round(price * 100) / 100, qty })
  }
  if (totals(out).total < 0) return 'The credits are larger than the charges. The total cannot be below RM 0.'
  return out
}

export function checkInvoice(raw: unknown): Checked<InvoiceData> {
  const o = obj(raw)
  const number = str(o.number, 40)
  if (!number) return { ok: false, error: 'Add the invoice number.' }
  const d = date(o.date)
  if (!d) return { ok: false, error: 'Pick the invoice date.' }
  const items = lines(o.items)
  if (typeof items === 'string') return { ok: false, error: items }
  const bt = billTo(o.billTo)
  if (!bt.name) return { ok: false, error: 'Add who the invoice is for.' }
  const bank = obj(o.bank)
  return {
    ok: true,
    data: {
      number, date: d, dueDate: date(o.dueDate), billTo: bt, items,
      bank: { bank: str(bank.bank, 80), accountName: str(bank.accountName, 120), accountNo: str(bank.accountNo, 60), duitnow: str(bank.duitnow, 60) },
      notes: str(o.notes, 800),
    },
  }
}

export function checkReceipt(raw: unknown): Checked<ReceiptData> {
  const o = obj(raw)
  const number = str(o.number, 40)
  if (!number) return { ok: false, error: 'Add the receipt number.' }
  const d = date(o.date)
  if (!d) return { ok: false, error: 'Pick the receipt date.' }
  const items = lines(o.items)
  if (typeof items === 'string') return { ok: false, error: items }
  const bt = billTo(o.billTo)
  if (!bt.name) return { ok: false, error: 'Add who the receipt is for.' }
  return {
    ok: true,
    data: {
      number, date: d, invoiceNumber: str(o.invoiceNumber, 40), billTo: bt, items,
      method: str(o.method, 60), reference: str(o.reference, 80), notes: str(o.notes, 600),
    },
  }
}

export function checkProposal(raw: unknown): Checked<ProposalData> {
  const o = obj(raw)
  const ref = str(o.ref, 60)
  if (!ref) return { ok: false, error: 'Add the proposal reference.' }
  const d = date(o.date)
  if (!d) return { ok: false, error: 'Pick the issue date.' }
  const validUntil = date(o.validUntil)
  if (!validUntil) return { ok: false, error: 'Pick the "valid until" date.' }
  const clientName = str(o.clientName, 160)
  if (!clientName) return { ok: false, error: 'Add who the proposal is for.' }
  const title = str(o.title, 140)
  if (!title) return { ok: false, error: 'Add the cover title.' }
  if (!Array.isArray(o.sections) || o.sections.length === 0) return { ok: false, error: 'Add at least one section.' }
  if (o.sections.length > 30) return { ok: false, error: 'A proposal can hold at most 30 sections.' }
  const sections = o.sections.map((r) => {
    const x = obj(r)
    return { title: str(x.title, 120), body: str(x.body, 12000), pageBreak: x.pageBreak === true }
  })
  if (sections.some((s) => !s.title)) return { ok: false, error: 'Every section needs a heading.' }
  return { ok: true, data: { ref, date: d, validUntil, title, clientName, sections } }
}
