"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CreditCard, Download, FileText, ListOrdered, Loader2, Plus, Trash2 } from "lucide-react";
import { saveDocument } from "@/app/documents/actions";
import { formatRM, lineTotal, totals, type BankDetails, type BillTo, type LineItem } from "@/lib/documents/model";
import { PRICE_PRESETS, blankLine } from "@/lib/documents/presets";
import { PdfPreview } from "./pdf-preview";

export type BillingState = {
  kind: "invoice" | "receipt";
  number: string;
  date: string;
  dueDate: string;
  sourceId: string | null;
  invoiceNumber: string;
  billTo: BillTo;
  items: LineItem[];
  bank: BankDetails;
  notes: string;
  method: string;
  reference: string;
};

const toPayload = (s: BillingState) =>
  s.kind === "invoice"
    ? { number: s.number, date: s.date, dueDate: s.dueDate || null, billTo: s.billTo, items: s.items, bank: s.bank, notes: s.notes }
    : { number: s.number, date: s.date, invoiceNumber: s.invoiceNumber, billTo: s.billTo, items: s.items, method: s.method, reference: s.reference, notes: s.notes };

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="adm-field"><span>{label}{hint && <em>{hint}</em>}</span>{children}</label>;
}

export function BillingEditor({ initial, docId }: { initial: BillingState; docId?: string }) {
  const router = useRouter();
  const [s, setS] = useState<BillingState>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const isInvoice = s.kind === "invoice";
  const set = <K extends keyof BillingState>(k: K, v: BillingState[K]) => setS((p) => ({ ...p, [k]: v }));
  const setBill = (patch: Partial<BillTo>) => setS((p) => ({ ...p, billTo: { ...p.billTo, ...patch } }));
  const setItem = (i: number, patch: Partial<LineItem>) => setS((p) => ({ ...p, items: p.items.map((it, n) => (n === i ? { ...it, ...patch } : it)) }));

  const payload = useMemo(() => JSON.stringify({ kind: s.kind, data: toPayload(s) }), [s]);
  const t = totals(s.items);

  const addPreset = (value: string) => {
    const [g, label] = value.split("|");
    const p = PRICE_PRESETS.find((x) => x.group === g)?.items.find((x) => x.label === label);
    if (!p) return;
    setS((prev) => ({ ...prev, items: [...prev.items.filter((i) => i.description.trim() || i.price), { description: p.label, note: p.note, price: p.price, qty: 1 }] }));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await saveDocument({ kind: s.kind, data: toPayload(s), sourceId: s.sourceId, id: docId });
    setSaving(false);
    if (!res.ok) return setError(res.error);
    window.open(`/api/documents/${res.id}/pdf`, "_blank", "noopener");
    router.push("/documents/billing");
    router.refresh();
  };

  return (
    <div className="dc-editor">
      <div className="dc-form">
        <fieldset className="adm-card">
          <legend><span className="dc-leg-ic"><FileText size={16} /></span>{isInvoice ? "Invoice" : "Receipt"}</legend>
          <div className="dc-grid-2">
            <Field label={isInvoice ? "Invoice number" : "Receipt number"}><input value={s.number} onChange={(e) => set("number", e.target.value)} /></Field>
            <Field label="Date"><input type="date" value={s.date} onChange={(e) => set("date", e.target.value)} /></Field>
            {isInvoice
              ? <Field label="Due" hint="optional"><input type="date" value={s.dueDate} onChange={(e) => set("dueDate", e.target.value)} /></Field>
              : <Field label="For invoice" hint="optional"><input value={s.invoiceNumber} onChange={(e) => set("invoiceNumber", e.target.value)} placeholder="INV-0001" /></Field>}
          </div>
        </fieldset>

        <fieldset className="adm-card">
          <legend><span className="dc-leg-ic"><Building2 size={16} /></span>{isInvoice ? "Bill to" : "Received from"}</legend>
          <div className="dc-grid-2">
            <Field label="Business name"><input value={s.billTo.name} onChange={(e) => setBill({ name: e.target.value })} placeholder="Company or person" /></Field>
            <Field label="Attention" hint="optional"><input value={s.billTo.attn} onChange={(e) => setBill({ attn: e.target.value })} placeholder="Contact person" /></Field>
            <Field label="Address" hint="one line per row"><textarea rows={3} value={s.billTo.address} onChange={(e) => setBill({ address: e.target.value })} /></Field>
            <Field label="Phone" hint="optional"><input value={s.billTo.phone} onChange={(e) => setBill({ phone: e.target.value })} /></Field>
          </div>
        </fieldset>

        <fieldset className="adm-card">
          <legend><span className="dc-leg-ic"><ListOrdered size={16} /></span>Lines</legend>
          <select className="dc-select" aria-label="Add from the price list" value="" onChange={(e) => addPreset(e.target.value)}>
            <option value="">Add from the price list...</option>
            {PRICE_PRESETS.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map((i) => <option key={i.label} value={`${g.group}|${i.label}`}>{i.label} · {formatRM(i.price)}</option>)}
              </optgroup>
            ))}
          </select>
          {s.items.map((it, i) => (
            <div key={i} className="dc-line">
              <div className="dc-line-top">
                <input aria-label={`Line ${i + 1} description`} value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} placeholder="Description" />
                <button type="button" className="adm-icon-btn" aria-label={`Remove line ${i + 1}`} disabled={s.items.length === 1} onClick={() => setS((p) => ({ ...p, items: p.items.filter((_, n) => n !== i) }))}><Trash2 size={16} /></button>
              </div>
              <div className="dc-line-nums">
                <Field label="Price (RM)" hint="minus for a credit"><input type="number" step="0.01" value={it.price} onChange={(e) => setItem(i, { price: Number(e.target.value) })} /></Field>
                <Field label="Qty"><input type="number" min={1} value={it.qty} onChange={(e) => setItem(i, { qty: Number(e.target.value) })} /></Field>
                <span className="dc-line-total">{formatRM(lineTotal(it))}</span>
              </div>
              {isInvoice && <Field label="Small note" hint="optional, under the description"><input value={it.note} onChange={(e) => setItem(i, { note: e.target.value })} /></Field>}
            </div>
          ))}
          {s.items.length < 12 && <button type="button" className="adm-btn dc-add" onClick={() => setS((p) => ({ ...p, items: [...p.items, blankLine()] }))}><Plus size={15} /> Add line</button>}
          <dl className="dc-sum">
            <div><dt>Subtotal</dt><dd>{formatRM(t.subtotal)}</dd></div>
            {t.credits > 0 && <div><dt>Credits</dt><dd>{formatRM(-t.credits)}</dd></div>}
            <div className="is-total"><dt>{isInvoice ? "Amount due" : "Total paid"}</dt><dd>{formatRM(t.total)}</dd></div>
          </dl>
          <p className="adm-muted">No tax is added.</p>
        </fieldset>

        <fieldset className="adm-card">
          <legend><span className="dc-leg-ic"><CreditCard size={16} /></span>{isInvoice ? "Payment details" : "Payment"}</legend>
          {isInvoice ? (
            <div className="dc-grid-2">
              <Field label="Bank"><input value={s.bank.bank} onChange={(e) => set("bank", { ...s.bank, bank: e.target.value })} /></Field>
              <Field label="Account name"><input value={s.bank.accountName} onChange={(e) => set("bank", { ...s.bank, accountName: e.target.value })} /></Field>
              <Field label="Account number"><input value={s.bank.accountNo} onChange={(e) => set("bank", { ...s.bank, accountNo: e.target.value })} /></Field>
              <Field label="DuitNow" hint="optional"><input value={s.bank.duitnow} onChange={(e) => set("bank", { ...s.bank, duitnow: e.target.value })} /></Field>
            </div>
          ) : (
            <div className="dc-grid-2">
              <Field label="Paid by"><input value={s.method} onChange={(e) => set("method", e.target.value)} placeholder="Bank transfer, DuitNow, cash" /></Field>
              <Field label="Reference" hint="optional"><input value={s.reference} onChange={(e) => set("reference", e.target.value)} /></Field>
            </div>
          )}
          <Field label={isInvoice ? "Good to know" : "Note"} hint="shown on the PDF"><textarea rows={3} value={s.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
          {isInvoice && !s.bank.accountNo && <p className="adm-hint">Tip: enter your bank details once in Admin, Settings, and every new invoice fills them in.</p>}
        </fieldset>

        <div className="dc-save">
          <button type="button" className="adm-btn adm-btn-primary" onClick={save} disabled={saving || !!previewError}>
            {saving ? <Loader2 size={16} className="adm-spin" /> : <Download size={16} />} {docId ? "Save changes and open PDF" : "Save and open PDF"}
          </button>
          <button type="button" className="adm-btn adm-btn-ghost" onClick={() => router.push("/documents/billing")}>Cancel</button>
          {error && <span className="adm-error" role="alert">{error}</span>}
        </div>
      </div>
      <div className="dc-side"><PdfPreview payload={payload} onError={setPreviewError} /></div>
    </div>
  );
}
