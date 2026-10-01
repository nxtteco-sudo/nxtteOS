// Server-only loading for /accounts, plus the sync that keeps income and
// payments in step with the invoices and receipts in Documents.
import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { planIsEmpty, planSync, type DocLite, type Expense, type Income, type Payment } from './model'

const INCOME_COLS = 'id, income_date, client_name, project, description, amount, document_id, notes'
const PAYMENT_COLS = 'id, income_id, amount, paid_on, method, reference, receipt_id'
const EXPENSE_COLS = 'id, expense_date, category, vendor, amount, notes'

/** Next.js reuses identical fetches within one render; a fresh signal opts out, so reads after the sync see its writes. */
const fresh = () => AbortSignal.timeout(20_000)

/** Postgres numeric columns arrive as strings. */
const withAmount = <T extends { amount: unknown }>(r: T) => ({ ...r, amount: Number(r.amount) })

/** The API returns at most 1,000 rows per request, so read in pages until a short one. */
async function readAll<T>(page: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>): Promise<T[]> {
  const size = 1000
  const out: T[] = []
  for (let from = 0; ; from += size) {
    const { data, error } = await page(from, from + size - 1)
    if (error) throw new Error(error.message)
    out.push(...((data ?? []) as T[]))
    if (!data || data.length < size) return out
  }
}

export async function loadIncome(): Promise<{ incomes: Income[]; payments: Payment[] }> {
  const db = supabaseAdmin()
  const [i, p] = await Promise.all([
    readAll<Income>((from, to) => db.from('account_income').select(INCOME_COLS).order('income_date', { ascending: false }).order('id').range(from, to).abortSignal(fresh())),
    readAll<Payment>((from, to) => db.from('account_payments').select(PAYMENT_COLS).order('paid_on', { ascending: false }).order('id').range(from, to).abortSignal(fresh())),
  ])
  return { incomes: i.map(withAmount), payments: p.map(withAmount) }
}

export async function loadExpenses(): Promise<Expense[]> {
  const db = supabaseAdmin()
  const rows = await readAll<Expense>((from, to) => db.from('account_expenses').select(EXPENSE_COLS).order('expense_date', { ascending: false }).order('id').range(from, to).abortSignal(fresh()))
  return rows.map(withAmount)
}

/** Inserts rows, skipping ones another page load already wrote (partial unique indexes, so no ON CONFLICT). */
async function insertSkippingDuplicates(table: 'account_income' | 'account_payments', rows: object[]) {
  const db = supabaseAdmin()
  const batch = await db.from(table).insert(rows)
  if (!batch.error) return
  if (batch.error.code !== '23505') return console.error(`[accounts] ${table} sync failed`, batch.error.message)
  for (const row of rows) {
    const one = await db.from(table).insert(row)
    if (one.error && one.error.code !== '23505') console.error(`[accounts] ${table} sync failed`, one.error.message)
  }
}

/**
 * Makes income and payments mirror Documents. Safe on every page load: it only
 * writes what is missing or changed (see planSync).
 */
export async function syncFromDocuments(): Promise<void> {
  const db = supabaseAdmin()
  const res = await db.from('documents').select('id, kind, number, title, status, total_myr, doc_date, source_id, data').in('kind', ['invoice', 'receipt']).limit(10000).abortSignal(fresh())
  if (res.error) return
  const docs: DocLite[] = (res.data ?? []).map((d) => {
    const data = (d.data ?? {}) as { invoiceNumber?: unknown; items?: { description?: unknown }[] }
    return {
      id: d.id as string,
      kind: d.kind as DocLite['kind'],
      number: d.number as string,
      title: (d.title as string) ?? '',
      status: d.status as string,
      total_myr: Number(d.total_myr),
      doc_date: d.doc_date as string,
      source_id: (d.source_id as string | null) ?? null,
      invoiceNumber: typeof data.invoiceNumber === 'string' ? data.invoiceNumber : '',
      project: typeof data.items?.[0]?.description === 'string' ? (data.items[0].description as string).slice(0, 200) : '',
    }
  })
  const { incomes, payments } = await loadIncome()
  const plan = planSync(docs, incomes, payments)
  if (planIsEmpty(plan)) return

  for (const u of plan.updateIncomes) await db.from('account_income').update({ ...u.patch, updated_at: new Date().toISOString() }).eq('id', u.id)
  for (const u of plan.updatePayments) await db.from('account_payments').update(u.patch).eq('id', u.id)
  if (plan.removePaymentIds.length) await db.from('account_payments').delete().in('id', plan.removePaymentIds)
  if (plan.removeIncomeIds.length) await db.from('account_income').delete().in('id', plan.removeIncomeIds)
  if (plan.createIncomes.length) await insertSkippingDuplicates('account_income', plan.createIncomes)
  if (plan.addPayments.length) {
    const { data: rows } = await db.from('account_income').select('id, document_id').in('document_id', plan.addPayments.map((p) => p.income_document_id)).abortSignal(fresh())
    const incomeByDoc = new Map((rows ?? []).map((r) => [r.document_id as string, r.id as string]))
    const inserts = plan.addPayments
      .map((p) => ({ income_id: incomeByDoc.get(p.income_document_id), receipt_id: p.receipt_id, amount: p.amount, paid_on: p.paid_on, method: p.method, reference: p.reference }))
      .filter((p) => p.income_id)
    if (inserts.length) await insertSkippingDuplicates('account_payments', inserts)
  }
}
