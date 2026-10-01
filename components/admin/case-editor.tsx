"use client";

// Case study editor for /work. Same save / publish model as the Insights
// editor. Publishing is blocked server-side until the case has a result.
import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Eye, ImagePlus, Loader2, Plus, Sparkles, Trash2, X } from "lucide-react";
import { deleteCaseStudy, saveCaseStudy } from "@/app/admin/work-actions";
import { PostBody } from "@/components/insights/post-body";
import { ImageUpload, uploadFile } from "./image-upload";
import { SERVICE_CATEGORIES, type ServiceCategory } from "@/lib/pricing";
import { slugify } from "./insight-editor";
import { CASE_TYPE_LABEL, type CaseMetric, type CaseStudy, type CaseType, type GalleryImage } from "@/types/work";
import { AnswersPanel, SearchSocialPanel, SeoScoreCard } from "./seo-panel";
import { parseFaqs, seoChecks, type Faq } from "@/lib/content-seo";

type Draft = {
  headline: string; slug: string; clientName: string; clientType: string; caseType: CaseType;
  resultValue: string; resultLabel: string; resultPeriod: string;
  situation: string; whatWeDid: string; whatChanged: string;
  metrics: CaseMetric[]; services: string[]; testimonialQuote: string; testimonialAuthor: string;
  coverImageUrl: string | null; coverAlt: string; sortOrder: number;
  category: ServiceCategory; gallery: GalleryImage[]; beforeImageUrl: string | null; afterImageUrl: string | null;
  seoTitle: string; metaDescription: string; focusKeyword: string; noindex: boolean; faqs: Faq[];
};
type Toast = { kind: "ok" | "error"; text: string } | null;
const ALL_SERVICES = new Set<string>(SERVICE_CATEGORIES.flatMap((c) => [...c.services]));

