"use client";

// Editor panels for SEO and AEO (ported from the Aurexis Insight editor):
// the live score and checklist, search and share previews with length
// meters, and the answers card (author, key takeaways, FAQs).
import { useState } from "react";
import { CheckCircle2, ChevronDown, Circle, Plus, Trash2, XCircle } from "lucide-react";
import { AUTHORS, DESCRIPTION_BANDS, MAX_FAQS, TITLE_BANDS, lengthStatus, seoScore, type AuthorSlug, type Bands, type Faq, type SeoCheck } from "@/lib/content-seo";
import { ImageUpload } from "./image-upload";

export type SearchFields = {
  focusKeyword: string;
  seoTitle: string;
  metaDescription: string;
  noindex: boolean;
  /** Posts only. */
  ogImageUrl?: string | null;
  canonicalUrl?: string;
};

function Meter({ len, bands }: { len: number; bands: Bands }) {
  const status = len ? lengthStatus(len, ...bands) : "bad";
  return (
    <span className={`seo-meter is-${status}`} aria-hidden="true">
      <i><b style={{ width: `${Math.min(100, (len / bands[1][1]) * 100)}%` }} /></i>
      <em>{len}/{bands[0][1]}</em>
    </span>
  );
}

export function SeoScoreCard({ checks }: { checks: SeoCheck[] }) {
  const score = seoScore(checks);
  const tone = score >= 80 ? "good" : score >= 50 ? "ok" : "bad";
  const [open, setOpen] = useState(true);
  const ordered = [...checks].sort((a, b) => ["bad", "ok", "good"].indexOf(a.status) - ["bad", "ok", "good"].indexOf(b.status));
  return (
    <section className={`seo-score is-${tone}`} aria-label="SEO score">
      <button type="button" className="seo-score-head" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="seo-ring" style={{ "--s": score } as React.CSSProperties}><b>{score}</b></span>
        <span className="seo-score-text">
          <small>SEO and AI score</small>
          <strong>{score >= 80 ? "Ready to rank" : score >= 50 ? "Getting there. Fix the red items" : "Needs work before publishing"}</strong>
        </span>
        <ChevronDown size={16} className={open ? "is-open" : ""} aria-hidden="true" />
      </button>
      {open && (
        <ul className="seo-checks">
          {ordered.map((c) => {
            const Icon = c.status === "good" ? CheckCircle2 : c.status === "ok" ? Circle : XCircle;
            return <li key={c.key} className={`is-${c.status}`}><Icon size={15} aria-hidden="true" /><span>{c.label}</span></li>;
          })}
        </ul>
      )}
    </section>
  );
}

export function SearchSocialPanel({ value, onChange, title, fallbackDescription, path, slug, coverImageUrl, onError }: {
  value: SearchFields;
  onChange: <K extends keyof SearchFields>(k: K, v: SearchFields[K]) => void;
  title: string;
  fallbackDescription: string;
  /** "insights" or "work" */
  path: string;
  slug: string;
  coverImageUrl: string | null;
  onError: (text: string) => void;
}) {
  const isPost = value.ogImageUrl !== undefined;
  const [advanced, setAdvanced] = useState(Boolean(value.noindex || value.canonicalUrl));
  const t = value.seoTitle || title || "Your title";
  const desc = value.metaDescription || fallbackDescription || "Add a description so Google knows what this page answers.";
  const shareImage = value.ogImageUrl || coverImageUrl;
  return (
    <fieldset className="adm-card seo-panel">
      <legend>Search and social <em>how it looks on Google and WhatsApp</em></legend>
      <label className="adm-field">
        <span>Focus keyword <em>the phrase people would search</em></span>
        <input value={value.focusKeyword} maxLength={80} onChange={(e) => onChange("focusKeyword", e.target.value)} placeholder={path === "work" ? "for example: cafe social media Kuala Lumpur" : "for example: Instagram reels for cafes"} />
      </label>
      <label className="adm-field">
        <span>Search title <em>empty uses the {path === "work" ? "headline" : "post title"}</em></span>
        <input value={value.seoTitle} maxLength={120} onChange={(e) => onChange("seoTitle", e.target.value)} placeholder={title || "Title shown on Google"} />
        <Meter len={(value.seoTitle || title).length} bands={TITLE_BANDS} />
      </label>
      <label className="adm-field">
        <span>Search description <em>empty uses the {path === "work" ? "result line" : "summary"}</em></span>
        <textarea rows={3} maxLength={300} value={value.metaDescription} onChange={(e) => onChange("metaDescription", e.target.value)} placeholder={fallbackDescription || "One or two sentences: who it is for and what they get."} />
        <Meter len={(value.metaDescription || fallbackDescription).length} bands={DESCRIPTION_BANDS} />
      </label>

      <div className="adm-field">
        <span>Google preview</span>
        <div className="seo-google">
          <div className="seo-google-site"><span aria-hidden="true">n</span><p>nxtte<small>nxtte.com › {path} › {slug || "your-page"}</small></p></div>
          <p className="seo-google-title">{t.length > 60 ? `${t.slice(0, 58)}...` : t}</p>
          <p className="seo-google-desc">{desc.length > 160 ? `${desc.slice(0, 157)}...` : desc}</p>
        </div>
      </div>

      <div className="adm-field">
        <span>Share preview <em>WhatsApp, Instagram, Facebook</em></span>
        <div className="seo-share">
          {shareImage
            // eslint-disable-next-line @next/next/no-img-element -- preview only
            ? <img src={shareImage} alt="" />
            : <div className="seo-share-empty">No share image yet. Add a cover{isPost ? " or a share image below" : ""}.</div>}
          <div className="seo-share-text"><small>nxtte.com</small><strong>{t}</strong><span>{desc}</span></div>
        </div>
        {isPost && (
          <div className="seo-share-upload">
            <span className="adm-hint">Share image (optional, 1200 by 630 works best). Empty uses the cover.</span>
            <ImageUpload value={value.ogImageUrl ?? null} onChange={(u) => onChange("ogImageUrl", u)} onError={onError} />
          </div>
        )}
      </div>

      <button type="button" className="seo-advanced" aria-expanded={advanced} onClick={() => setAdvanced(!advanced)}><ChevronDown size={14} className={advanced ? "is-open" : ""} aria-hidden="true" /> Advanced</button>
      {advanced && (
        <div className="seo-advanced-body">
          {isPost && (
            <label className="adm-field">
              <span>Canonical URL <em>only if this first appeared on another site</em></span>
              <input value={value.canonicalUrl ?? ""} maxLength={300} className="adm-mono" onChange={(e) => onChange("canonicalUrl", e.target.value)} placeholder="https://..." />
            </label>
          )}
          <label className="seo-switch">
            <input type="checkbox" checked={value.noindex} onChange={(e) => onChange("noindex", e.target.checked)} />
            <span>Hide from Google (noindex). The page still opens from a link.</span>
          </label>
        </div>
      )}
    </fieldset>
  );
}

