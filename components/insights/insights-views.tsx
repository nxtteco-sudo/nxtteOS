"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock3, MessageCircle, Sparkles } from "lucide-react";
import { PageShell, Eyebrow, delay, useRevealOnce, useInView, whatsappHref } from "@/components/home/home-page";
import { trackEvent } from "@/lib/analytics";
import type { InsightPost, InsightSummary } from "@/types/insights";
import { authorBySlug, parseFaqs } from "@/lib/content-seo";
import { PostByline, PostFaqs, PostTakeaways } from "./post-extras";

// Spec (AGENTS.md section 5): cards newest first, no visible dates, one image
// per post, CTA at the end of every post.

function useMotion() {
  const [ref, state] = useRevealOnce<HTMLDivElement>();
  const motion = state === "static" ? "" : state === "in" ? "anim-ready is-in" : "anim-ready";
  return [ref, motion] as const;
}

function Cover({ post, sizes, priority = false }: { post: InsightSummary; sizes: string; priority?: boolean }) {
  if (!post.cover_image_url) {
    return <span className="ip-cover-fallback" aria-hidden="true"><Sparkles size={28} /></span>;
  }
  return <Image src={post.cover_image_url} alt={post.cover_alt} fill sizes={sizes} priority={priority} className="ip-cover-img" />;
}

function PostCard({ post, i }: { post: InsightSummary; i: number }) {
  return (
    <li className="ip-card art-step" style={delay(120 + i * 70)}>
      <Link href={`/insights/${post.slug}`} className="ip-card-link">
        <span className="ip-card-cover"><Cover post={post} sizes="(max-width: 700px) 100vw, 400px" /></span>
        <span className="ip-card-text">
          <strong>{post.title}</strong>
          {post.excerpt && <small>{post.excerpt}</small>}
          <span className="ip-read">Read <ArrowUpRight size={15} /></span>
        </span>
      </Link>
    </li>
  );
}

function InsightsCTA() {
  return (
    <section className="ip-cta dark-band">
      <div className="site-shell ip-cta-inner">
        <div>
          <Eyebrow light>Want this done for you?</Eyebrow>
          <h2>Posts that bring people <em>to your WhatsApp.</em></h2>
        </div>
        <div className="ip-cta-actions">
          <a className="ip-btn ip-btn-primary" href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { source: "insights" })}>
            WhatsApp us <MessageCircle size={16} />
          </a>
          <Link className="ip-btn ip-btn-ghost" href="/audit">Book the RM 199 audit <ArrowUpRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}

