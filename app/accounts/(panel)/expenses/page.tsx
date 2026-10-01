import { ArrowDownRight, CalendarDays, Receipt, Tags } from "lucide-react";
import { HeroStat, PageHero } from "@/components/admin/page-hero";
import { BarList, rm } from "@/components/accounts/kit";
import { ExpensesBoard } from "@/components/accounts/expenses-board";
import { getAccountsUser } from "@/lib/accounts/access";
import { loadExpenses } from "@/lib/accounts/data";
import { ledger } from "@/lib/accounts/model";
import { todayMY } from "@/lib/documents/model";

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ new?: string; category?: string }> }) {
  if (!(await getAccountsUser())) return null;
  const sp = await searchParams;
  const today = todayMY();
  let expenses;
  try { expenses = await loadExpenses(); } catch { return <p className="adm-error" role="alert">The accounts tables are not set up yet. Run supabase/migrations/0013_accounts.sql in Supabase.</p>; }
  const all = ledger([], [], expenses, "");
  const month = ledger([], [], expenses, today.slice(0, 7));
  const year = ledger([], [], expenses, today.slice(0, 4));
  const tiles = [
    { label: "This month", value: rm(month.spent), sub: `${month.expenseCount} expense${month.expenseCount === 1 ? "" : "s"}`, icon: CalendarDays },
    { label: "This year", value: rm(year.spent), sub: `${year.expenseCount} expense${year.expenseCount === 1 ? "" : "s"}`, icon: Receipt },
    { label: "All time", value: rm(all.spent), sub: `${all.expenseCount} expense${all.expenseCount === 1 ? "" : "s"}`, icon: ArrowDownRight },
    { label: "Biggest category", value: all.byCategory[0]?.name ?? "None yet", sub: all.byCategory[0] ? rm(all.byCategory[0].total) : "Add your first expense", icon: Tags },
  ];
  return (
    <div className="ov ac-page">
      <PageHero slim kicker="Accounts" title="Expenses" accent="every ringgit out." sub="Subscriptions, freelancers, shoots and the rest. Filter by month or category, or tap a category to see only that." aside={<HeroStat icon={ArrowDownRight} label="Spent this month" value={rm(month.spent)} sub={`${rm(year.spent)} this year`} />} />
      <ul className="ov-tiles ac-tiles">
        {tiles.map((t, i) => <li key={t.label} style={{ "--i": i } as React.CSSProperties}><div className="ac-tile is-out"><span className="ov-tile-ic"><t.icon size={19} /></span><strong className={t.label === "Biggest category" ? "ac-tile-text" : ""}>{t.value}</strong><span>{t.label}</span><small>{t.sub}</small></div></li>)}
      </ul>
      <section className="ov-card"><header><h2 className="dc-h">By category, all time <em>{rm(all.spent)}</em></h2></header><BarList rows={all.byCategory} tone="out" empty="No expenses yet." /></section>
      <ExpensesBoard key={sp.category ?? ""} expenses={expenses} today={today} startOpen={sp.new === "1"} startCategory={sp.category ?? ""} />
    </div>
  );
}
