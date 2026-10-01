// Accounting maths for /accounts (ported from Aurexis, without referrals).
// Pure, no imports. Dates are YYYY-MM-DD (Malaysia calendar days); money is RM.
// Cash basis: income counts on the day the money arrived.

export type Income = {
  id: string
  income_date: string
  client_name: string
  project: string
  description: string
  amount: number
  document_id: string | null
  notes: string
}
export type Payment = {
  id: string
  income_id: string
  amount: number
  paid_on: string
  method: string
  reference: string
  receipt_id: string | null
}
export type Expense = {
  id: string
  expense_date: string
  category: string
  vendor: string
  amount: number
  notes: string
}

/** Categories for a social media agency. Typed-in ones are kept too. */
export const EXPENSE_CATEGORIES = [
  'Software and subscriptions',
  'Freelancers and contractors',
  'Salary and allowances',
  'Shoots and production',
  'Equipment and props',
  'Advertising (our own)',
  'Hosting and domains',
  'Phone and internet',
  'Travel and transport',
  'Food and drinks',
  'Training and courses',
  'Bank and payment fees',
  'Tax and compliance',
  'Office',
  'Other',
] as const

export const PAYMENT_METHODS = ['Bank transfer', 'DuitNow', 'Cash', 'Cheque', 'Card', 'Other']

export const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

// ---- Income and payments ---------------------------------------------------------

export type IncomeState = 'paid' | 'partial' | 'owed'

export function incomeBalance(income: Pick<Income, 'amount'>, payments: Pick<Payment, 'amount'>[]) {
  const paid = r2(payments.reduce((s, p) => s + Number(p.amount), 0))
  const balance = r2(Math.max(0, Number(income.amount) - paid))
  const state: IncomeState = balance <= 0 ? 'paid' : paid > 0 ? 'partial' : 'owed'
  return { paid, balance, state }
}

export function groupPayments(payments: Payment[]): Map<string, Payment[]> {
  const m = new Map<string, Payment[]>()
  for (const p of payments) {
    const list = m.get(p.income_id)
    if (list) list.push(p)
    else m.set(p.income_id, [p])
  }
  return m
}

// ---- Dates ---------------------------------------------------------------------------

export const monthOf = (d: string) => d.slice(0, 7)

/** The last `n` month keys ending at today's month, oldest first. */
export function lastMonths(today: string, n: number): string[] {
  let y = Number(today.slice(0, 4))
  let m = Number(today.slice(5, 7))
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    out.unshift(`${y}-${String(m).padStart(2, '0')}`)
    m -= 1
    if (m === 0) { m = 12; y -= 1 }
  }
  return out
}

export function daysBetween(from: string, to: string): number {
  return Math.max(0, Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000))
}

// ---- Overview --------------------------------------------------------------------------

export type OwedRow = { income: Income; paid: number; balance: number; state: IncomeState; ageDays: number }

export function owedRows(incomes: Income[], payments: Payment[], today: string): OwedRow[] {
  const byIncome = groupPayments(payments)
  return incomes
    .map((income) => ({ income, ...incomeBalance(income, byIncome.get(income.id) ?? []), ageDays: daysBetween(income.income_date, today) }))
    .filter((r) => r.balance > 0)
    .sort((a, b) => a.income.income_date.localeCompare(b.income.income_date))
}

/** '' = all time, 'YYYY' = a year, 'YYYY-MM' = a month. */
export type Period = 'all' | 'year' | 'month'
export const periodKey = (period: Period, today: string) => (period === 'all' ? '' : period === 'year' ? today.slice(0, 4) : monthOf(today))

export type ActivityEntry = { id: string; date: string; title: string; kind: 'income' | 'expense'; detail: string; amount: number }

