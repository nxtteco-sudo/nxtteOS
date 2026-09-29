"use client";

// Case study editor for /work. Same save / publish model as the Insights
// editor. Publishing is blocked server-side until the case has a result.
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Loader2, Plus, Sparkles, Trash2, X } from "lucide-react";
import { deleteCaseStudy, saveCaseStudy } from "@/app/admin/work-actions";
import { PostBody } from "@/components/insights/post-body";
import { ImageUpload } from "./image-upload";
import { slugify } from "./insight-editor";
import { CASE_TYPE_LABEL, type CaseMetric, type CaseStudy, type CaseType } from "@/types/work";

type Draft = {
  headline: string; slug: string; clientName: string; clientType: string; caseType: CaseType;
  resultValue: string; resultLabel: string; resultPeriod: string;
  situation: string; whatWeDid: string; whatChanged: string;
  metrics: CaseMetric[]; services: string[]; testimonialQuote: string; testimonialAuthor: string;
  coverImageUrl: string | null; coverAlt: string; sortOrder: number;
};
type Toast = { kind: "ok" | "error"; text: string } | null;

const STORY_FIELDS = [
  { key: "situation", n: "01", title: "The situation", hint: "Where was the business before? What was not working?" },
  { key: "whatWeDid", n: "02", title: "What we did", hint: "The content, pages or systems nxtte put in place." },
  { key: "whatChanged", n: "03", title: "What changed", hint: "The result in plain words. Repeat the number and when it was measured." },
] as const;

