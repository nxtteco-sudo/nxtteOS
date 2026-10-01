"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MessageCircle, Quote, Sparkles } from "lucide-react";
import { PageShell, Eyebrow, delay, useRevealOnce, useInView, whatsappHref } from "@/components/home/home-page";
import { trackEvent } from "@/lib/analytics";
import { parseFaqs } from "@/lib/content-seo";
import { PostFaqs } from "@/components/insights/post-extras";
import { CATEGORY_LABEL, SERVICE_CATEGORIES, type ServiceCategory } from "@/lib/pricing";
import { CASE_TYPE_LABEL, type CaseStudy, type CaseSummary } from "@/types/work";

// Spec (AGENTS.md section 4): 3 to 6 tiles (image, client type, one result
// line), each opening a short story: situation -> what nxtte did -> what changed.

function useMotion() {
  const [ref, state] = useRevealOnce<HTMLDivElement>();
  const motion = state === "static" ? "" : state === "in" ? "anim-ready is-in" : "anim-ready";
  return [ref, motion] as const;
}

const STORY = [
  { n: "01", title: "The situation", body: "Where the business was when they came to us." },
  { n: "02", title: "What we did", body: "The content, pages and systems we put in place." },
  { n: "03", title: "What changed", body: "The result, with a real number and when we measured it." },
];

function CaseTile({ c, i }: { c: CaseSummary; i: number }) {
  return (
    <li className="wk-tile art-step" style={delay(100 + i * 90)}>
      <Link href={`/work/${c.slug}`} className="wk-tile-link">
        <span className="wk-tile-cover">
          {c.cover_image_url
            ? <Image src={c.cover_image_url} alt={c.cover_alt} fill sizes="(max-width: 800px) 100vw, 580px" className="wk-cover-img" />
            : <span className="wk-cover-fallback" aria-hidden="true"><Sparkles size={28} /></span>}
          <span className="wk-tile-result">
            <b>{c.result_value}</b>
            <span>{c.result_label}<small>{c.result_period}</small></span>
          </span>
        </span>
        <span className="wk-tile-text">
          <span className="wk-tile-cat">{CATEGORY_LABEL[c.category]}</span>
          <span className="wk-tile-meta"><span className={`wk-badge wk-badge-${c.case_type}`}>{CASE_TYPE_LABEL[c.case_type]}</span>{c.client_type}</span>
          <strong>{c.headline}</strong>
          <span className="wk-read">Read the story <ArrowUpRight size={15} /></span>
        </span>
      </Link>
    </li>
  );
}

function WorkCTA() {
  return (
    <section className="ip-cta dark-band">
      <div className="site-shell ip-cta-inner">
        <div>
          <Eyebrow light>Your business next?</Eyebrow>
          <h2>Let&rsquo;s write a story <em>with a number in it.</em></h2>
        </div>
        <div className="ip-cta-actions">
          <a className="ip-btn ip-btn-primary" href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { source: "work" })}>WhatsApp us <MessageCircle size={16} /></a>
          <Link className="ip-btn ip-btn-ghost" href="/audit">Book the RM 199 audit <ArrowUpRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}

