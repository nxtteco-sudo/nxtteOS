"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronDown, FileText, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { addIncome, deleteIncome, deletePayment, recordPayment } from "@/app/accounts/actions";
import { PAYMENT_METHODS, groupPayments, incomeBalance, type Income, type Payment } from "@/lib/accounts/model";
import { rm, shortDate } from "./kit";
import { Modal } from "./modal";

type Filter = "all" | "owed" | "paid";
const STATE = { paid: { label: "Paid", cls: "is-live" }, partial: { label: "Part paid", cls: "is-wait" }, owed: { label: "Owed", cls: "is-hot" } } as const;

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="adm-field"><span>{label}{hint && <em>{hint}</em>}</span>{children}</label>;
}

export function IncomeBoard({ incomes, payments, today, startOpen }: { incomes: Income[]; payments: Payment[]; today: string; startOpen: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(startOpen);
  const [open, setOpen] = useState<string | null>(null);
  const blank = { date: today, clientName: "", project: "", description: "", amount: "", receivedNow: true, paidOn: today, method: "Bank transfer", reference: "", notes: "" };
  const [form, setForm] = useState(blank);
  const [pay, setPay] = useState({ amount: "", paidOn: today, method: "Bank transfer", reference: "" });

  const byIncome = useMemo(() => groupPayments(payments), [payments]);
  const clientNames = useMemo(() => [...new Set(incomes.map((i) => i.client_name))].sort(), [incomes]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return incomes
      .map((income) => ({ income, pays: byIncome.get(income.id) ?? [], ...incomeBalance(income, byIncome.get(income.id) ?? []) }))
      .filter((r) => (filter === "all" ? true : filter === "paid" ? r.state === "paid" : r.state !== "paid"))
      .filter((r) => !q || `${r.income.client_name} ${r.income.description} ${r.income.project} ${r.income.notes}`.toLowerCase().includes(q))
      .sort((a, b) => b.income.income_date.localeCompare(a.income.income_date));
  }, [incomes, byIncome, filter, query]);
  const totals = rows.reduce((t, r) => ({ amount: t.amount + r.income.amount, paid: t.paid + r.paid, balance: t.balance + r.balance }), { amount: 0, paid: 0, balance: 0 });

  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, okText: string, after?: () => void) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) return setNote({ ok: false, text: r.error });
      setNote({ ok: true, text: okText });
      after?.();
      router.refresh();
    });

  return (
    <>
      <section className="ov-card ac-board">
        <header>
          <h2 className="dc-h">Every invoice and payment <em>{rows.length}</em></h2>
          <button type="button" className="adm-btn adm-btn-primary" onClick={() => { setForm(blank); setAdding(true); }}><Plus size={16} /> Add income</button>
        </header>
        <div className="ac-filters">
          <div className="adm-seg" role="group" aria-label="Show">
            {(["all", "owed", "paid"] as const).map((f) => <button key={f} type="button" aria-pressed={filter === f} className={filter === f ? "is-on" : ""} onClick={() => setFilter(f)}>{f === "all" ? "All" : f === "owed" ? "Still owed" : "Paid"}</button>)}
          </div>
          <label className="ac-search"><Search size={15} aria-hidden="true" /><span className="adm-sr">Search</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search client, invoice, note" /></label>
        </div>
        {note && <p className={note.ok ? "crm-ok" : "adm-error"} role={note.ok ? "status" : "alert"}>{note.text}</p>}
        {rows.length === 0 ? <p className="dc-calm">Nothing here yet. Invoices, receipts and paid audits from Documents appear on their own.</p> : (
          <div className="dc-table-wrap">
            <table className="dc-table">
              <thead><tr><th>Client</th><th>Date</th><th className="is-num">Invoiced</th><th className="is-num">Received</th><th className="is-num">Balance</th><th>Status</th><th><span className="adm-sr">Details</span></th></tr></thead>
              <tbody>
                {rows.map((r) => {
                  const isOpen = open === r.income.id;
                  return (
                    <Fragment key={r.income.id}>
                      <tr>
                        <td><strong>{r.income.client_name}</strong><small className="ac-sub">{r.income.document_id && <FileText size={12} aria-hidden="true" />}{[r.income.description, r.income.project].filter(Boolean).join(" · ") || "Income"}</small></td>
                        <td>{shortDate(r.income.income_date)}</td>
                        <td className="is-num">{rm(r.income.amount)}</td>
                        <td className="is-num ac-in">{rm(r.paid)}</td>
                        <td className="is-num">{r.balance > 0 ? rm(r.balance) : "-"}</td>
                        <td><span className={`adm-pill ${STATE[r.state].cls}`}>{STATE[r.state].label}</span></td>
                        <td><button type="button" className="adm-btn adm-btn-ghost ac-expand" aria-expanded={isOpen} onClick={() => { setOpen(isOpen ? null : r.income.id); setPay({ amount: String(r.balance), paidOn: today, method: "Bank transfer", reference: "" }); }}>{r.pays.length} payment{r.pays.length === 1 ? "" : "s"} <ChevronDown size={15} className={isOpen ? "is-open" : ""} /></button></td>
                      </tr>
                      {isOpen && (
                        <tr className="ac-detail">
                          <td colSpan={7}>
                            <p className="ac-detail-h">Payments received</p>
                            {r.pays.length === 0 ? <p className="adm-muted">None yet.</p> : (
                              <ul className="ac-pays">
                                {r.pays.map((p) => (
                                  <li key={p.id}>
                                    <span><CheckCircle2 size={15} aria-hidden="true" /> {rm(p.amount)} on {shortDate(p.paid_on)}<small> {[p.method, p.reference].filter(Boolean).join(" · ")}{p.receipt_id ? " · from a receipt" : ""}</small></span>
                                    {!p.receipt_id && <button type="button" className="adm-icon-btn" aria-label="Delete payment" disabled={pending} onClick={() => run(() => deletePayment(p.id), "Payment removed")}><Trash2 size={15} /></button>}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {r.income.notes && <p className="adm-muted">{r.income.notes}</p>}
                            {r.balance > 0 && (
                              <div className="ac-pay-form">
                                <Field label="Amount (RM)"><input type="number" min={0} step="0.01" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} /></Field>
                                <Field label="Received on"><input type="date" value={pay.paidOn} onChange={(e) => setPay({ ...pay, paidOn: e.target.value })} /></Field>
                                <Field label="Paid by"><select value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>{PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}</select></Field>
                                <Field label="Reference" hint="optional"><input value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} /></Field>
                                <button type="button" className="adm-btn adm-btn-primary" disabled={pending} onClick={() => run(() => recordPayment({ incomeId: r.income.id, amount: Number(pay.amount), paidOn: pay.paidOn, method: pay.method, reference: pay.reference }), "Payment recorded")}>{pending && <Loader2 size={15} className="adm-spin" />} Record payment</button>
                              </div>
                            )}
                            {!r.income.document_id && <button type="button" className="adm-btn adm-btn-ghost crm-del" disabled={pending} onClick={() => window.confirm("Delete this income and its payments?") && run(() => deleteIncome(r.income.id), "Income deleted", () => setOpen(null))}><Trash2 size={15} /> Delete entry</button>}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                <tr className="ac-total"><td colSpan={2}>Total</td><td className="is-num">{rm(totals.amount)}</td><td className="is-num ac-in">{rm(totals.paid)}</td><td className="is-num">{totals.balance > 0 ? rm(totals.balance) : "-"}</td><td colSpan={2} /></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={adding}
        title="Add income"
        description="For money that is not on a Documents invoice or receipt, such as a cash job."
        onClose={() => setAdding(false)}
        footer={<><button type="button" className="adm-btn adm-btn-ghost" onClick={() => setAdding(false)}>Cancel</button><button type="button" className="adm-btn adm-btn-primary" disabled={pending} onClick={() => run(() => addIncome({ ...form, amount: Number(form.amount) }), "Income saved", () => { setForm(blank); setAdding(false); })}>{pending && <Loader2 size={15} className="adm-spin" />} Save income</button></>}
      >
        <div className="dc-grid-2">
          <Field label="From"><input list="ac-clients" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="Client name" /></Field>
          <datalist id="ac-clients">{clientNames.map((c) => <option key={c} value={c} />)}</datalist>
          <Field label="Date"><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Amount (RM)"><input type="number" min={0} step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
          <Field label="Project" hint="optional"><input value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} placeholder="for example: Growth package, October" /></Field>
        </div>
        <Field label="What for" hint="optional"><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <label className="dc-check"><input type="checkbox" checked={form.receivedNow} onChange={(e) => setForm({ ...form, receivedNow: e.target.checked })} /> Already received</label>
        {form.receivedNow && (
          <div className="dc-grid-2">
            <Field label="Received on"><input type="date" value={form.paidOn} onChange={(e) => setForm({ ...form, paidOn: e.target.value })} /></Field>
            <Field label="Paid by"><select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>{PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}</select></Field>
            <Field label="Reference" hint="optional"><input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></Field>
          </div>
        )}
        <Field label="Notes" hint="optional"><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </Modal>
    </>
  );
}
