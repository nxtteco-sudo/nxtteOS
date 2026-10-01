import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDocDate, formatRM } from "@/lib/documents/model";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { RowActions } from "./row-actions";

type Kind = "proposal" | "invoice" | "receipt";
type Row = { id: string; kind: Kind; number: string; title: string; status: string; total_myr: number; doc_date: string; audit_id: string | null };

// The table of saved documents for one page of the dashboard.
export async function DocList({ kinds, empty }: { kinds: Kind[]; empty: "proposal" | "billing" }) {
  const { data, error } = await supabaseAdmin()
    .from("documents")
    .select("id, kind, number, title, status, total_myr, doc_date, audit_id")
    .in("kind", kinds)
    .order("doc_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return <p className="adm-error" role="alert">Could not load documents. Check that migration 0011 has been run.</p>;
  const rows = (data ?? []) as Row[];
  if (!rows.length) return <EmptyState kind={empty} />;
  const mixed = kinds.length > 1;
  return (
    <div className="dc-table-wrap">
      <table className="dc-table">
        <thead><tr><th>Number</th><th>Client</th><th>Date</th><th className="is-num">Amount</th><th>Status</th><th><span className="adm-sr">Actions</span></th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={r.status === "void" ? "is-void" : ""}>
              <td><strong>{r.number}</strong>{mixed && <span className="dc-kind">{r.kind}</span>}{r.audit_id && <span className="dc-kind is-audit">audit</span>}</td>
              <td>{r.title}</td>
              <td>{formatDocDate(r.doc_date)}</td>
              <td className="is-num">{r.total_myr ? formatRM(Number(r.total_myr)) : ""}</td>
              <td><span className={`adm-pill ${r.status === "void" ? "" : "is-live"}`}>{r.status === "void" ? "Void" : "Issued"}</span></td>
              <td><RowActions id={r.id} kind={r.kind} isVoid={r.status === "void"} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A small stack of mock documents, so an empty page shows what it will hold. */
function EmptyState({ kind }: { kind: "proposal" | "billing" }) {
  const proposal = kind === "proposal";
  return (
    <div className="dc-empty">
      <div className="dc-empty-art" aria-hidden="true">
        {proposal ? (
          <>
            <span className="dc-sheet is-dark is-back"><i /><b /></span>
            <span className="dc-sheet is-dark is-front"><i /><b /><em>Proposal</em></span>
          </>
        ) : (
          <>
            <span className="dc-sheet is-back"><i /><b /><b /></span>
            <span className="dc-sheet is-front"><i /><b /><b /><strong>Paid</strong></span>
          </>
        )}
      </div>
      <div>
        <h2>{proposal ? "Your first proposal is a minute away." : "No invoices or receipts yet."}</h2>
        <p>{proposal ? "Pick a package and the template fills itself from your real price list. You only write the audit findings." : "Start an invoice from the price list. When you mark an audit as paid in admin, its receipt appears here on its own."}</p>
        <Link href={proposal ? "/documents/proposals/new" : "/documents/billing/new?kind=invoice"} className="adm-btn adm-btn-primary"><Plus size={16} /> {proposal ? "New proposal" : "New invoice"}</Link>
      </div>
    </div>
  );
}
