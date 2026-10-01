"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { deleteExpense, saveExpense } from "@/app/accounts/actions";
import { EXPENSE_CATEGORIES, type Expense } from "@/lib/accounts/model";
import { monthLabel, rm, shortDate } from "./kit";
import { Modal } from "./modal";

const PAGE = 100;

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="adm-field"><span>{label}{hint && <em>{hint}</em>}</span>{children}</label>;
}

export function ExpensesBoard({ expenses, today, startOpen, startCategory }: { expenses: Expense[]; today: string; startOpen: boolean; startCategory: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const blank = { id: undefined as string | undefined, date: today, category: EXPENSE_CATEGORIES[0] as string, vendor: "", amount: "", notes: "" };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(startOpen);
  const [month, setMonth] = useState("all");
  const [category, setCategory] = useState(startCategory);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const months = useMemo(() => [...new Set(expenses.map((e) => e.expense_date.slice(0, 7)))].sort().reverse(), [expenses]);
  const categories = useMemo(() => [...new Set([...EXPENSE_CATEGORIES, ...expenses.map((e) => e.category)])], [expenses]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses.filter((e) => (month === "all" || e.expense_date.startsWith(month)) && (!category || e.category === category) && (!q || `${e.vendor} ${e.category} ${e.notes}`.toLowerCase().includes(q)));
  }, [expenses, month, category, query]);
  const total = shown.reduce((s, e) => s + e.amount, 0);
  const filtered = month !== "all" || !!category || !!query.trim();

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
          <h2 className="dc-h">{category || "Every ringgit out"} <em>{shown.length} · {rm(total)}</em></h2>
          <button type="button" className="adm-btn adm-btn-primary" onClick={() => { setForm(blank); setEditing(true); }}><Plus size={16} /> Add expense</button>
        </header>
        <div className="ac-filters">
          <label className="ac-select"><span className="adm-sr">Month</span><select value={month} onChange={(e) => { setMonth(e.target.value); setLimit(PAGE); }}><option value="all">All months</option>{months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}</select></label>
          <label className="ac-select"><span className="adm-sr">Category</span><select value={category} onChange={(e) => { setCategory(e.target.value); setLimit(PAGE); }}><option value="">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
          {filtered && <button type="button" className="adm-btn adm-btn-ghost" onClick={() => { setMonth("all"); setCategory(""); setQuery(""); setLimit(PAGE); }}><X size={15} /> Clear</button>}
          <label className="ac-search"><Search size={15} aria-hidden="true" /><span className="adm-sr">Search</span><input value={query} onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }} placeholder="Search who, category, note" /></label>
        </div>
        {note && <p className={note.ok ? "crm-ok" : "adm-error"} role={note.ok ? "status" : "alert"}>{note.text}</p>}
        {shown.length === 0 ? <p className="dc-calm">{expenses.length ? "No expenses match." : "No expenses yet. Add your first one, for example your Canva or CapCut subscription."}</p> : (
          <div className="dc-table-wrap">
            <table className="dc-table">
              <thead><tr><th>Date</th><th>Paid to</th><th>Category</th><th className="is-num">Amount</th><th><span className="adm-sr">Actions</span></th></tr></thead>
              <tbody>
                {shown.slice(0, limit).map((e) => (
                  <tr key={e.id}>
                    <td>{shortDate(e.expense_date)}</td>
                    <td><strong>{e.vendor || "-"}</strong>{e.notes && <small className="ac-sub">{e.notes}</small>}</td>
                    <td><button type="button" className="ac-chip" onClick={() => { setCategory(e.category); setLimit(PAGE); }}>{e.category}</button></td>
                    <td className="is-num">{rm(-e.amount)}</td>
                    <td>
                      <div className="dc-actions">
                        <button type="button" className="adm-icon-btn" aria-label={`Edit expense: ${e.vendor || e.category}`} onClick={() => { setForm({ id: e.id, date: e.expense_date, category: e.category, vendor: e.vendor, amount: String(e.amount), notes: e.notes }); setEditing(true); }}><Pencil size={15} /></button>
                        <button type="button" className="adm-icon-btn" aria-label={`Delete expense: ${e.vendor || e.category}`} disabled={pending} onClick={() => window.confirm("Delete this expense?") && run(() => deleteExpense(e.id), "Expense deleted")}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="ac-total"><td colSpan={3}>Total{filtered ? " (filtered)" : ""} · {shown.length} expense{shown.length === 1 ? "" : "s"}</td><td className="is-num">{rm(-total)}</td><td /></tr>
              </tbody>
            </table>
          </div>
        )}
        {shown.length > limit && <button type="button" className="adm-btn adm-btn-ghost ac-more" onClick={() => setLimit((l) => l + PAGE * 2)}>Show more ({shown.length - limit} left)</button>}
      </section>

      <Modal
        open={editing}
        title={form.id ? "Edit expense" : "Add expense"}
        onClose={() => setEditing(false)}
        footer={<><button type="button" className="adm-btn adm-btn-ghost" onClick={() => setEditing(false)}>Cancel</button><button type="button" className="adm-btn adm-btn-primary" disabled={pending} onClick={() => run(() => saveExpense({ ...form, amount: Number(form.amount) }), form.id ? "Expense updated" : "Expense saved", () => { setForm(blank); setEditing(false); })}>{pending && <Loader2 size={15} className="adm-spin" />} {form.id ? "Save changes" : "Save expense"}</button></>}
      >
        <div className="dc-grid-2">
          <Field label="Date"><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Amount (RM)"><input type="number" min={0} step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
          <Field label="Category"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Paid to" hint="who you paid"><input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="for example: Canva, a freelance editor" /></Field>
        </div>
        <Field label="Notes" hint="optional"><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </Modal>
    </>
  );
}
