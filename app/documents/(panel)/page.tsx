import Link from "next/link";
import { ArrowUpRight, Banknote, CheckCircle2, CircleDollarSign, FilePlus2, FileText, Hourglass, Receipt, ScrollText } from "lucide-react";
import { PageHero } from "@/components/admin/page-hero";
import { getDocsUser } from "@/lib/documents/access";
import { formatDocDate, formatLongDate, formatRM, todayMY } from "@/lib/documents/model";
import { daysBetween, summarize, type DocRow } from "@/lib/documents/stats";
import { supabaseAdmin } from "@/lib/supabase/admin";

const HREF = { proposal: "/documents/proposals", invoice: "/documents/billing", receipt: "/documents/billing" } as const;
const KIND_ICON = { proposal: ScrollText, invoice: FileText, receipt: Receipt } as const;

export default async function DocumentsOverview() {
  if (!(await getDocsUser())) return null;
  const { data, error } = await supabaseAdmin()
    .from("documents")
    .select("id, kind, number, title, status, total_myr, doc_date, source_id")
    .order("doc_date", { ascending: false })
    .limit(5000);

  const today = todayMY();
  const rows = ((data ?? []) as DocRow[]).map((r) => ({ ...r, total_myr: Number(r.total_myr) }));
  const s = summarize(rows, today);
  const month = new Date(`${today}T00:00:00Z`).toLocaleString("en-MY", { month: "long", timeZone: "UTC" });

  const tiles = [
    { label: `Invoiced in ${month}`, value: formatRM(s.invoicedMonth), sub: `${s.counts.invoice} invoice${s.counts.invoice === 1 ? "" : "s"} in total`, icon: FileText, href: "/documents/billing", hot: false },
    { label: `Collected in ${month}`, value: formatRM(s.collectedMonth), sub: `${s.counts.receipt} receipt${s.counts.receipt === 1 ? "" : "s"} in total`, icon: CircleDollarSign, href: "/documents/billing", hot: false },
    { label: "Still to collect", value: formatRM(s.outstanding), sub: `${s.unpaid.length} unpaid invoice${s.unpaid.length === 1 ? "" : "s"}`, icon: Hourglass, href: "/documents/billing", hot: s.outstanding > 0 },
    { label: "Proposals", value: String(s.counts.proposal), sub: `${s.proposalsMonth} this month`, icon: ScrollText, href: "/documents/proposals", hot: false },
  ];

  return (
    <div className="ov dc-page">
      <PageHero
        kicker={formatLongDate(today)}
        title="Documents"
        accent="on brand."
        sub={s.unpaid.length ? <><strong>{s.unpaid.length}</strong> invoice{s.unpaid.length === 1 ? " is" : "s are"} waiting for payment.</> : "Proposals, invoices and receipts, ready as PDFs in a minute."}
        actions={<>
          <Link href="/documents/proposals/new" className="ov-btn ov-btn-light"><ScrollText size={16} /> New proposal</Link>
          <Link href="/documents/billing/new?kind=invoice" className="ov-btn"><FilePlus2 size={16} /> New invoice</Link>
          <Link href="/documents/billing/new?kind=receipt" className="ov-btn"><Receipt size={16} /> New receipt</Link>
        </>}
        aside={<div className="ov-money"><span className="ov-money-label"><Banknote size={16} /> Collected in {month}</span><strong>{formatRM(s.collectedMonth)}</strong><small>{formatRM(s.outstanding)} still to collect</small></div>}
      />

      {error ? <p className="adm-error" role="alert">The documents table is not set up yet. Run supabase/migrations/0011_documents.sql in Supabase, then reload.</p> : (
        <>
          <ul className="ov-tiles">
            {tiles.map((t, i) => (
              <li key={t.label} style={{ "--i": i } as React.CSSProperties}>
                <Link href={t.href} className={t.hot ? "is-hot" : ""}>
                  <span className="ov-tile-ic"><t.icon size={19} /></span>
                  <strong className="dc-tile-num">{t.value}</strong>
                  <span>{t.label}</span>
                  <small className="dc-tile-sub">{t.sub}</small>
                  <ArrowUpRight size={16} className="ov-tile-go" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="ov-grid">
            <section className="ov-card">
              <header><h2 className="dc-h">Waiting for payment <em>{s.unpaid.length}</em></h2></header>
              {s.unpaid.length === 0 ? <p className="dc-calm"><CheckCircle2 size={17} aria-hidden="true" /> Nothing outstanding. Every invoice has a receipt.</p> : (
                <ul className="dc-mini">
                  {s.unpaid.slice(0, 8).map((u) => {
                    const age = daysBetween(u.doc_date, today);
                    return (
                      <li key={u.id}>
                        <span className="dc-mini-ic"><FileText size={16} /></span>
                        <span className="dc-mini-text"><strong>{u.number}</strong> {u.title}<small className={age > 7 ? "is-late" : ""}>{age === 0 ? "Issued today" : `${age} day${age === 1 ? "" : "s"} ago`}</small></span>
                        <span className="dc-mini-end">{formatRM(u.balance)}<Link href={`/documents/billing/new?kind=receipt&from=${u.id}`}>Make receipt</Link></span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
            <section className="ov-card">
              <header><h2 className="dc-h">Latest <em>{rows.length} in total</em></h2></header>
              {s.recent.length === 0 ? <p className="dc-calm">Nothing yet. Start with a proposal or an invoice above.</p> : (
                <ul className="dc-mini">
                  {s.recent.map((r) => {
                    const Icon = KIND_ICON[r.kind];
                    return (
                      <li key={r.id}>
                        <span className={`dc-mini-ic is-${r.kind}`}><Icon size={16} /></span>
                        <Link href={HREF[r.kind]} className="dc-mini-text"><strong>{r.number}</strong> {r.title}<small>{r.kind} · {formatDocDate(r.doc_date)}</small></Link>
                        <span className="dc-mini-end">{r.status === "void" ? "Void" : r.total_myr ? formatRM(r.total_myr) : ""}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