export function InsightsIndexView({ posts }: { posts: InsightSummary[] }) {
  const [heroRef, heroMotion] = useMotion();
  const [listRef, listMotion] = useMotion();
  const [secRef, inView] = useInView<HTMLElement>();
  const [featured, ...rest] = posts;
  const stack = posts.slice(0, 3);
  return (
    <PageShell>
      <main>
        <section ref={secRef} className={`ip-hero ${inView ? "" : "loop-paused"}`}>
          <div className="ip-hero-glow" aria-hidden="true"><i /><i /></div>
          <div ref={heroRef} className={`site-shell ip-hero-grid ${heroMotion}`}>
            <div className="ip-hero-copy">
              <div className="art-step" style={delay(0)}><Eyebrow>Insights</Eyebrow></div>
              <h1 className="art-step" style={delay(80)}>Notes on turning<br />posts <em>into bookings.</em></h1>
              <p className="art-step" style={delay(160)}>Short, practical reads for Malaysian business owners who post, taken from the carousels we share on Instagram.</p>
            </div>
            <div className="ip-stack art-step" style={delay(200)} aria-hidden="true">
              {(stack.length ? stack : [null, null, null]).map((post, i) => (
                <span key={post?.id ?? i} className={`ip-slide ip-slide-${i + 1}`}>
                  <span className="ip-slide-dots"><i /><i /><i /></span>
                  <b>{post?.title ?? ["Your bio has one job.", "What to measure when likes are not the point.", "Plan 30 days of content."][i]}</b>
                  <span className="ip-slide-foot">nxtte<i>{i + 1}/3</i></span>
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="ip-list">
          <div ref={listRef} className={`site-shell ${listMotion}`}>
            {!featured ? (
              <div className="ip-empty art-step" style={delay(0)}>
                <span className="ip-empty-ic"><Sparkles size={22} /></span>
                <h2>The first posts are on the way.</h2>
                <p>In the meantime, ask us anything about your content on WhatsApp.</p>
                <a className="ip-btn ip-btn-primary" href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { source: "insights_empty" })}>WhatsApp us <MessageCircle size={16} /></a>
              </div>
            ) : (
              <>
                <Link href={`/insights/${featured.slug}`} className="ip-featured art-step" style={delay(0)}>
                  <span className="ip-featured-cover"><Cover post={featured} sizes="(max-width: 900px) 100vw, 640px" priority /></span>
                  <span className="ip-featured-text">
                    <span className="ip-tag">Latest</span>
                    <strong>{featured.title}</strong>
                    {featured.excerpt && <small>{featured.excerpt}</small>}
                    <span className="ip-read">Read the post <ArrowUpRight size={16} /></span>
                  </span>
                </Link>
                {rest.length > 0 && <ul className="ip-grid">{rest.map((post, i) => <PostCard key={post.id} post={post} i={i} />)}</ul>}
              </>
            )}
          </div>
        </section>
        <InsightsCTA />
      </main>
    </PageShell>
  );
}

// The rendered Markdown arrives as children from the server page, so the
// Markdown library never ships to the browser.
export function InsightPostView({ post, minutes, more, children }: { post: InsightPost; minutes: number; more: InsightSummary[]; children: React.ReactNode }) {
  const [ref, motion] = useMotion();
  return (
    <PageShell>
      <main>
        <article>
          <header className="ip-post-head">
            <div className="ip-hero-glow" aria-hidden="true"><i /><i /></div>
            <div ref={ref} className={`site-shell ip-post-shell ${motion}`}>
              <Link href="/insights" className="ip-back art-step" style={delay(0)}><ArrowLeft size={15} /> All insights</Link>
              <h1 className="art-step" style={delay(60)}>{post.title}</h1>
              {post.excerpt && <p className="ip-post-excerpt art-step" style={delay(120)}>{post.excerpt}</p>}
              <span className="ip-meta-row art-step" style={delay(160)}>
                <PostByline author={authorBySlug(post.author_slug)} />
                <span className="ip-meta"><Clock3 size={14} /> {minutes} min read</span>
              </span>
              {post.cover_image_url && (
                <div className="ip-post-cover art-step" style={delay(200)}>
                  <Image src={post.cover_image_url} alt={post.cover_alt} fill priority sizes="(max-width: 900px) 100vw, 900px" className="ip-cover-img" />
                </div>
              )}
            </div>
          </header>
          <div className="ip-post-main"><div className="site-shell ip-post-body">
            <PostTakeaways text={post.takeaways ?? ""} />
            {children}
            <PostFaqs faqs={parseFaqs(post.faqs)} />
            <aside className="ip-endcard">
              <span className="ip-endcard-ic" aria-hidden="true"><MessageCircle size={20} /></span>
              <div>
                <strong>Want posts that bring customers in, not just likes?</strong>
                <p>Tell us about your business. We reply with what we would change first.</p>
              </div>
              <a className="ip-btn ip-btn-primary" href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { source: "insight_post" })}>WhatsApp us <ArrowUpRight size={16} /></a>
            </aside>
          </div></div>
        </article>
        {more.length > 0 && (
          <section className="ip-more">
            <div className="site-shell">
              <h2>More reads</h2>
              <ul className="ip-grid">{more.map((p, i) => <PostCard key={p.id} post={p} i={i} />)}</ul>
            </div>
          </section>
        )}
      </main>
    </PageShell>
  );
}