/** Totals, breakdowns and recent activity for one period. */
export function ledger(incomes: Income[], payments: Payment[], expenses: Expense[], prefix: string, activityLimit = 10) {
  const incomeById = new Map(incomes.map((i) => [i.id, i]))
  const pays = payments.filter((p) => p.paid_on.startsWith(prefix))
  const exps = expenses.filter((e) => e.expense_date.startsWith(prefix))
  const received = r2(pays.reduce((s, p) => s + Number(p.amount), 0))
  const spent = r2(exps.reduce((s, e) => s + Number(e.amount), 0))

  const tally = (pairs: [string, number][]) => {
    const m = new Map<string, { total: number; count: number }>()
    for (const [name, amount] of pairs) {
      const c = m.get(name) ?? { total: 0, count: 0 }
      m.set(name, { total: r2(c.total + amount), count: c.count + 1 })
    }
    return [...m.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.total - a.total)
  }

  const activity: ActivityEntry[] = [
    ...pays.map((p) => {
      const inc = incomeById.get(p.income_id)
      return { id: `p-${p.id}`, date: p.paid_on, title: inc?.client_name || 'Payment', kind: 'income' as const, detail: inc?.description || inc?.project || 'Payment received', amount: Number(p.amount) }
    }),
    ...exps.map((e) => ({ id: `e-${e.id}`, date: e.expense_date, title: e.vendor || e.category, kind: 'expense' as const, detail: e.category, amount: -Number(e.amount) })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, activityLimit)

  return {
    received,
    spent,
    net: r2(received - spent),
    paymentCount: pays.length,
    expenseCount: exps.length,
    byClient: tally(pays.map((p) => [incomeById.get(p.income_id)?.client_name || 'Unknown client', Number(p.amount)])),
    byCategory: tally(exps.map((e) => [e.category, Number(e.amount)])),
    activity,
  }
}

/** Month keys from the first month with any money movement up to today (at most `max`). */
export function activeMonths(payments: Payment[], expenses: Expense[], today: string, max = 12): string[] {
  const dates = [...payments.map((p) => p.paid_on), ...expenses.map((e) => e.expense_date)].sort()
  if (!dates.length) return lastMonths(today, 6)
  const first = monthOf(dates[0])
  const active = lastMonths(today, 120).filter((m) => m >= first).slice(-max)
  // Always show at least six months, so one busy month is seen in context.
  return active.length >= 6 ? active : lastMonths(today, 6)
}

export function monthSeries(payments: Payment[], expenses: Expense[], months: string[]) {
  return months.map((key) => ({
    key,
    income: r2(payments.filter((p) => p.paid_on.startsWith(key)).reduce((s, p) => s + Number(p.amount), 0)),
    expenses: r2(expenses.filter((e) => e.expense_date.startsWith(key)).reduce((s, e) => s + Number(e.amount), 0)),
  }))
}

// ---- Statement (reports) -------------------------------------------------------------

/** A null year means all time. */
export function periodPrefix(year: number | null, month: number | null): string {
  if (year === null) return ''
  return month ? `${year}-${String(month).padStart(2, '0')}` : String(year)
}

export function buildStatement(incomes: Income[], payments: Payment[], expenses: Expense[], prefix: string) {
  const incomeById = new Map(incomes.map((i) => [i.id, i]))
  const received = payments
    .filter((p) => p.paid_on.startsWith(prefix))
    .map((p) => {
      const inc = incomeById.get(p.income_id)
      return { date: p.paid_on, client: inc?.client_name ?? '', what: inc?.description || inc?.project || '', method: p.method, reference: p.reference, amount: Number(p.amount) }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
  const spent = expenses
    .filter((e) => e.expense_date.startsWith(prefix))
    .map((e) => ({ date: e.expense_date, category: e.category, vendor: e.vendor, notes: e.notes, amount: Number(e.amount) }))
    .sort((a, b) => a.date.localeCompare(b.date))
  const byCategory = new Map<string, { total: number; count: number }>()
  for (const e of spent) {
    const c = byCategory.get(e.category) ?? { total: 0, count: 0 }
    byCategory.set(e.category, { total: r2(c.total + e.amount), count: c.count + 1 })
  }
  const totalIncome = r2(received.reduce((s, x) => s + x.amount, 0))
  const totalExpenses = r2(spent.reduce((s, x) => s + x.amount, 0))
  return {
    received,
    spent,
    categories: [...byCategory.entries()].sort((a, b) => b[1].total - a[1].total).map(([category, c]) => ({ category, ...c })),
    totalIncome,
    totalExpenses,
    profit: r2(totalIncome - totalExpenses),
  }
}

export function toCsv(rows: (string | number)[][]): string {
  const cell = (v: string | number) => {
    let s = String(v)
    // Spreadsheet formula injection: a leading = + - @ would run as a formula.
    if (/^[=+\-@]/.test(s) && Number.isNaN(Number(s))) s = `'${s}`
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return rows.map((r) => r.map(cell).join(',')).join('\n')
}

// ---- Sync with Documents ------------------------------------------------------------

/** The bits of a Documents row the sync needs (flattened on the server). */
export type DocLite = {
  id: string
  kind: 'invoice' | 'receipt'
  number: string
  title: string
  status: string
  total_myr: number
  doc_date: string
  source_id: string | null
  /** Receipts: the invoice number typed on the receipt. */
  invoiceNumber: string
  /** Description of the first line. */
  project: string
}

export type SyncPlan = {
  createIncomes: Omit<Income, 'id' | 'notes'>[]
  /** Payments to add, addressed by the document that owns the income (it may not exist yet). */
  addPayments: { income_document_id: string; receipt_id: string; amount: number; paid_on: string; reference: string; method: string }[]
  removeIncomeIds: string[]
  removePaymentIds: string[]
  updateIncomes: { id: string; patch: Pick<Income, 'income_date' | 'client_name' | 'project' | 'description' | 'amount'> }[]
  updatePayments: { id: string; patch: Pick<Payment, 'amount' | 'paid_on' | 'reference'> }[]
}

/**
 * Works out what must change so income and payments mirror Documents:
 * - each live invoice is an income row; each receipt for it is a payment;
 * - a receipt with no invoice (for example an RM 199 audit receipt) is its own
 *   income row, already paid.
 * Idempotent: running it again on the result plans nothing.
 */
export function planSync(docs: DocLite[], incomes: Income[], payments: Payment[]): SyncPlan {
  const docById = new Map(docs.map((d) => [d.id, d]))
  const live = (d: DocLite) => d.status !== 'void' && Number(d.total_myr) > 0
  const invoices = docs.filter((d) => d.kind === 'invoice')
  const liveInvoiceIds = new Set(invoices.filter(live).map((d) => d.id))
  const incomeByDoc = new Map(incomes.filter((i) => i.document_id).map((i) => [i.document_id as string, i]))
  const paymentByReceipt = new Map(payments.filter((p) => p.receipt_id).map((p) => [p.receipt_id as string, p]))
  const paymentsByIncome = groupPayments(payments)
  const plan: SyncPlan = { createIncomes: [], addPayments: [], removeIncomeIds: [], removePaymentIds: [], updateIncomes: [], updatePayments: [] }

  /** The invoice a receipt pays, if it is still live. */
  const invoiceFor = (rec: DocLite) => {
    const id = rec.source_id ?? (rec.invoiceNumber ? invoices.find((i) => i.number === rec.invoiceNumber)?.id : undefined) ?? null
    return id && liveInvoiceIds.has(id) ? id : null
  }

  const syncIncome = (doc: DocLite, description: string) => {
    const patch = { income_date: doc.doc_date, client_name: doc.title, project: doc.project, description, amount: Number(doc.total_myr) }
    const existing = incomeByDoc.get(doc.id)
    if (!existing) {
      plan.createIncomes.push({ ...patch, document_id: doc.id })
      return
    }
    if (existing.income_date !== patch.income_date || existing.client_name !== patch.client_name || existing.project !== patch.project || existing.description !== patch.description || Number(existing.amount) !== patch.amount) {
      plan.updateIncomes.push({ id: existing.id, patch })
    }
  }

  for (const inv of invoices) if (live(inv)) syncIncome(inv, `Invoice ${inv.number}`)

  for (const rec of docs.filter((d) => d.kind === 'receipt' && live(d))) {
    const target = invoiceFor(rec)
    // A receipt with no invoice stands on its own: its own income row, paid in full.
    const owner = target ?? rec.id
    if (!target) syncIncome(rec, `Receipt ${rec.number}`)
    const existing = paymentByReceipt.get(rec.id)
    const patch = { amount: Number(rec.total_myr), paid_on: rec.doc_date, reference: rec.number }
    if (!existing) {
      plan.addPayments.push({ income_document_id: owner, receipt_id: rec.id, method: '', ...patch })
    } else if (Number(existing.amount) !== patch.amount || existing.paid_on !== patch.paid_on || existing.reference !== patch.reference) {
      plan.updatePayments.push({ id: existing.id, patch })
    }
  }

  // A voided receipt takes its payment back.
  for (const p of payments) {
    if (p.receipt_id && docById.get(p.receipt_id)?.status === 'void') plan.removePaymentIds.push(p.id)
  }
  // A voided standalone receipt removes its income row too. A voided invoice
  // drops its income, unless money was already received against it.
  for (const inc of incomes) {
    const doc = inc.document_id ? docById.get(inc.document_id) : undefined
    if (!doc || doc.status !== 'void') continue
    if (doc.kind === 'receipt' || !(paymentsByIncome.get(inc.id)?.length)) plan.removeIncomeIds.push(inc.id)
  }
  return plan
}

export const planIsEmpty = (p: SyncPlan) =>
  !p.createIncomes.length && !p.addPayments.length && !p.removeIncomeIds.length && !p.removePaymentIds.length && !p.updateIncomes.length && !p.updatePayments.length
