'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAccountsUser, requireAccounts } from '@/lib/accounts/access'
import { incomeBalance } from '@/lib/accounts/model'
import { TOO_MANY, overLimit } from '@/lib/spam-guard'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createSessionClient } from '@/lib/supabase/ssr'

type Ok = { ok: true }
type Fail = { ok: false; error: string }
const done = (): Ok => {
  revalidatePath('/accounts', 'layout')
  return { ok: true }
}
const fail = (error: string): Fail => ({ ok: false, error })

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const isId = (v: unknown): v is string => typeof v === 'string' && UUID_RE.test(v)
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\r/g, '').trim().slice(0, max) : '')
const dateOrNull = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(`${v}T00:00:00Z`)) ? v : null)
const money = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) && n > 0 && n < 1e9 ? Math.round(n * 100) / 100 : null
}

// ---- Access --------------------------------------------------------------------

export async function accountsSignIn(_prev: { error: string } | null, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) return { error: 'Enter your email and password.' }
  if (await overLimit('signin')) return { error: TOO_MANY }
  const supabase = await createSessionClient()
  if (!supabase) return { error: 'Accounts is not connected to Supabase yet.' }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'That email and password do not match.' }
  if (!(await getAccountsUser())) {
    await supabase.auth.signOut()
    return { error: 'This account does not have access to Accounts.' }
  }
  redirect('/accounts')
}

export async function accountsSignOut() {
  const supabase = await createSessionClient()
  await supabase?.auth.signOut()
  redirect('/accounts')
}

// ---- Income and payments ------------------------------------------------------------

export type IncomeInput = {
  date: string
  clientName: string
  project: string
  description: string
  amount: number
  receivedNow: boolean
  paidOn: string
  method: string
  reference: string
  notes: string
}

export async function addIncome(i: IncomeInput): Promise<Ok | Fail> {
  await requireAccounts()
  const amount = money(i.amount)
  const date = dateOrNull(i.date)
  const clientName = clean(i.clientName, 160)
  if (!amount) return fail('Enter an amount above zero.')
  if (!date) return fail('Pick the date.')
  if (!clientName) return fail('Who is this income from?')
  const db = supabaseAdmin()
  const { data: row, error } = await db
    .from('account_income')
    .insert({ income_date: date, client_name: clientName, project: clean(i.project, 200), description: clean(i.description, 400), amount, notes: clean(i.notes, 2000) })
    .select('id')
    .single()
  if (error) return fail('Could not save the income.')
  if (i.receivedNow) {
    const { error: pe } = await db.from('account_payments').insert({ income_id: row.id, amount, paid_on: dateOrNull(i.paidOn) ?? date, method: clean(i.method, 60), reference: clean(i.reference, 120) })
    if (pe) return fail('Saved the income, but could not record the payment. Record it from the Income page.')
  }
  return done()
}

export async function deleteIncome(id: string): Promise<Ok | Fail> {
  await requireAccounts()
  if (!isId(id)) return fail('Unknown entry.')
  const db = supabaseAdmin()
  const { data } = await db.from('account_income').select('document_id').eq('id', id).maybeSingle()
  if (!data) return fail('Not found.')
  if (data.document_id) return fail('This comes from Documents. Void the invoice or receipt there to remove it.')
  const { error } = await db.from('account_income').delete().eq('id', id)
  return error ? fail('Could not delete.') : done()
}

export async function recordPayment(i: { incomeId: string; amount: number; paidOn: string; method: string; reference: string }): Promise<Ok | Fail> {
  await requireAccounts()
  if (!isId(i.incomeId)) return fail('Unknown entry.')
  const amount = money(i.amount)
  const paidOn = dateOrNull(i.paidOn)
  if (!amount) return fail('Enter an amount above zero.')
  if (!paidOn) return fail('Pick the payment date.')
  const db = supabaseAdmin()
  const [{ data: income }, { data: pays }] = await Promise.all([
    db.from('account_income').select('id, amount').eq('id', i.incomeId).maybeSingle(),
    db.from('account_payments').select('amount').eq('income_id', i.incomeId),
  ])
  if (!income) return fail('Not found.')
  const { balance } = incomeBalance({ amount: Number(income.amount) }, (pays ?? []).map((p) => ({ amount: Number(p.amount) })))
  if (amount > balance + 0.004) return fail(`Only RM ${balance.toFixed(2)} is still owed on this entry.`)
  const { error } = await db.from('account_payments').insert({ income_id: i.incomeId, amount, paid_on: paidOn, method: clean(i.method, 60), reference: clean(i.reference, 120) })
  return error ? fail('Could not record the payment.') : done()
}

export async function deletePayment(id: string): Promise<Ok | Fail> {
  await requireAccounts()
  if (!isId(id)) return fail('Unknown payment.')
  const db = supabaseAdmin()
  const { data } = await db.from('account_payments').select('receipt_id').eq('id', id).maybeSingle()
  if (!data) return fail('Not found.')
  if (data.receipt_id) return fail('This payment comes from a receipt. Void the receipt in Documents to remove it.')
  const { error } = await db.from('account_payments').delete().eq('id', id)
  return error ? fail('Could not delete.') : done()
}

// ---- Expenses --------------------------------------------------------------------------

export type ExpenseInput = { id?: string; date: string; category: string; vendor: string; amount: number; notes: string }

export async function saveExpense(i: ExpenseInput): Promise<Ok | Fail> {
  await requireAccounts()
  if (i.id !== undefined && !isId(i.id)) return fail('Unknown expense.')
  const amount = money(i.amount)
  const date = dateOrNull(i.date)
  const category = clean(i.category, 80)
  if (!amount) return fail('Enter an amount above zero.')
  if (!date) return fail('Pick the date.')
  if (!category) return fail('Pick a category.')
  const row = { expense_date: date, category, vendor: clean(i.vendor, 160), amount, notes: clean(i.notes, 2000), updated_at: new Date().toISOString() }
  const db = supabaseAdmin()
  const { error } = i.id ? await db.from('account_expenses').update(row).eq('id', i.id) : await db.from('account_expenses').insert(row)
  return error ? fail('Could not save.') : done()
}

export async function deleteExpense(id: string): Promise<Ok | Fail> {
  await requireAccounts()
  if (!isId(id)) return fail('Unknown expense.')
  const { error } = await supabaseAdmin().from('account_expenses').delete().eq('id', id)
  return error ? fail('Could not delete.') : done()
}
