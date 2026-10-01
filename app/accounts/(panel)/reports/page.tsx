import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Download, Percent, Scale } from "lucide-react";
import { PageHero } from "@/components/admin/page-hero";
import { MONTHS_FULL, PeriodTabs, monthLabel, rm, shortDate } from "@/components/accounts/kit";
import { PrintButton } from "@/components/accounts/print-button";
import { getAccountsUser } from "@/lib/accounts/access";
import { loadExpenses, loadIncome, syncFromDocuments } from "@/lib/accounts/data";
import { buildStatement, periodPrefix } from "@/lib/accounts/model";
import { todayMY } from "@/lib/documents/model";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string }> }) {
  if (!(await getAccountsUser())) return null;
  const sp = await searchParams;
  const today = todayMY();
  const thisYear = Number(today.slice(0, 4));
  try { await syncFromDocuments(); } catch { /* handled below */ }
  let data;
  try {
    const [{ incomes, payments }, expenses] = await Promise.all([loadIncome(), loadExpenses()]);
    data = { incomes, payments, expenses };
  } catch {
    return <p className="adm-error" role="alert">The accounts tables are not set up yet. Run supabase/migrations/0013_accounts.sql in Supabase.</p>;
  }
  const { incomes, payments, expenses } = data;
  const firstYear = Math.min(thisYear, ...[...payments.map((p) => p.paid_on), ...expenses.map((e) => e.expense_date)].map((d) => Number(d.slice(0, 4))));
  const years = Array.from({ length: thisYear - firstYear + 1 }, (_, i) => thisYear - i);
  const yearN = Number(sp.year);
  const year = sp.year === "all" ? null : Number.isInteger(yearN) && yearN >= 2000 && yearN <= 2100 ? yearN : thisYear;
  const monthN = Number(sp.month);
  const month = year !== null && monthN >= 1 && monthN <= 12 ? monthN : null;

  const st = buildStatement(incomes, payments, expenses, periodPrefix(year, month));
  const title = year === null ? "All time" : month ? `${MONTHS_FULL[month - 1]} ${year}` : `Year ${year}`;
  const q = `year=${year ?? "all"}${month ? `&month=${month}` : ""}`;
  const margin = st.totalIncome > 0 ? Math.round((st.profit / st.totalIncome) * 100) : null;
  const monthKeys = month ? [] : [...new Set([...st.received.map((r) => r.date.slice(0, 7)), ...st.spent.map((e) => e.date.slice(0, 7))])].sort();
  const monthly = monthKeys.map((key) => {
    const income = st.received.filter((r) => r.date.startsWith(key)).reduce((s, r) => s + r.amount, 0);
    const spent = st.spent.filter((e) => e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0);
    return { key, income, spent, net: income - spent };
  });
  const tiles = [
    { label: "Income received", value: rm(st.totalIncome), sub: `${st.received.length} payment${st.received.length === 1 ? "" : "s"}`, icon: ArrowUpRight, tone: "in" },
    { label: "Expenses", value: rm(st.totalExpenses), sub: `${st.spent.length} expense${st.spent.length === 1 ? "" : "s"}`, icon: ArrowDownRight, tone: "out" },
    { label: "Net profit", value: rm(st.profit), sub: st.profit < 0 ? "Spent more than came in" : "Kept after costs", icon: Scale, tone: st.profit < 0 ? "neg" : "pos" },
    { label: "Margin", value: margin === null ? "-" : `${margin}%`, sub: "Profit as a share of income", icon: Percent, tone: "" },
  ];

  return (
    <div className="ov ac-page ac-report">
      <div className="ac-noprint">
        <PageHero
          slim
          kicker="Accounts"
          title="Reports"
          accent="for the books."
          sub="Cash basis: income counts on the day the money arrived. Download the lists for your accountant, or print the statement."
          actions={<>
            <a className="ov-btn ov-btn-light" href={`/api/accounts/export?type=income&${q}`}><Download size={16} /> Income CSV</a>
            <a className="ov-btn" href={`/api/accounts/export?type=expenses&${q}`}><Download size={16} /> Expenses CSV</a>
            <PrintButton />
          </>}
        />
        <PeriodTabs current={year === null ? "all" : String(year)} options={[{ value: "all", label: "All time", href: "/accounts/reports?year=all" }, ...years.map((y) => ({ value: String(y), label: String(y), href: `/accounts/reports?year=${y}` }))]} />
        {year !== null && (
          <nav className="ac-months" aria-label="Month">
            {MONTHS_FULL.map((m, i) => <Link key={m} href={`/accounts/reports?year=${year}${month === i + 1 ? "" : `&month=${i + 1}`}`} aria-current={month === i + 1 ? "page" : undefined}>{m.slice(0, 3)}</Link>)}
          </nav>
        )}
      </div>

      <div className="ac-sheet">
        <p className="ac-sheet-kicker">nxtte, a brand of Aurexis Solution (SSM NS0315281-P) · Income and expense statement</p>
        <h2 className="ac-sheet-title">{title}</h2>
        <ul className="ov-tiles ac-tiles">
          {tiles.map((t, i) => <li key={t.label} style={{ "--i": i } as React.CSSProperties}><div className={`ac-tile is-${t.tone}`}><span className="ov-tile-ic"><t.icon size={19} /></span><strong>{t.value}</strong><span>{t.label}</span><small>{t.sub}</small></div></li>)}
        </ul>

        {monthly.length > 1 && (
          <section className="ov-card">
            <header><h2 className="dc-h">Profit and loss <em>by month</em></h2></header>
            <div className="dc-table-wrap"><table className="dc-table">
              <thead><tr><th>Month</th><th className="is-num">Income</th><th className="is-num">Expenses</th><th className="is-num">Net</th></tr></thead>
              <tbody>
                {monthly.map((m) => <tr key={m.key}><td><Link className="ac-link" href={`/accounts/reports?year=${m.key.slice(0, 4)}&month=${Number(m.key.slice(5))}`}>{monthLabel(m.key)}</Link></td><td className="is-num ac-in">{m.income ? rm(m.income) : "-"}</td><td className="is-num">{m.spent ? rm(-m.spent) : "-"}</td><td className={`is-num ${m.net < 0 ? "ac-neg" : "ac-pos"}`}>{rm(m.net)}</td></tr>)}
                <tr className="ac-total"><td>Total</td><td className="is-num ac-in">{rm(st.totalIncome)}</td><td className="is-num">{rm(-st.totalExpenses)}</td><td className={`is-num ${st.profit < 0 ? "ac-neg" : "ac-pos"}`}>{rm(st.profit)}</td></tr>
              </tbody>
            </table></div>
          </section>
        )}

        <section className="ov-card">
          <header><h2 className="dc-h">Income received <em>{rm(st.totalIncome)}</em></h2></header>
          {st.received.length === 0 ? <p className="dc-calm">No money received in this period.</p> : (
            <div className="dc-table-wrap"><table className="dc-table">
              <thead><tr><th>Date</th><th>Client</th><th>For</th><th>Via</th><th className="is-num">Amount</th></tr></thead>
              <tbody>
                {st.received.map((r, i) => <tr key={i}><td>{shortDate(r.date)}</td><td><strong>{r.client}</strong></td><td>{r.what}</td><td>{[r.method, r.reference].filter(Boolean).join(" · ") || "-"}</td><td className="is-num ac-in">{rm(r.amount)}</td></tr>)}
                <tr className="ac-total"><td colSpan={4}>Total · {st.received.length} payment{st.received.length === 1 ? "" : "s"}</td><td className="is-num ac-in">{rm(st.totalIncome)}</td></tr>
              </tbody>
            </table></div>
          )}
        </section>

        <section className="ov-card">
          <header><h2 className="dc-h">Expenses by category <em>{rm(st.totalExpenses)}</em></h2></header>
          {st.categories.length === 0 ? <p className="dc-calm">No expenses in this period.</p> : (
            <div className="dc-table-wrap"><table className="dc-table">
              <thead><tr><th>Category</th><th className="is-num">Items</th><th className="is-num">Share</th><th className="is-num">Amount</th></tr></thead>
              <tbody>
                {st.categories.map((c) => <tr key={c.category}><td>{c.category}</td><td className="is-num">{c.count}</td><td className="is-num">{st.totalExpenses ? Math.round((c.total / st.totalExpenses) * 100) : 0}%</td><td className="is-num">{rm(c.total)}</td></tr>)}
                <tr className="ac-total"><td>Total</td><td className="is-num">{st.spent.length}</td><td className="is-num">100%</td><td className="is-num">{rm(st.totalExpenses)}</td></tr>
              </tbody>
            </table></div>
          )}
        </section>

        {st.spent.length > 0 && (
          <details className="ov-card ac-ledger">
            <summary><span className="dc-h">Every expense <em>{st.spent.length}</em></span></summary>
            <div className="dc-table-wrap"><table className="dc-table">
              <thead><tr><th>Date</th><th>Paid to</th><th>Category</th><th className="is-num">Amount</th></tr></thead>
              <tbody>{st.spent.map((e, i) => <tr key={i}><td>{shortDate(e.date)}</td><td><strong>{e.vendor || "-"}</strong>{e.notes && <small className="ac-sub">{e.notes}</small>}</td><td>{e.category}</td><td className="is-num">{rm(e.amount)}</td></tr>)}</tbody>
            </table></div>
          </details>
        )}
      </div>
    </div>
  );
}
