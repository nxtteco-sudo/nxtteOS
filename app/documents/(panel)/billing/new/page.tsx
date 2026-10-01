import { PageHero } from "@/components/admin/page-hero";
import { BillingEditor, type BillingState } from "@/components/documents/billing-editor";
import { getPaymentSettings } from "@/lib/customer";
import { getDocsUser } from "@/lib/documents/access";
import { addDays, invoiceNumber, nextSequence, receiptNumber, todayMY } from "@/lib/documents/model";
import { DEFAULT_INVOICE_NOTES, blankLine } from "@/lib/documents/presets";
import { checkInvoice } from "@/lib/documents/validate";
import { supabaseAdmin } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function NewBillingPage({ searchParams }: { searchParams: Promise<{ kind?: string; from?: string }> }) {
  if (!(await getDocsUser())) return null;
  const sp = await searchParams;
  const kind = sp.kind === "receipt" ? "receipt" : "invoice";
  const db = supabaseAdmin();
  const [numbers, settings, source] = await Promise.all([
    db.from("documents").select("number").eq("kind", kind).limit(10000),
    getPaymentSettings().catch(() => null),
    kind === "receipt" && sp.from && UUID_RE.test(sp.from)
      ? db.from("documents").select("id, data").eq("id", sp.from).eq("kind", "invoice").maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const existing = (numbers.data ?? []).map((r) => r.number as string);
  const today = todayMY();
  const number = kind === "invoice" ? invoiceNumber(nextSequence("INV-", existing)) : receiptNumber(nextSequence("REC-", existing));

  const base: BillingState = {
    kind, number, date: today, dueDate: kind === "invoice" ? addDays(today, 7) : "", sourceId: null, invoiceNumber: "",
    billTo: { name: "", attn: "", address: "", phone: "" },
    items: [blankLine()],
    bank: { bank: settings?.bank_name ?? "", accountName: settings?.account_name ?? "", accountNo: settings?.account_number ?? "", duitnow: settings?.duitnow_id ?? "" },
    notes: kind === "invoice" ? DEFAULT_INVOICE_NOTES(number) : "",
    method: "Bank transfer", reference: "",
  };

  const src = source.data as { id: string; data: unknown } | null;
  const inv = src ? checkInvoice(src.data) : null;
  const initial: BillingState = src && inv?.ok
    ? { ...base, sourceId: src.id, invoiceNumber: inv.data.number, reference: inv.data.number, billTo: inv.data.billTo, items: inv.data.items }
    : base;

  return (
    <div className="ov dc-page dc-edit-page">
      <PageHero slim kicker={kind === "invoice" ? "New invoice" : "New receipt"} title={kind === "invoice" ? "New invoice" : inv?.ok ? `Receipt for ${inv.data.number}` : "New receipt"} sub="The preview is the real PDF and updates as you type." />
      <BillingEditor key={`${kind}-${sp.from ?? ""}`} initial={initial} />
    </div>
  );
}
