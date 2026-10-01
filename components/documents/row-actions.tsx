"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ban, FileDown, Pencil, Receipt, Undo2 } from "lucide-react";
import { setDocumentVoid } from "@/app/documents/actions";

export function RowActions({ id, kind, isVoid }: { id: string; kind: string; isVoid: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const toggle = () => {
    if (!isVoid && !window.confirm("Void this document? It stays in the list, marked void, and no longer counts in the totals.")) return;
    start(async () => {
      const r = await setDocumentVoid(id, !isVoid);
      if (!r.ok) return setError(r.error);
      router.refresh();
    });
  };
  return (
    <div className="dc-actions">
      <a className="adm-btn adm-btn-ghost" href={`/api/documents/${id}/pdf`} target="_blank" rel="noreferrer"><FileDown size={15} /> PDF</a>
      {!isVoid && <Link className="adm-btn adm-btn-ghost" href={kind === "proposal" ? `/documents/proposals/${id}/edit` : `/documents/billing/${id}/edit`}><Pencil size={15} /> Edit</Link>}
      {kind === "invoice" && !isVoid && <Link className="adm-btn adm-btn-ghost dc-accent" href={`/documents/billing/new?kind=receipt&from=${id}`}><Receipt size={15} /> Receipt</Link>}
      <button type="button" className="adm-btn adm-btn-ghost" onClick={toggle} disabled={pending} aria-label={isVoid ? "Restore" : "Void"} title={isVoid ? "Restore" : "Void"}>{isVoid ? <Undo2 size={15} /> : <Ban size={15} />}</button>
      {error && <span className="adm-error" role="alert">{error}</span>}
    </div>
  );
}