export function CaseEditor({ c }: { c: CaseStudy | null }) {
  const router = useRouter();
  const initial: Draft = {
    headline: c?.headline ?? "", slug: c?.slug ?? "", clientName: c?.client_name ?? "", clientType: c?.client_type ?? "",
    caseType: c?.case_type ?? "client", resultValue: c?.result_value ?? "", resultLabel: c?.result_label ?? "", resultPeriod: c?.result_period ?? "",
    situation: c?.situation ?? "", whatWeDid: c?.what_we_did ?? "", whatChanged: c?.what_changed ?? "",
    metrics: c?.metrics ?? [], services: c?.services ?? [], testimonialQuote: c?.testimonial_quote ?? "", testimonialAuthor: c?.testimonial_author ?? "",
    coverImageUrl: c?.cover_image_url ?? null, coverAlt: c?.cover_alt ?? "", sortOrder: c?.sort_order ?? 100,
  };
  const [d, setD] = useState<Draft>(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [status, setStatus] = useState<"draft" | "published">(c?.status ?? "draft");
  const [slugTouched, setSlugTouched] = useState(Boolean(c));
  const [serviceInput, setServiceInput] = useState("");
  const [pending, start] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const dirty = JSON.stringify(d) !== saved;
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function save(nextStatus: "draft" | "published") {
    start(async () => {
      const res = await saveCaseStudy({ id: c?.id, ...d, status: nextStatus });
      if (!res.ok) return setToast({ kind: "error", text: res.error });
      const wasLive = status === "published";
      setStatus(nextStatus);
      setSaved(JSON.stringify(d));
      setToast({ kind: "ok", text: nextStatus === "published" ? (wasLive ? "Case study updated" : "Published. It is live now.") : wasLive ? "Unpublished. It is a draft again." : "Draft saved" });
      if (!c) router.replace(`/admin/work/${res.id}`);
      else router.refresh();
    });
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); save(status); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function addService() {
    const v = serviceInput.trim();
    if (!v || d.services.includes(v) || d.services.length >= 8) return;
    set("services", [...d.services, v]);
    setServiceInput("");
  }
  const setMetric = (i: number, k: keyof CaseMetric, v: string) => set("metrics", d.metrics.map((m, j) => (j === i ? { ...m, [k]: v } : m)));

  return (
    <div className="adm-editor">
      <div className="adm-bar">
        <Link href="/admin/work" className="adm-icon-btn" aria-label="Back to case studies"><ArrowLeft size={18} /></Link>
        <span className={`adm-pill ${status === "published" ? "is-live" : ""}`}>{status === "published" ? "Published" : "Draft"}</span>
        <span className="adm-muted">{dirty ? "Unsaved changes" : "All changes saved"}</span>
        <div className="adm-bar-actions">
          {c && status === "published" && <a href={`/work/${c.slug}`} target="_blank" rel="noreferrer" className="adm-btn adm-btn-ghost"><Eye size={16} /> View live</a>}
          {status === "published" ? (
            <>
              <button type="button" className="adm-btn" onClick={() => save("draft")} disabled={pending}>Unpublish</button>
              <button type="button" className="adm-btn adm-btn-primary" onClick={() => save("published")} disabled={pending || !dirty}>{pending && <Loader2 size={16} className="adm-spin" />} Update</button>
            </>
          ) : (
            <>
              <button type="button" className="adm-btn" onClick={() => save("draft")} disabled={pending}>{pending && <Loader2 size={16} className="adm-spin" />} Save draft</button>
              <button type="button" className="adm-btn adm-btn-primary" onClick={() => save("published")} disabled={pending}>Publish</button>
            </>
          )}
        </div>
      </div>

      {toast && <p className={`adm-toast ${toast.kind === "error" ? "is-error" : ""}`} role={toast.kind === "error" ? "alert" : "status"}>{toast.text}</p>}

      <div className="adm-editor-grid">
        <div className="adm-editor-fields">
          <input className="adm-title" value={d.headline} maxLength={160} aria-label="Headline" placeholder="Headline, for example: How a PJ café filled its weekday slots"
            onChange={(e) => { set("headline", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} />
          <label className="adm-field">
            <span>URL <em>nxtte.com/work/{d.slug || "your-case"}</em></span>
            <input value={d.slug} className="adm-mono" placeholder="your-case-url" onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
          </label>

          <fieldset className="adm-card adm-card-result">
            <legend>The result <em>required to publish</em></legend>
            <div className="adm-grid-3">
              <label className="adm-field"><span>Number</span><input value={d.resultValue} maxLength={20} placeholder="+38%" onChange={(e) => set("resultValue", e.target.value)} /></label>
              <label className="adm-field"><span>What it measures</span><input value={d.resultLabel} maxLength={80} placeholder="more profile visits" onChange={(e) => set("resultLabel", e.target.value)} /></label>
              <label className="adm-field"><span>When or over what period</span><input value={d.resultPeriod} maxLength={60} placeholder="in the first 30 days" onChange={(e) => set("resultPeriod", e.target.value)} /></label>
            </div>
            <p className="adm-hint">Use a real, checkable number. The spec: one real number outperforms ten mockups.</p>
          </fieldset>

          <fieldset className="adm-card">
            <legend>The client</legend>
            <div className="adm-seg" role="radiogroup" aria-label="Type of case">
              {(Object.keys(CASE_TYPE_LABEL) as CaseType[]).map((t) => (
                <button key={t} type="button" role="radio" aria-checked={d.caseType === t} className={d.caseType === t ? "is-on" : ""} onClick={() => set("caseType", t)}>{CASE_TYPE_LABEL[t]}</button>
              ))}
            </div>
            <div className="adm-grid-2">
              <label className="adm-field"><span>Client type <em>shown on the tile</em></span><input value={d.clientType} maxLength={100} placeholder="Café, Petaling Jaya" onChange={(e) => set("clientType", e.target.value)} /></label>
              <label className="adm-field"><span>Client name <em>optional, with permission</em></span><input value={d.clientName} maxLength={100} onChange={(e) => set("clientName", e.target.value)} /></label>
            </div>
            <label className="adm-field adm-narrow"><span>Order on the page <em>lower shows first</em></span><input type="number" min={0} max={999} value={d.sortOrder} onChange={(e) => set("sortOrder", Math.max(0, Math.min(999, Number(e.target.value) || 0)))} /></label>
          </fieldset>

          <div className="adm-field">
            <span>Cover image</span>
            <ImageUpload folder="work" value={d.coverImageUrl} onChange={(u) => set("coverImageUrl", u)} onError={(text) => setToast({ kind: "error", text })} />
          </div>
          {d.coverImageUrl && (
            <label className="adm-field"><span>Describe the cover image <em>for screen readers</em></span><input value={d.coverAlt} maxLength={200} onChange={(e) => set("coverAlt", e.target.value)} /></label>
          )}

          {STORY_FIELDS.map((f) => (
            <label key={f.key} className="adm-field adm-story">
              <span><b className="adm-story-n">{f.n}</b> {f.title} <em>{f.hint}</em></span>
              <textarea rows={5} value={d[f.key]} onChange={(e) => set(f.key, e.target.value)} placeholder="Markdown works here: **bold**, lists with -, links." />
            </label>
          ))}

          <fieldset className="adm-card">
            <legend>Supporting numbers <em>optional, up to 3</em></legend>
            {d.metrics.map((m, i) => (
              <div key={i} className="adm-metric">
                <input aria-label={`Number ${i + 1}`} value={m.value} maxLength={20} placeholder="4.6x" onChange={(e) => setMetric(i, "value", e.target.value)} />
                <input aria-label={`What number ${i + 1} measures`} value={m.label} maxLength={80} placeholder="more saves on campaign posts" onChange={(e) => setMetric(i, "label", e.target.value)} />
                <button type="button" className="adm-icon-btn" aria-label={`Remove number ${i + 1}`} onClick={() => set("metrics", d.metrics.filter((_, j) => j !== i))}><X size={16} /></button>
              </div>
            ))}
            {d.metrics.length < 3 && <button type="button" className="adm-btn adm-btn-ghost" onClick={() => set("metrics", [...d.metrics, { value: "", label: "" }])}><Plus size={15} /> Add a number</button>}
          </fieldset>

          <fieldset className="adm-card">
            <legend>What we used <em>packages or menu items</em></legend>
            {d.services.length > 0 && (
              <ul className="adm-chips">
                {d.services.map((s) => <li key={s}>{s}<button type="button" aria-label={`Remove ${s}`} onClick={() => set("services", d.services.filter((x) => x !== s))}><X size={13} /></button></li>)}
              </ul>
            )}
            <div className="adm-inline">
              <input aria-label="Add a service" value={serviceInput} maxLength={40} placeholder="Growth package" onChange={(e) => setServiceInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addService(); } }} />
              <button type="button" className="adm-btn" onClick={addService}>Add</button>
            </div>
          </fieldset>

          <fieldset className="adm-card">
            <legend>Client quote <em>optional, only with their permission</em></legend>
            <label className="adm-field"><span>Quote</span><textarea rows={3} maxLength={400} value={d.testimonialQuote} onChange={(e) => set("testimonialQuote", e.target.value)} /></label>
            <label className="adm-field"><span>Who said it</span><input value={d.testimonialAuthor} maxLength={100} placeholder="Name, role" onChange={(e) => set("testimonialAuthor", e.target.value)} /></label>
          </fieldset>

          {c && (
            <div className="adm-danger">
              <span>Delete this case study permanently</span>
              {confirmDelete ? (
                <span className="adm-danger-actions">
                  <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
                  <button type="button" className="adm-btn adm-btn-danger" disabled={pending} onClick={() => start(async () => {
                    const res = await deleteCaseStudy(c.id);
                    if (!res.ok) return setToast({ kind: "error", text: res.error });
                    router.replace("/admin/work");
                  })}>Delete for good</button>
                </span>
              ) : (
                <button type="button" className="adm-btn adm-btn-danger" onClick={() => setConfirmDelete(true)}><Trash2 size={15} /> Delete</button>
              )}
            </div>
          )}
        </div>

        <div className="adm-wide-preview">
          <p className="adm-label">Tile preview</p>
          <div className="adm-preview-scroll">
            <div className="adm-case-tile">
              <div className="adm-case-cover">
                {d.coverImageUrl
                  // eslint-disable-next-line @next/next/no-img-element -- preview only
                  ? <img src={d.coverImageUrl} alt="" />
                  : <Sparkles size={26} aria-hidden="true" />}
                <span className="adm-case-result"><b>{d.resultValue || "+0%"}</b><span>{d.resultLabel || "what it measures"}<small>{d.resultPeriod || "when"}</small></span></span>
              </div>
              <div className="adm-case-text">
                <span className="adm-case-meta"><i className={`wk-badge wk-badge-${d.caseType}`}>{CASE_TYPE_LABEL[d.caseType]}</i>{d.clientType || "Client type"}</span>
                <strong>{d.headline || "Your headline"}</strong>
              </div>
            </div>
            <div className="adm-preview adm-case-story">
              {STORY_FIELDS.map((f) => (
                <section key={f.key}>
                  <h3><b>{f.n}</b> {f.title}</h3>
                  {d[f.key].trim() ? <PostBody markdown={d[f.key]} /> : <p className="adm-muted">{f.hint}</p>}
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
