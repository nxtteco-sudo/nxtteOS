import { NextResponse } from 'next/server'
import { getAccountsUser } from '@/lib/accounts/access'
import { loadExpenses, loadIncome } from '@/lib/accounts/data'
import { buildStatement, periodPrefix, toCsv } from '@/lib/accounts/model'

export const runtime = 'nodejs'

// CSV of a statement for the accountant: /api/accounts/export?type=income|expenses&year=2026|all&month=9
export async function GET(req: Request) {
  if (!(await getAccountsUser())) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  const url = new URL(req.url)
  const type = url.searchParams.get('type')
  const yearRaw = url.searchParams.get('year')
  const year = yearRaw === 'all' ? null : Number(yearRaw)
  const monthRaw = Number(url.searchParams.get('month'))
  const month = year !== null && monthRaw >= 1 && monthRaw <= 12 ? monthRaw : null
  if ((type !== 'income' && type !== 'expenses') || (year !== null && (!Number.isInteger(year) || year < 2000 || year > 2100))) {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 })
  }
  const [{ incomes, payments }, expenses] = await Promise.all([loadIncome(), loadExpenses()])
  const st = buildStatement(incomes, payments, expenses, periodPrefix(year, month))
  const rows =
    type === 'income'
      ? [['Date', 'Client', 'For', 'Method', 'Reference', 'Amount (RM)'], ...st.received.map((r) => [r.date, r.client, r.what, r.method, r.reference, r.amount.toFixed(2)])]
      : [['Date', 'Category', 'Paid to', 'Notes', 'Amount (RM)'], ...st.spent.map((r) => [r.date, r.category, r.vendor, r.notes, r.amount.toFixed(2)])]
  return new NextResponse(toCsv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="nxtte-${type}-${periodPrefix(year, month) || 'all-time'}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
