"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

/** Shows the real PDF for the form as it stands (after a short pause in typing). */
export function PdfPreview({ payload, onError }: { payload: string; onError?: (e: string | null) => void }) {
  const [state, setState] = useState<{ url: string | null; error: string | null; busy: boolean }>({ url: null, error: null, busy: true });
  const urlRef = useRef<string | null>(null);
  const report = useRef(onError);
  useEffect(() => { report.current = onError; });

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        setState((p) => ({ ...p, busy: true }));
        const res = await fetch("/api/documents/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, signal: ctrl.signal });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          const error = j.error ?? "The preview could not be built.";
          setState((p) => ({ ...p, error, busy: false }));
          report.current?.(error);
          return;
        }
        const url = URL.createObjectURL(await res.blob());
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        setState({ url, error: null, busy: false });
        report.current?.(null);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setState((p) => ({ ...p, error: "The preview could not be built.", busy: false }));
        report.current?.("The preview could not be built.");
      }
    }, 700);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [payload]);

  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

  return (
    <section className="dc-preview" aria-label="Live PDF preview">
      <header><span><i className="dc-live-dot" aria-hidden="true" /> Live preview</span>{state.busy && <Loader2 size={15} className="adm-spin" aria-label="Updating" />}</header>
      {state.error
        ? (
          <div className="dc-preview-wait" role="status">
            <div className="dc-ghost" aria-hidden="true"><i /><b /><b /><b /><span /><b /><b /></div>
            <p><strong>Almost there.</strong> {state.error}</p>
          </div>
        )
        : state.url
          ? <iframe title="PDF preview" src={`${state.url}#toolbar=0&navpanes=0&view=FitH`} />
          : <div className="dc-preview-blank" />}
    </section>
  );
}