// Example results per service, so design and setup work is not forced into a
// sales metric. Placeholders only: the real number must be true and checkable.
const RESULT_EXAMPLES: Record<ServiceCategory, [string, string, string]> = {
  social: ["+38%", "more profile visits", "in the first 30 days"],
  content: ["12", "posts and 4 reels delivered", "every month"],
  growth: ["RM 17", "cost per enquiry", "over 30 days of ads"],
  brand: ["24 pages", "company profile redesigned", "in 7 working days"],
  start: ["5", "gaps found and fixed", "in 5 working days"],
};
const MAX_GALLERY = 8;

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
    category: c?.category ?? "social", gallery: c?.gallery ?? [], beforeImageUrl: c?.before_image_url ?? null, afterImageUrl: c?.after_image_url ?? null,
    seoTitle: c?.seo_title ?? "", metaDescription: c?.meta_description ?? "", focusKeyword: c?.focus_keyword ?? "", noindex: c?.noindex ?? false, faqs: parseFaqs(c?.faqs),
  };
  const [d, setD] = useState<Draft>(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [status, setStatus] = useState<"draft" | "published">(c?.status ?? "draft");
  const [slugTouched, setSlugTouched] = useState(Boolean(c));
  const [serviceInput, setServiceInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const dirty = JSON.stringify(d) !== saved;
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const resultLine = [d.resultValue, d.resultLabel, d.resultPeriod].filter(Boolean).join(" ") + (d.clientType ? `. ${d.clientType}.` : "");
  const checks = useMemo(() => seoChecks({ kind: "case", title: d.headline, seoTitle: d.seoTitle, metaDescription: d.metaDescription, fallbackDescription: resultLine, slug: d.slug, body: [d.situation, d.whatWeDid, d.whatChanged].join("\n\n"), focusKeyword: d.focusKeyword, coverImageUrl: d.coverImageUrl, coverAlt: d.coverAlt, faqs: d.faqs }), [d, resultLine]);

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
      const res = await saveCaseStudy({ id: c?.id, ...d, faqs: d.faqs.filter((f) => f.q.trim() && f.a.trim()), status: nextStatus });
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

  const toggleService = (name: string) => set("services", d.services.includes(name) ? d.services.filter((x) => x !== name) : d.services.length < 12 ? [...d.services, name] : d.services);
  function addService() {
    const v = serviceInput.trim();
    if (!v || d.services.includes(v) || d.services.length >= 12) return;
    set("services", [...d.services, v]);
    setServiceInput("");
  }
  async function addGallery(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    let next = d.gallery;
    for (const file of Array.from(files).slice(0, MAX_GALLERY - d.gallery.length)) {
      const res = await uploadFile(file, "work");
      if (!res.ok) { setToast({ kind: "error", text: res.error }); break; }
      next = [...next, { url: res.url, alt: "" }];
    }
    setUploading(false);
    setD((x) => ({ ...x, gallery: next }));
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

          <fieldset className="adm-card">
            <legend>Service <em>what kind of work this was</em></legend>
            <div className="adm-seg adm-seg-wrap" role="radiogroup" aria-label="Service category">
              {SERVICE_CATEGORIES.map((cat) => (
                <button key={cat.key} type="button" role="radio" aria-checked={d.category === cat.key} className={d.category === cat.key ? "is-on" : ""} onClick={() => set("category", cat.key)}>{cat.label}</button>
              ))}
            </div>
            <p className="adm-hint">Visitors can filter the Work page by this.</p>
          </fieldset>

          <fieldset className="adm-card adm-card-result">
            <legend>The result <em>required to publish</em></legend>
            <div className="adm-grid-3">
              <label className="adm-field"><span>Number</span><input value={d.resultValue} maxLength={20} placeholder={RESULT_EXAMPLES[d.category][0]} onChange={(e) => set("resultValue", e.target.value)} /></label>
              <label className="adm-field"><span>What it measures</span><input value={d.resultLabel} maxLength={80} placeholder={RESULT_EXAMPLES[d.category][1]} onChange={(e) => set("resultLabel", e.target.value)} /></label>
              <label className="adm-field"><span>When or over what period</span><input value={d.resultPeriod} maxLength={60} placeholder={RESULT_EXAMPLES[d.category][2]} onChange={(e) => set("resultPeriod", e.target.value)} /></label>
            </div>
            <p className="adm-hint">Use a real, checkable number. For design or setup work it can be what was delivered and how fast, not only sales.</p>
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
            <legend>What we used <em>tap every service that was part of this job</em></legend>
            {[...SERVICE_CATEGORIES].sort((a, b) => Number(b.key === d.category) - Number(a.key === d.category)).map((cat) => (
              <div key={cat.key} className="adm-svc-group">
                <p>{cat.label}</p>
                <div className="adm-svc">
                  {cat.services.map((name) => {
                    const on = d.services.includes(name);
                    return <button key={name} type="button" aria-pressed={on} className={on ? "is-on" : ""} onClick={() => toggleService(name)}>{on && <Check size={13} strokeWidth={3} />}{name}</button>;
                  })}
                </div>
              </div>
            ))}
            {d.services.filter((x) => !ALL_SERVICES.has(x)).length > 0 && (
              <ul className="adm-chips">
                {d.services.filter((x) => !ALL_SERVICES.has(x)).map((x) => <li key={x}>{x}<button type="button" aria-label={`Remove ${x}`} onClick={() => toggleService(x)}><X size={13} /></button></li>)}
              </ul>
            )}
            <div className="adm-inline">
              <input aria-label="Add something not on the list" value={serviceInput} maxLength={60} placeholder="Something not on the list" onChange={(e) => setServiceInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addService(); } }} />
              <button type="button" className="adm-btn" onClick={addService}>Add</button>
            </div>
          </fieldset>

          <fieldset className="adm-card">
            <legend>Gallery <em>optional, up to {MAX_GALLERY} images</em></legend>
            {d.gallery.length > 0 && (
              <ul className="adm-gallery">
                {d.gallery.map((g, i) => (
                  <li key={g.url}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                    <img src={g.url} alt="" />
                    <input aria-label={`Describe image ${i + 1}`} value={g.alt} maxLength={200} placeholder="Describe this image" onChange={(e) => set("gallery", d.gallery.map((x, k) => (k === i ? { ...x, alt: e.target.value } : x)))} />
                    <button type="button" className="adm-icon-btn" aria-label={`Remove image ${i + 1}`} onClick={() => set("gallery", d.gallery.filter((_, k) => k !== i))}><X size={16} /></button>
                  </li>
                ))}
              </ul>
            )}
            {d.gallery.length < MAX_GALLERY && (
              <label className="adm-btn adm-gallery-add">
                {uploading ? <Loader2 size={16} className="adm-spin" /> : <ImagePlus size={16} />} Add images
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => { void addGallery(e.target.files); e.target.value = ""; }} />
              </label>
            )}
            <p className="adm-hint">Good for pages of a company profile, a set of posts, or screens of a landing page.</p>
          </fieldset>

          <fieldset className="adm-card">
            <legend>Before and after <em>optional, for redesigns</em></legend>
            <div className="adm-grid-2">
              <div className="adm-field"><span>Before</span><ImageUpload folder="work" label="Add the before image" value={d.beforeImageUrl} onChange={(u) => set("beforeImageUrl", u)} onError={(text) => setToast({ kind: "error", text })} /></div>
              <div className="adm-field"><span>After</span><ImageUpload folder="work" label="Add the after image" value={d.afterImageUrl} onChange={(u) => set("afterImageUrl", u)} onError={(text) => setToast({ kind: "error", text })} /></div>
            </div>
          </fieldset>

          <fieldset className="adm-card">
            <legend>Client quote <em>optional, only with their permission</em></legend>
            <label className="adm-field"><span>Quote</span><textarea rows={3} maxLength={400} value={d.testimonialQuote} onChange={(e) => set("testimonialQuote", e.target.value)} /></label>
            <label className="adm-field"><span>Who said it</span><input value={d.testimonialAuthor} maxLength={100} placeholder="Name, role" onChange={(e) => set("testimonialAuthor", e.target.value)} /></label>
          </fieldset>

          <div className="seo-score-narrow"><SeoScoreCard checks={checks} /></div>
          <SearchSocialPanel
            value={d}
            onChange={(k, v) => set(k as keyof Draft, v as never)}
            title={d.headline}
            fallbackDescription={resultLine}
            path="work"
            slug={d.slug}
            coverImageUrl={d.coverImageUrl}
            onError={(text) => setToast({ kind: "error", text })}
          />
          <AnswersPanel faqs={d.faqs} onFaqs={(f) => set("faqs", f)} />

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
          <SeoScoreCard checks={checks} />
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