/** Author (posts), key takeaways (posts) and FAQs (both): what AI answers quote. */
export function AnswersPanel({ faqs, onFaqs, takeaways, onTakeaways, author, onAuthor }: {
  faqs: Faq[];
  onFaqs: (f: Faq[]) => void;
  takeaways?: string;
  onTakeaways?: (v: string) => void;
  author?: AuthorSlug | null;
  onAuthor?: (v: AuthorSlug | null) => void;
}) {
  const setFaq = (i: number, patch: Partial<Faq>) => onFaqs(faqs.map((f, n) => (n === i ? { ...f, ...patch } : f)));
  return (
    <fieldset className="adm-card seo-panel">
      <legend>Answers for Google and AI <em>quoted by ChatGPT, Google AI Overviews and Perplexity</em></legend>
      {onAuthor && (
        <div className="adm-field">
          <span>Written by <em>shown on the post, builds trust</em></span>
          <div className="adm-seg" role="radiogroup" aria-label="Author">
            <button type="button" role="radio" aria-checked={!author} className={!author ? "is-on" : ""} onClick={() => onAuthor(null)}>nxtte</button>
            {AUTHORS.map((a) => <button key={a.slug} type="button" role="radio" aria-checked={author === a.slug} className={author === a.slug ? "is-on" : ""} onClick={() => onAuthor(a.slug)}>{a.name}</button>)}
          </div>
        </div>
      )}
      {onTakeaways && (
        <label className="adm-field">
          <span>Key takeaways <em>2 or 3 short lines at the top, one per line</em></span>
          <textarea rows={3} maxLength={600} value={takeaways ?? ""} onChange={(e) => onTakeaways(e.target.value)} placeholder={"Post 3 reels a week; reels reach people who do not follow you yet.\nPut your WhatsApp link in every caption."} />
        </label>
      )}
      <div className="adm-field">
        <span>Questions and answers <em>{faqs.length}/{MAX_FAQS}, shown at the end</em></span>
        <div className="seo-faqs">
          {faqs.map((f, i) => (
            <div key={i} className="seo-faq">
              <div className="seo-faq-top">
                <b aria-hidden="true">Q{i + 1}</b>
                <input aria-label={`Question ${i + 1}`} value={f.q} maxLength={200} onChange={(e) => setFaq(i, { q: e.target.value })} placeholder="A question a customer would type, for example: How often should a cafe post?" />
                <button type="button" className="adm-icon-btn" aria-label={`Remove question ${i + 1}`} onClick={() => onFaqs(faqs.filter((_, n) => n !== i))}><Trash2 size={15} /></button>
              </div>
              <textarea aria-label={`Answer ${i + 1}`} rows={2} maxLength={800} value={f.a} onChange={(e) => setFaq(i, { a: e.target.value })} placeholder="Answer in 1 to 3 plain sentences. Start with the direct answer." />
            </div>
          ))}
          {faqs.length < MAX_FAQS && <button type="button" className="adm-btn adm-btn-ghost seo-add" onClick={() => onFaqs([...faqs, { q: "", a: "" }])}><Plus size={15} /> Add a question</button>}
        </div>
      </div>
    </fieldset>
  );
}
