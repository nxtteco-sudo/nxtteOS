import { PageHero } from "@/components/admin/page-hero";
import { notFound } from "next/navigation";
import { BillingEditor, type BillingState } from "@/components/documents/billing-editor";
import { getDocsUser } from "@/lib/documents/access";
import { checkInvoice, checkReceipt } from "@/lib/documents/validate";
import { supabaseAdmin } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const NO_BANK = { bank: "", accountName: "", accountNo: "", duitnow: "" };

export default async function EditBillingPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getDocsUser())) return null;
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { data: row } = await supabaseAdmin().from("documents").select("id, kind, source_id, data").eq("id", id).in("kind", ["invoice", "receipt"]).maybeSingle();
  if (!row) notFound();

  let initial: BillingState;
  if (row.kind === "invoice") {
    const c = checkInvoice(row.data);
    if (!c.ok) notFound();
    const d = c.data;
    initial = { kind: "invoice", number: d.number, date: d.date, dueDate: d.dueDate ?? "", sourceId: null, invoiceNumber: "", billTo: d.billTo, items: d.items, bank: d.bank, notes: d.notes, method: "", reference: "" };
  } else {
    const c = checkReceipt(row.data);
    if (!c.ok) notFound();
    const d = c.data;
    initial = { kind: "receipt", number: d.number, date: d.date, dueDate: "", sourceId: (row.source_id as string | null) ?? null, invoiceNumber: d.invoiceNumber, billTo: d.billTo, items: d.items, bank: NO_BANK, notes: d.notes, method: d.method, reference: d.reference };
  }

  return (
    <div className="ov dc-page dc-edit-page">
      <PageHero slim kicker={initial.kind === "invoice" ? "Edit invoice" : "Edit receipt"} title={`Edit ${initial.number}`} sub="Change anything, then save. The PDF is rebuilt from your changes." />
      <BillingEditor key={id} docId={id} initial={initial} />
    </div>
  );
}