export function WorkIndexView({ cases }: { cases: CaseSummary[] }) {
  const [heroRef, heroMotion] = useMotion();
  const [listRef, listMotion] = useMotion();
  const [filter, setFilter] = useState<ServiceCategory | "all">("all");
  // Only offer categories that have at least one case, so no tab is ever empty.
  const tabs = SERVICE_CATEGORIES.filter((cat) => cases.some((c) => c.category === cat.key));
  const shown = filter === "all" ? cases : cases.filter((c) => c.category === filter);
  const [secRef, inView] = useInView<HTMLElement>();
  return (
    <PageShell>
      <main>
        <section ref={secRef} className={`wk-hero ${inView ? "" : "loop-paused"}`}>
          <div className="ip-hero-glow" aria-hidden="true"><i /><i /></div>
          <div ref={heroRef} className={`site-shell wk-hero-grid ${heroMotion}`}>
            <div className="wk-hero-copy">
              <div className="art-step" style={delay(0)}><Eyebrow>Our work</Eyebrow></div>
              <h1 className="art-step" style={delay(80)}>Proof, <em>not promises.</em></h1>
              <p className="art-step" style={delay(160)}>Every case follows the same short story: where the business started, what we did, and what changed. Each one ends with a real number.</p>
            </div>
            <ol className="wk-story-strip" aria-label="How every case study is told">
              {STORY.map((s, i) => (
                <li key={s.n} className={`wk-step wk-step-${i + 1} art-step`} style={delay(220 + i * 120)}>
                  <b>{s.n}</b>
                  <span><strong>{s.title}</strong><small>{s.body}</small></span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="wk-list">
          <div ref={listRef} className={`site-shell ${listMotion}`}>
            {cases.length === 0 ? (
              <div className="ip-empty art-step" style={delay(0)}>
                <span className="ip-empty-ic"><Sparkles size={22} /></span>
                <h2>Case studies are being written.</h2>
                <p>We only publish a case once it has a real result. Until then, the audit shows you what we would change first.</p>
                <Link className="ip-btn ip-btn-primary" href="/audit">Book the RM 199 audit <ArrowUpRight size={16} /></Link>
              </div>
            ) : (
              <>
                {tabs.length > 1 && (
                  <div className="wk-filter art-step" style={delay(0)} role="group" aria-label="Filter work by service">
                    <button type="button" aria-pressed={filter === "all"} className={filter === "all" ? "is-on" : ""} onClick={() => setFilter("all")}>All work<span>{cases.length}</span></button>
                    {tabs.map((cat) => (
                      <button key={cat.key} type="button" aria-pressed={filter === cat.key} className={filter === cat.key ? "is-on" : ""} onClick={() => setFilter(cat.key)}>
                        {cat.label}<span>{cases.filter((c) => c.category === cat.key).length}</span>
                      </button>
                    ))}
                  </div>
                )}
                <ul className="wk-grid" key={filter}>{shown.map((c, i) => <CaseTile key={c.id} c={c} i={i} />)}</ul>
              </>
            )}
          </div>
        </section>
        <WorkCTA />
      </main>
    </PageShell>
  );
}

// The three story parts arrive as server-rendered Markdown, so the Markdown
// library never ships to the browser.
export function CaseStudyView({ c, more, situation, whatWeDid, whatChanged }: {
  c: CaseStudy; more: CaseSummary[]; situation: React.ReactNode; whatWeDid: React.ReactNode; whatChanged: React.ReactNode;
}) {
  const faqs = parseFaqs(c.faqs);
  const [ref, motion] = useMotion();
  const [storyRef, storyMotion] = useMotion();
  const parts = [
    { n: "01", title: "The situation", body: situation },
    { n: "02", title: "What we did", body: whatWeDid },
    { n: "03", title: "What changed", body: whatChanged },
  ];
  return (
    <PageShell>
      <main>
        <article>
          <header className="wk-case-head">
            <div className="ip-hero-glow" aria-hidden="true"><i /><i /></div>
            <div ref={ref} className={`site-shell ${motion}`}>
              <Link href="/work" className="ip-back art-step" style={delay(0)}><ArrowLeft size={15} /> All work</Link>
              <div className="wk-case-grid">
                <div>
                  <span className="wk-tile-meta art-step" style={delay(40)}><span className="wk-tile-cat">{CATEGORY_LABEL[c.category]}</span><span className={`wk-badge wk-badge-${c.case_type}`}>{CASE_TYPE_LABEL[c.case_type]}</span>{c.client_type}</span>
                  <h1 className="art-step" style={delay(80)}>{c.headline}</h1>
                  {c.client_name && <p className="wk-client art-step" style={delay(120)}>{c.client_name}</p>}
                </div>
                <div className="wk-result art-step" style={delay(160)}>
                  <b>{c.result_value}</b>
                  <span>{c.result_label}</span>
                  <small>{c.result_period}</small>
                </div>
              </div>
              {c.cover_image_url && (
                <div className="ip-post-cover art-step" style={delay(220)}>
                  <Image src={c.cover_image_url} alt={c.cover_alt} fill priority sizes="(max-width: 1200px) 100vw, 1180px" className="ip-cover-img" />
                </div>
              )}
            </div>
          </header>

          <div className="wk-case-main">
            <div ref={storyRef} className={`site-shell ${storyMotion}`}>
              <ol className="wk-parts">
                {parts.map((p, i) => (
                  <li key={p.n} className="wk-part art-step" style={delay(i * 120)}>
                    <span className="wk-part-n">{p.n}</span>
                    <div><h2>{p.title}</h2>{p.body}</div>
                  </li>
                ))}
              </ol>

              {c.before_image_url && c.after_image_url && (
                <section className="wk-ba" aria-label="Before and after">
                  <figure>
                    <span className="wk-ba-tag">Before</span>
                    {/* eslint-disable-next-line @next/next/no-img-element -- CMS image of unknown size */}
                    <img src={c.before_image_url} alt={`Before: ${c.headline}`} loading="lazy" decoding="async" />
                  </figure>
                  <figure>
                    <span className="wk-ba-tag is-after">After</span>
                    {/* eslint-disable-next-line @next/next/no-img-element -- CMS image of unknown size */}
                    <img src={c.after_image_url} alt={`After: ${c.headline}`} loading="lazy" decoding="async" />
                  </figure>
                </section>
              )}

              {c.gallery.length > 0 && (
                <section className="wk-gallery" aria-label="More from this project">
                  {c.gallery.map((g) => (
                    <figure key={g.url}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- CMS image of unknown size */}
                      <img src={g.url} alt={g.alt} loading="lazy" decoding="async" />
                    </figure>
                  ))}
                </section>
              )}

              {c.metrics.length > 0 && (
                <ul className="wk-metrics" aria-label="Results">
                  {c.metrics.map((m, i) => <li key={`${m.value}-${i}`}><b>{m.value}</b><span>{m.label}</span></li>)}
                </ul>
              )}

              {c.services.length > 0 && (
                <div className="wk-services">
                  <span>What we used</span>
                  <ul>{c.services.map((s, i) => <li key={`${s}-${i}`}>{s}</li>)}</ul>
                </div>
              )}

              {c.testimonial_quote && (
                <figure className="wk-quote">
                  <Quote size={26} aria-hidden="true" />
                  <blockquote>{c.testimonial_quote}</blockquote>
                  {c.testimonial_author && <figcaption>{c.testimonial_author}</figcaption>}
                </figure>
              )}

              {faqs.length > 0 && <div className="wk-faqs"><PostFaqs faqs={faqs} /></div>}

              <aside className="ip-endcard">
                <span className="ip-endcard-ic" aria-hidden="true"><MessageCircle size={20} /></span>
                <div>
                  <strong>Want a result like this for your business?</strong>
                  <p>Tell us where you are now. We reply with what we would do first.</p>
                </div>
                <a className="ip-btn ip-btn-primary" href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { source: "case_study" })}>WhatsApp us <ArrowUpRight size={16} /></a>
              </aside>
            </div>
          </div>
        </article>

        {more.length > 0 && (
          <section className="ip-more">
            <div className="site-shell">
              <h2>More work</h2>
              <ul className="wk-grid">{more.map((m, i) => <CaseTile key={m.id} c={m} i={i} />)}</ul>
            </div>
          </section>
        )}
      </main>
    </PageShell>
  );
}
