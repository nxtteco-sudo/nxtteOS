"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowDown, ArrowUp, Download, HelpCircle, LayoutTemplate, Loader2, Package, Plus, RotateCcw, Trash2 } from "lucide-react";
import { saveDocument } from "@/app/documents/actions";
import { SYNTAX_HELP, defaultSections, proposalIssues, type ProposalSection } from "@/lib/documents/proposal";
import { TEMPLATE_PACKAGES } from "@/lib/documents/presets";
import { AUDIT_PRICE } from "@/lib/pricing";
import { PdfPreview } from "./pdf-preview";

export type ProposalState = {
  ref: string;
  date: string;
  validUntil: string;
  title: string;
  clientName: string;
  pkg: string;
  auditCredit: boolean;
  sections: ProposalSection[];
};

const toData = (s: ProposalState) => ({ ref: s.ref, date: s.date, validUntil: s.validUntil, title: s.title, clientName: s.clientName, sections: s.sections });

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="adm-field"><span>{label}{hint && <em>{hint}</em>}</span>{children}</label>;
}

export function ProposalEditor({ initial, docId }: { initial: ProposalState; docId?: string }) {
  const router = useRouter();
  const [s, setS] = useState<ProposalState>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [help, setHelp] = useState(false);
  const patch = (p: Partial<ProposalState>) => setS((prev) => ({ ...prev, ...p }));
  const setSection = (i: number, p: Partial<ProposalSection>) => setS((prev) => ({ ...prev, sections: prev.sections.map((x, n) => (n === i ? { ...x, ...p } : x)) }));
  const move = (i: number, d: -1 | 1) =>
    setS((prev) => {
      const j = i + d;
      if (j < 0 || j >= prev.sections.length) return prev;
      const next = [...prev.sections];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...prev, sections: next };
    });

  const fillTemplate = (pkgName: string, credit: boolean) => {
    const pkg = TEMPLATE_PACKAGES.find((p) => p.name === pkgName) ?? TEMPLATE_PACKAGES[1];
    patch({ pkg: pkg.name, auditCredit: credit, sections: defaultSections(pkg, credit ? AUDIT_PRICE : 0) });
  };
  const confirmFill = (pkgName: string, credit: boolean) => {
    if (!window.confirm("Replace every section with a fresh template? Your edits to the sections will be lost.")) return;
    fillTemplate(pkgName, credit);
  };

  const payload = useMemo(() => JSON.stringify({ kind: "proposal", data: toData(s) }), [s]);
  const issues = useMemo(() => proposalIssues(s.sections, s.clientName), [s.sections, s.clientName]);

  const save = async () => {
    if (issues.length && !window.confirm(`This proposal still needs attention:\n\n${issues.map((m) => `- ${m}`).join("\n")}\n\nSave it anyway?`)) return;
    setSaving(true);
    setError(null);
    const res = await saveDocument({ kind: "proposal", data: toData(s), sourceId: null, id: docId });
    setSaving(false);
    if (!res.ok) return setError(res.error);
    window.open(`/api/documents/${res.id}/pdf`, "_blank", "noopener");
    router.push("/documents/proposals");
    router.refresh();
  };

  return (
    <div className="dc-editor">
      <div className="dc-form">
        <fieldset className="adm-card">
          <legend><span className="dc-leg-ic"><LayoutTemplate size={16} /></span>Cover</legend>
          <Field label="Prepared for" hint="{{client}} in the text becomes this name"><input value={s.clientName} onChange={(e) => patch({ clientName: e.target.value })} placeholder="Business name" /></Field>
          <Field label="Cover title" hint="a line break makes a second line"><textarea rows={2} value={s.title} onChange={(e) => patch({ title: e.target.value })} /></Field>
          <div className="dc-grid-3">
            <Field label="Reference"><input value={s.ref} onChange={(e) => patch({ ref: e.target.value })} /></Field>
            <Field label="Date"><input type="date" value={s.date} onChange={(e) => patch({ date: e.target.value })} /></Field>
            <Field label="Valid until"><input type="date" value={s.validUntil} onChange={(e) => patch({ validUntil: e.target.value })} /></Field>
          </div>
        </fieldset>

        <fieldset className="adm-card">
          <legend><span className="dc-leg-ic"><Package size={16} /></span>Start from a package</legend>
          <div className="adm-seg" role="group" aria-label="Package">
            {TEMPLATE_PACKAGES.map((p) => (
              <button key={p.name} type="button" className={s.pkg === p.name ? "is-on" : ""} aria-pressed={s.pkg === p.name} onClick={() => patch({ pkg: p.name })}>{p.name}</button>
            ))}
          </div>
          <label className="dc-check"><input type="checkbox" checked={s.auditCredit} onChange={(e) => patch({ auditCredit: e.target.checked })} /> Include the RM {AUDIT_PRICE} audit credit</label>
          <button type="button" className="adm-btn" onClick={() => confirmFill(s.pkg, s.auditCredit)}><RotateCcw size={15} /> Fill the sections for {s.pkg}</button>
        </fieldset>

        <div className="dc-sections-head">
          <h2 className="dc-h">Sections</h2>
          <button type="button" className="adm-btn adm-btn-ghost" aria-expanded={help} onClick={() => setHelp((v) => !v)}><HelpCircle size={15} /> How to write</button>
        </div>
        {help && <pre className="dc-help">{SYNTAX_HELP}</pre>}

        {s.sections.map((sec, i) => (
          <fieldset key={i} className="adm-card dc-section">
            <legend className="adm-sr">Section {i + 1}</legend>
            <div className="dc-section-top">
              <b className="dc-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</b>
              <input aria-label={`Section ${i + 1} heading`} value={sec.title} onChange={(e) => setSection(i, { title: e.target.value })} placeholder="Section heading" />
              <button type="button" className="adm-icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={16} /></button>
              <button type="button" className="adm-icon-btn" aria-label="Move down" disabled={i === s.sections.length - 1} onClick={() => move(i, 1)}><ArrowDown size={16} /></button>
              <button type="button" className="adm-icon-btn" aria-label="Delete section" disabled={s.sections.length === 1} onClick={() => setS((p) => ({ ...p, sections: p.sections.filter((_, n) => n !== i) }))}><Trash2 size={16} /></button>
            </div>
            <textarea aria-label={`Section ${i + 1} text`} className="dc-mono" rows={Math.min(16, Math.max(4, sec.body.split("\n").length + 1))} value={sec.body} onChange={(e) => setSection(i, { body: e.target.value })} />
            <label className="dc-check"><input type="checkbox" checked={sec.pageBreak} onChange={(e) => setSection(i, { pageBreak: e.target.checked })} /> Start on a new page</label>
          </fieldset>
        ))}
        {s.sections.length < 30 && <button type="button" className="adm-btn dc-add" onClick={() => setS((p) => ({ ...p, sections: [...p.sections, { title: "", body: "", pageBreak: false }] }))}><Plus size={15} /> Add section</button>}

        {issues.length > 0 && (
          <div className="dc-issues" role="status">
            <p><AlertTriangle size={16} aria-hidden="true" /> Before you send this</p>
            <ul>{issues.map((m) => <li key={m}>{m}</li>)}</ul>
          </div>
        )}

        <div className="dc-save">
          <button type="button" className="adm-btn adm-btn-primary" onClick={save} disabled={saving || !!previewError}>
            {saving ? <Loader2 size={16} className="adm-spin" /> : <Download size={16} />} {docId ? "Save changes and open PDF" : "Save and open PDF"}
          </button>
          <button type="button" className="adm-btn adm-btn-ghost" onClick={() => router.push("/documents/proposals")}>Cancel</button>
          {error && <span className="adm-error" role="alert">{error}</span>}
        </div>
      </div>
      <div className="dc-side"><PdfPreview payload={payload} onError={setPreviewError} /></div>
    </div>
  );
}
