"use client";

// Markdown editor with a live preview that uses the same renderer as
// /insights/[slug]. Adapted from the Aurexis admin. Cmd+S saves, Cmd+B / Cmd+I format.
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Bold, Eye, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Loader2, PenLine, Quote, Trash2,
} from "lucide-react";
import { deleteInsight, saveInsight } from "@/app/admin/actions";
import { PostBody } from "@/components/insights/post-body";
import { ImageUpload, uploadFile } from "./image-upload";
import type { InsightPost } from "@/types/insights";

type Draft = { title: string; slug: string; excerpt: string; body: string; coverImageUrl: string | null; coverAlt: string };
type Toast = { kind: "ok" | "error"; text: string } | null;

// Spec: posts are 400 to 700 words.
const WORD_MIN = 400;
const WORD_MAX = 700;

// "line|prefix" or "wrap|before|after|placeholder"
const TOOLS = [
  { icon: Heading2, label: "Heading", action: "line|## " },
  { icon: Heading3, label: "Subheading", action: "line|### " },
  { icon: Bold, label: "Bold (Cmd+B)", action: "wrap|**" },
  { icon: Italic, label: "Italic (Cmd+I)", action: "wrap|*" },
  { icon: Link2, label: "Link", action: "wrap|[|](https://)|link text" },
  { icon: List, label: "Bullet list", action: "line|- " },
  { icon: ListOrdered, label: "Numbered list", action: "line|1. " },
  { icon: Quote, label: "Quote", action: "line|> " },
];

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

