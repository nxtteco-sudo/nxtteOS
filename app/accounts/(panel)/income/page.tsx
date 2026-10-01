import { ArrowUpRight, FileText, HandCoins, Users } from "lucide-react";
import { HeroStat, PageHero } from "@/components/admin/page-hero";
import { BarList, rm } from "@/components/accounts/kit";
import { IncomeBoard } from "@/components/accounts/income-board";
import { getAccountsUser } from "@/lib/accounts/access";
import { loadIncome, syncFromDocuments } from "@/lib/accounts/data";
import { ledger, owedRows } from "@/lib/accounts/model";
import { todayMY } from "@/lib/documents/model";

export default async function IncomePage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  if (!(await getAccountsUser())) return null;
  const sp = await searchParams;
  const today = todayMY();
  try { await syncFromDocuments(); } catch { /* shown below if the tables are missing */ }
  let data;
  try { data = await loadIncome(); } catch { return <p className="adm-error" role="alert">The accounts tables are not set up yet. Run supabase/migrations/0013_accounts.sql in Supabase.</p>; }
  const { incomes, payments } = data;
  const L = ledger(incomes, payments, [], "");
  const owed = owedRows(incomes, payments, today);
  const owedTotal = owed.reduce((s, o) => s + o.balance, 0);
  const invoiced = incomes.reduce((s, i) => s + i.amount, 0);
  const tiles = [
    { label: "Received, all time", value: rm(L.received), sub: `${L.paymentCount} payment${L.paymentCount === 1 ? "" : "s"}`, icon: ArrowUpRight, tone: "in" },
    { label: "Still owed", value: owedTotal > 0 ? rm(owedTotal) : "All paid", sub: owed.length ? `${owed.length} unpaid` : "Nothing waiting", icon: HandCoins, tone: owedTotal > 0 ? "hot" : "" },
    { label: "Invoiced", value: rm(invoiced), sub: `${incomes.length} entr${incomes.length === 1 ? "y" : "ies"}`, icon: FileText, tone: "" },
    { label: "Clients paid", value: String(L.byClient.length), sub: L.byClient[0] ? `Biggest: ${L.byClient[0].name}` : "No payments yet", icon: Users, tone: "" },
  ];
  return (
    <div className="ov ac-page">
      <PageHero slim kicker="Accounts" title="Income" accent="in and owed." sub="Every invoice, receipt and paid audit from Documents lands here on its own. Open a row to see its payments or record one." aside={<HeroStat icon={HandCoins} label="Still to collect" value={rm(owedTotal)} sub={`${rm(L.received)} received so far`} />} />
      <ul className="ov-tiles ac-tiles">
        {tiles.map((t, i) => <li key={t.label} style={{ "--i": i } as React.CSSProperties}><div className={`ac-tile is-${t.tone}`}><span className="ov-tile-ic"><t.icon size={19} /></span><strong>{t.value}</strong><span>{t.label}</span><small>{t.sub}</small></div></li>)}
      </ul>
      <section className="ov-card"><header><h2 className="dc-h">Who has paid you <em>{rm(L.received)}</em></h2></header><BarList rows={L.byClient} empty="No payments yet." /></section>
      <IncomeBoard incomes={incomes} payments={payments} today={today} startOpen={sp.new === "1"} />
    </div>
  );
}
