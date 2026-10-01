import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, HandCoins, Plus, Scale, Wallet } from "lucide-react";
import { HeroStat, PageHero } from "@/components/admin/page-hero";
import { BarList, MonthChart, PeriodTabs, monthLabel, rm, shortDate } from "@/components/accounts/kit";
import { getAccountsUser } from "@/lib/accounts/access";
import { loadExpenses, loadIncome, syncFromDocuments } from "@/lib/accounts/data";
import { activeMonths, ledger, monthSeries, owedRows, periodKey, type Period } from "@/lib/accounts/model";
import { todayMY } from "@/lib/documents/model";

export default async function AccountsOverview({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  if (!(await getAccountsUser())) return null;
  const sp = await searchParams;
  const period: Period = sp.period === "year" || sp.period === "month" ? sp.period : "all";
  const today = todayMY();

  let data;
  try {
    await syncFromDocuments();
    const [{ incomes, payments }, expenses] = await Promise.all([loadIncome(), loadExpenses()]);
    data = { incomes, payments, expenses };
  } catch {
    return <p className="adm-error" role="alert">The accounts tables are not set up yet. Run supabase/migrations/0013_accounts.sql in Supabase, then reload.</p>;
  }
  const { incomes, payments, expenses } = data;
  const L = ledger(incomes, payments, expenses, periodKey(period, today));
  const owed = owedRows(incomes, payments, today);
  const owedTotal = owed.reduce((s, o) => s + o.balance, 0);
  const thisMonth = ledger(incomes, payments, expenses, today.slice(0, 7));
  const series = monthSeries(payments, expenses, activeMonths(payments, expenses, today));
  const periodLabel = period === "all" ? "All time" : period === "year" ? `${today.slice(0, 4)} so far` : monthLabel(today.slice(0, 7));
  const tiles = [
    { label: "Money in", value: rm(L.received), sub: `${L.paymentCount} payment${L.paymentCount === 1 ? "" : "s"} from ${L.byClient.length} client${L.byClient.length === 1 ? "" : "s"}`, icon: ArrowUpRight, tone: "in" },
    { label: "Money out", value: rm(L.spent), sub: `${L.expenseCount} expense${L.expenseCount === 1 ? "" : "s"}`, icon: ArrowDownRight, tone: "out" },
    { label: "Profit", value: rm(L.net), sub: "Money in less money out", icon: Scale, tone: L.net < 0 ? "neg" : "pos" },
    { label: "Still to collect", value: rm(owedTotal), sub: owed.length ? `${owed.length} unpaid` : "Nothing waiting", icon: HandCoins, tone: owedTotal > 0 ? "hot" : "" },
  ];

  return (
    <div className="ov ac-page">
      <PageHero
        kicker={`Accounts · ${periodLabel}`}
        title="Every ringgit,"
        accent="in balance."
        sub={<>Income from Documents invoices, receipts and paid audits flows in on its own. This month: <strong>{rm(thisMonth.received)}</strong> in, {rm(thisMonth.spent)} out.</>}
        actions={<>
          <Link href="/accounts/income?new=1" className="ov-btn ov-btn-light"><Plus size={16} /> Add income</Link>
          <Link href="/accounts/expenses?new=1" className="ov-btn"><Plus size={16} /> Add expense</Link>
        </>}
        aside={<HeroStat icon={Wallet} label={`Profit, ${periodLabel.toLowerCase()}`} value={rm(L.net)} sub={`${rm(L.received)} in · ${rm(L.spent)} out`} />}
      />

      <PeriodTabs current={period} options={[{ value: "all", label: "All time", href: "/accounts" }, { value: "year", label: "This year", href: "/accounts?period=year" }, { value: "month", label: "This month", href: "/accounts?period=month" }]} />

      <ul className="ov-tiles ac-tiles">
        {tiles.map((t, i) => (
          <li key={t.label} style={{ "--i": i } as React.CSSProperties}>
            <div className={`ac-tile is-${t.tone}`}>
              <span className="ov-tile-ic"><t.icon size={19} /></span>
              <strong>{t.value}</strong>
              <span>{t.label}</span>
              <small>{t.sub}</small>
            </div>
          </li>
        ))}
      </ul>

      <section className="ov-card">
        <header><h2 className="dc-h">Money in and out <em>by month</em></h2></header>
        <MonthChart series={series} />
      </section>

      <div className="ov-grid">
        <section className="ov-card">
          <header><h2 className="dc-h">Income by client <em>{rm(L.received)}</em></h2><Link className="ac-link" href="/accounts/income">Open income</Link></header>
          <BarList rows={L.byClient} empty="No money received in this period yet." />
        </section>
        <section className="ov-card">
          <header><h2 className="dc-h">Spending by category <em>{rm(L.spent)}</em></h2><Link className="ac-link" href="/accounts/expenses">Open expenses</Link></header>
          <BarList rows={L.byCategory.slice(0, 8).map((c) => ({ ...c, href: `/accounts/expenses?category=${encodeURIComponent(c.name)}` }))} tone="out" empty="No expenses in this period yet." />
        </section>
      </div>

      <div className="ov-grid">
        <section className="ov-card">
          <header><h2 className="dc-h">Latest activity <em>{L.activity.length}</em></h2></header>
          {L.activity.length === 0 ? <p className="dc-calm">Nothing recorded in this period yet.</p> : (
            <ul className="dc-mini">
              {L.activity.map((a) => (
                <li key={a.id}>
                  <span className={`dc-mini-ic ${a.kind === "income" ? "is-receipt" : ""}`}>{a.kind === "income" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}</span>
                  <span className="dc-mini-text"><strong>{a.title}</strong><small>{a.detail} · {shortDate(a.date)}</small></span>
                  <span className={`dc-mini-end ${a.kind === "income" ? "ac-in" : ""}`}>{a.amount < 0 ? "- " : "+ "}{rm(Math.abs(a.amount))}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="ov-card">
          <header><h2 className="dc-h">Waiting for payment <em>{rm(owedTotal)}</em></h2></header>
          {owed.length === 0 ? <p className="dc-calm">Every invoice is paid.</p> : (
            <ul className="dc-mini">
              {owed.slice(0, 6).map((o) => (
                <li key={o.income.id}>
                  <span className="dc-mini-ic"><HandCoins size={16} /></span>
                  <span className="dc-mini-text"><strong>{o.income.client_name}</strong><small className={o.ageDays > 7 ? "is-late" : ""}>{o.state === "partial" ? "Part paid · " : ""}{o.ageDays} day{o.ageDays === 1 ? "" : "s"} old</small></span>
                  <span className="dc-mini-end">{rm(o.balance)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <p className="ac-foot"><Wallet size={14} aria-hidden="true" /> Cash basis: income counts on the day the money arrived. No tax is applied.</p>
    </div>
  );
}