export function InsightEditor({ post }: { post: InsightPost | null }) {
  const router = useRouter();
  const initial: Draft = {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    body: post?.body ?? "",
    coverImageUrl: post?.cover_image_url ?? null,
    coverAlt: post?.cover_alt ?? "",
  };
  const [d, setD] = useState<Draft>(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [status, setStatus] = useState<"draft" | "published">(post?.status ?? "draft");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [pane, setPane] = useState<"write" | "preview">("write");
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const imgInput = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(d) !== saved;
  const words = useMemo(() => d.body.trim().split(/\s+/).filter(Boolean).length, [d.body]);
  const wordState = words < WORD_MIN ? "short" : words > WORD_MAX ? "long" : "good";
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function save(nextStatus: "draft" | "published") {
    start(async () => {
      const res = await saveInsight({ id: post?.id, ...d, status: nextStatus });
      if (!res.ok) return setToast({ kind: "error", text: res.error });
      const wasLive = status === "published";
      setStatus(nextStatus);
      setSaved(JSON.stringify(d));
      setToast({ kind: "ok", text: nextStatus === "published" ? (wasLive ? "Post updated" : "Published. It is live now.") : wasLive ? "Unpublished. It is a draft again." : "Draft saved" });
      if (!post) router.replace(`/admin/insights/${res.id}`);
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

  function wrap(before: string, after = before, placeholder = "text") {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const sel = value.slice(a, b) || placeholder;
    set("body", value.slice(0, a) + before + sel + after + value.slice(b));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + before.length, a + before.length + sel.length); });
  }

  function linePrefix(prefix: string) {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const from = value.lastIndexOf("\n", a - 1) + 1;
    const out = value.slice(from, b).split("\n").map((l, i) => (prefix === "1. " ? `${i + 1}. ${l}` : `${prefix}${l}`)).join("\n");
    set("body", value.slice(0, from) + out + value.slice(b));
    requestAnimationFrame(() => el.focus());
  }

  function runTool(action: string) {
    const [kind, x, y, z] = action.split("|");
    if (kind === "line") linePrefix(x);
    else wrap(x, y || x, z || "text");
  }

  async function insertImage(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    const res = await uploadFile(file);
    setUploading(false);
    if (!res.ok) return setToast({ kind: "error", text: res.error });
    wrap("\n![", `](${res.url})\n`, "describe the image");
  }

  const preview = (
    <div className="adm-preview">
      <h1>{d.title || "Your title"}</h1>
      {d.excerpt && <p className="adm-preview-excerpt">{d.excerpt}</p>}
      {d.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- preview only
        <img className="adm-preview-cover" src={d.coverImageUrl} alt={d.coverAlt} />
      )}
      {d.body.trim()
        ? <PostBody markdown={d.body} />
        : <p className="adm-muted">Start writing and the post appears here, exactly as readers will see it.</p>}
    </div>
  );

  return (
    <div className="adm-editor">
      <div className="adm-bar">
        <Link href="/admin/insights" className="adm-icon-btn" aria-label="Back to posts"><ArrowLeft size={18} /></Link>
        <span className={`adm-pill ${status === "published" ? "is-live" : ""}`}>{status === "published" ? "Published" : "Draft"}</span>
        <span className="adm-muted">{dirty ? "Unsaved changes" : "All changes saved"}</span>
        <div className="adm-bar-actions">
          {post && status === "published" && (
            <a href={`/insights/${post.slug}`} target="_blank" rel="noreferrer" className="adm-btn adm-btn-ghost"><Eye size={16} /> View live</a>
          )}
          {status === "published" ? (
            <>
              <button type="button" className="adm-btn" onClick={() => save("draft")} disabled={pending}>Unpublish</button>
              <button type="button" className="adm-btn adm-btn-primary" onClick={() => save("published")} disabled={pending || !dirty}>
                {pending && <Loader2 size={16} className="adm-spin" />} Update
              </button>
            </>
          ) : (
            <>
              <button type="button" className="adm-btn" onClick={() => save("draft")} disabled={pending}>
                {pending && <Loader2 size={16} className="adm-spin" />} Save draft
              </button>
              <button type="button" className="adm-btn adm-btn-primary" onClick={() => save("published")} disabled={pending}>Publish</button>
            </>
          )}
        </div>
      </div>

      {toast && <p className={`adm-toast ${toast.kind === "error" ? "is-error" : ""}`} role={toast.kind === "error" ? "alert" : "status"}>{toast.text}</p>}

      <div className="adm-editor-grid">
        <div className="adm-editor-fields">
          <input
            className="adm-title"
            value={d.title}
            onChange={(e) => { set("title", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }}
            placeholder="Post title"
            aria-label="Post title"
            maxLength={200}
          />

          <label className="adm-field">
            <span>URL <em>nxtte.com/insights/{d.slug || "your-post"}</em></span>
            <input value={d.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} placeholder="your-post-url" className="adm-mono" />
          </label>

          <label className="adm-field">
            <span>Summary <em>{d.excerpt.length}/300</em></span>
            <textarea rows={2} maxLength={300} value={d.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="One or two sentences. Shown on the Insights page and in Google results." />
          </label>

          <div className="adm-field">
            <span>Cover image <em>the one image the spec allows per post</em></span>
            <ImageUpload value={d.coverImageUrl} onChange={(u) => set("coverImageUrl", u)} onError={(text) => setToast({ kind: "error", text })} />
          </div>
          {d.coverImageUrl && (
            <label className="adm-field">
              <span>Describe the cover image <em>for screen readers</em></span>
              <input value={d.coverAlt} maxLength={200} onChange={(e) => set("coverAlt", e.target.value)} placeholder="For example: A café owner reading WhatsApp messages at the counter" />
            </label>
          )}

          <div className="adm-field">
            <div className="adm-body-head">
              <span>Post</span>
              <div className="adm-tabs" role="tablist" aria-label="Editor view">
                {(["write", "preview"] as const).map((p) => (
                  <button key={p} type="button" role="tab" aria-selected={pane === p} className={pane === p ? "is-on" : ""} onClick={() => setPane(p)}>
                    {p === "write" ? <PenLine size={14} /> : <Eye size={14} />} {p === "write" ? "Write" : "Preview"}
                  </button>
                ))}
              </div>
            </div>
            <div className={`adm-md ${pane === "preview" ? "adm-hide-narrow" : ""}`}>
              <div className="adm-toolbar">
                {TOOLS.map((t) => (
                  <button key={t.label} type="button" title={t.label} aria-label={t.label} onClick={() => runTool(t.action)}><t.icon size={16} /></button>
                ))}
                <button type="button" className="adm-tool-text" onClick={() => imgInput.current?.click()}>
                  {uploading ? <Loader2 size={16} className="adm-spin" /> : <ImagePlus size={16} />} Image
                </button>
                <input ref={imgInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => insertImage(e.target.files?.[0])} />
                <span className={`adm-words is-${wordState}`}>{words} words {wordState === "good" ? "· on target" : `· aim for ${WORD_MIN} to ${WORD_MAX}`}</span>
              </div>
              <textarea
                ref={bodyRef}
                value={d.body}
                onChange={(e) => set("body", e.target.value)}
                onKeyDown={(e) => {
                  if (!(e.metaKey || e.ctrlKey)) return;
                  if (e.key === "b") { e.preventDefault(); wrap("**"); }
                  else if (e.key === "i") { e.preventDefault(); wrap("*"); }
                }}
                placeholder={"Paste the carousel text here and shape it into a post.\n\n## A heading\nA paragraph with **bold** and *emphasis*.\n\n- A list item"}
                aria-label="Post body in Markdown"
              />
            </div>
            <div className={`adm-narrow-preview ${pane === "write" ? "adm-hide" : ""}`}>{preview}</div>
          </div>

          {post && (
            <div className="adm-danger">
              <span>Delete this post permanently</span>
              {confirmDelete ? (
                <span className="adm-danger-actions">
                  <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
                  <button
                    type="button"
                    className="adm-btn adm-btn-danger"
                    disabled={pending}
                    onClick={() => start(async () => {
                      const res = await deleteInsight(post.id);
                      if (!res.ok) return setToast({ kind: "error", text: res.error });
                      router.replace("/admin/insights");
                    })}
                  >
                    Delete for good
                  </button>
                </span>
              ) : (
                <button type="button" className="adm-btn adm-btn-danger" onClick={() => setConfirmDelete(true)}><Trash2 size={15} /> Delete</button>
              )}
            </div>
          )}
        </div>

        <div className="adm-wide-preview">
          <p className="adm-label">Live preview</p>
          <div className="adm-preview-scroll">{preview}</div>
        </div>
      </div>
    </div>
  );
}
