// Numbers for the Documents overview. Pure, no imports.

export type DocRow = {
  id: string
  kind: 'proposal' | 'invoice' | 'receipt'
  number: string
  title: string
  status: string
  total_myr: number
  doc_date: string
  source_id: string | null
}

export type Unpaid = { id: string; number: string; title: string; balance: number; doc_date: string }

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

/** `today` is YYYY-MM-DD in Malaysia time. Void documents never count. */
export function summarize(rows: DocRow[], today: string) {
  const live = rows.filter((r) => r.status !== 'void')
  const month = today.slice(0, 7)
  const inMonth = (r: DocRow) => r.doc_date.slice(0, 7) === month
  const invoices = live.filter((r) => r.kind === 'invoice')
  const receipts = live.filter((r) => r.kind === 'receipt')
  const proposals = live.filter((r) => r.kind === 'proposal')

  const paidByInvoice = new Map<string, number>()
  for (const r of receipts) if (r.source_id) paidByInvoice.set(r.source_id, r2((paidByInvoice.get(r.source_id) ?? 0) + r.total_myr))
  const unpaid: Unpaid[] = invoices
    .map((i) => ({ id: i.id, number: i.number, title: i.title, doc_date: i.doc_date, balance: r2(i.total_myr - (paidByInvoice.get(i.id) ?? 0)) }))
    .filter((i) => i.balance > 0)
    .sort((a, b) => a.doc_date.localeCompare(b.doc_date))

  const sum = (xs: DocRow[]) => r2(xs.reduce((s, r) => s + r.total_myr, 0))
  return {
    invoicedMonth: sum(invoices.filter(inMonth)),
    collectedMonth: sum(receipts.filter(inMonth)),
    outstanding: r2(unpaid.reduce((s, u) => s + u.balance, 0)),
    unpaid,
    proposalsMonth: proposals.filter(inMonth).length,
    proposalValue: sum(proposals),
    counts: { proposal: proposals.length, invoice: invoices.length, receipt: receipts.length },
    recent: [...rows].sort((a, b) => b.doc_date.localeCompare(a.doc_date)).slice(0, 8),
  }
}

export function daysBetween(from: string, to: string): number {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)
  return Math.max(0, Math.round(ms / 86400000))
}
