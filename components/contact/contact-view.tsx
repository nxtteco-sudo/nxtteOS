"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Clock3, FileText, Mail, MapPin, MessageCircle, Phone, Plus, Receipt, Tag, Ticket } from "lucide-react";
import { siInstagram, siTiktok } from "simple-icons";
import { PageShell, Eyebrow, delay, useRevealOnce, useInView, FAQ_ITEMS } from "@/components/home/home-page";
import { submitContactForm } from "@/app/contact/actions";
import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { CONTACT } from "@/lib/site";
import { SERVICE_INTERESTS } from "@/lib/validation/forms";
import { LeadForm, type LeadField } from "@/components/forms/lead-form";

// AGENTS.md section 5: WhatsApp is the hero and the largest object on the page;
// the form is the fallback (five fields); "We reply within 24 hours" in writing;
// email and both socials below the fold.
const WHATSAPP_MESSAGE = "Hi nxtte, I'd like to talk about my business's social media.";

const EMAIL = CONTACT.email;
const INSTAGRAM_URL = CONTACT.instagramUrl;
const TIKTOK_URL = CONTACT.tiktokUrl;

const FIELDS: LeadField[] = [
  { name: "name", label: "Your name", autoComplete: "name" },
  { name: "business", label: "Business name", autoComplete: "organization" },
  { name: "instagram", label: "Instagram handle", autoComplete: "off", placeholder: "@yourbrand" },
  { name: "whatsapp", label: "WhatsApp number", autoComplete: "tel", placeholder: "+60 12 345 6789", type: "tel" },
];

const NEXT = [
  "We read it the same day.",
  "We reply on WhatsApp within 24 hours.",
  "If it is a fit, we book a short call.",
];

// After someone gets in touch. Timings come from the published terms (FAQ, first month).
const AFTER = [
  { icon: MessageCircle, when: "Today", title: "You message us", body: "On WhatsApp or with the form. Tell us what your business does." },
  { icon: Clock3, when: "Within 24 hours", title: "We reply", body: "A real person answers, with questions about your business." },
  { icon: Phone, when: "When it suits you", title: "A short call", body: "We look at your accounts and suggest a package or menu item." },
  { icon: Receipt, when: "No surprises", title: "The published price", body: "What you pay is the price on the Services page." },
  { icon: FileText, when: "Within 5 working days", title: "Your first calendar", body: "A month of content, planned before anything is posted." },
];

const PRICE_ANSWER: [string, string] = [
  "How much does it cost?",
  "Packages are RM 1,199, RM 2,299 and RM 3,399 a month. Single pieces of work have fixed prices on the menu. Everything is listed on the Services page.",
];

function useMotion() {
  const [ref, state] = useRevealOnce<HTMLDivElement>();
  const motion = state === "static" ? "" : state === "in" ? "anim-ready is-in" : "anim-ready";
  return [ref, motion] as const;
}

function BrandIcon({ path, size = 18 }: { path: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={path} /></svg>;
}

export function ContactView() {
  const [heroRef, heroMotion] = useMotion();
  const [formRef, formMotion] = useMotion();
  const [afterRef, afterMotion] = useMotion();
  const [secRef, inView] = useInView<HTMLElement>();
  const waHref = buildWhatsAppLink(WHATSAPP_MESSAGE);
  const answers = [PRICE_ANSWER, ...(FAQ_ITEMS as [string, string][])];

  return (
    <PageShell>
      <main>
        <section ref={secRef} className={`ct-split ${inView ? "" : "loop-paused"}`}>
          <div ref={heroRef} className={`ct-split-grid ${heroMotion}`}>
            {/* The whole pink half is one WhatsApp link: the largest object on the page. */}
            <a className="ct-wa-panel" href={waHref} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { source: "contact_hero" })}>
              <span className="ct-glow" aria-hidden="true"><i /><i /><i /></span>
              <div className="ct-wa-inner">
                <span className="art-step" style={delay(0)}><Eyebrow light>Contact</Eyebrow></span>
                <h1 className="ct-wa-title art-step" style={delay(80)}>Let&rsquo;s talk <em>on WhatsApp.</em></h1>
                <span className="ct-wa-sub art-step" style={delay(160)}>The fastest way to reach us. Tell us what your business does and what you need, and a real person replies.</span>
                <span className="ct-promise art-step" style={delay(220)}><Clock3 size={17} /> We reply within 24 hours.</span>
                <span className="ct-wa-btn art-step" style={delay(300)}>
                  <span><strong>Chat on WhatsApp</strong><small>Opens WhatsApp with a message ready to send</small></span>
                  <i aria-hidden="true"><MessageCircle size={32} /></i>
                </span>
              </div>
            </a>

            <div className="ct-ways">
              <h2 className="art-step" style={delay(200)}>Other ways to start</h2>
              <a className="ct-way art-step" style={delay(260)} href="#contact-form">
                <i aria-hidden="true"><FileText size={21} /></i>
                <span><strong>Leave your details</strong><small>Five quick fields. We message you.</small></span>
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <Link className="ct-way ct-way-dark art-step" style={delay(320)} href="/audit">
                <i aria-hidden="true"><Ticket size={21} /></i>
                <span><strong>Book the RM 199 audit</strong><small>A 90-day plan in 5 working days</small></span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="ct-way art-step" style={delay(380)} href="/services">
                <i aria-hidden="true"><Tag size={21} /></i>
                <span><strong>See our prices first</strong><small>Packages from the menu, all published</small></span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <ul className="ct-tags art-step" style={delay(440)}>
                <li><MapPin size={14} /> Kuala Lumpur, Malaysia</li>
                <li><BadgeCheck size={14} /> SSM NS0315281-P</li>
                <li><Building2 size={14} /> Part of Aurexis Solution</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="contact-form" className="ct-alt">
          <div ref={formRef} className={`site-shell ct-alt-grid ${formMotion}`}>
            <div className="ct-alt-copy art-step" style={delay(0)}>
              <Eyebrow>Not on WhatsApp right now?</Eyebrow>
              <h2>Leave your details. <em>We will message you.</em></h2>
              <p>Five quick fields, no long brief. We only use your number to reply to you.</p>
              <ol className="ct-next">
                {NEXT.map((t, i) => <li key={t}><b>{i + 1}</b>{t}</li>)}
              </ol>
            </div>
            <div className="ct-form-card art-step" style={delay(120)}>
              <LeadForm
                formKey="contact"
                fields={FIELDS}
                choice={{ name: "service_interest", legend: "What do you need help with?", options: SERVICE_INTERESTS }}
                action={submitContactForm}
                event="contact_submit"
                submitLabel="Send my details"
                fine="We reply within 24 hours, on WhatsApp."
              />
            </div>
          </div>
        </section>

        <section className="ct-after">
          <div ref={afterRef} className={`site-shell ${afterMotion}`}>
            <div className="ct-after-head art-step" style={delay(0)}>
              <Eyebrow light>What happens next</Eyebrow>
              <h2>From hello <em>to your first calendar.</em></h2>
            </div>
            <ol className="ct-after-steps">
              <span className="ct-after-line" aria-hidden="true" />
              {AFTER.map(({ icon: Icon, when, title, body }, i) => (
                <li key={title} className="art-step" style={delay(150 + i * 110)}>
                  <span className="ct-after-ic" aria-hidden="true"><Icon size={20} /></span>
                  <small>{when}</small>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="ct-faq">
          <div className="site-shell ct-faq-grid">
            <div className="ct-faq-side">
              <Eyebrow>Quick answers</Eyebrow>
              <h2>Before you <em>message us.</em></h2>
              <p>Still unsure about something? Ask it on WhatsApp. There are no silly questions.</p>
              <a className="ct-faq-wa" href={waHref} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { source: "contact_faq" })}><MessageCircle size={17} /> Ask on WhatsApp</a>
            </div>
            <div className="ct-faq-list">
              {answers.map(([q, a], i) => (
                <details key={q} className="ct-q" open={i === 0}>
                  <summary><span>{q}</span><i aria-hidden="true"><Plus size={18} /></i></summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="ct-reach">
          <div className="site-shell ct-reach-grid">
            <a className="ct-reach-card" href={`mailto:${EMAIL}`}>
              <span className="ct-reach-ic"><Mail size={20} /></span>
              <span><small>Email</small><strong>{EMAIL}</strong></span>
            </a>
            <a className="ct-reach-card" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              <span className="ct-reach-ic"><BrandIcon path={siInstagram.path} /></span>
              <span><small>Instagram</small><strong>{CONTACT.handle}</strong></span>
            </a>
            <a className="ct-reach-card" href={TIKTOK_URL} target="_blank" rel="noreferrer">
              <span className="ct-reach-ic"><BrandIcon path={siTiktok.path} /></span>
              <span><small>TikTok</small><strong>{CONTACT.handle}</strong></span>
            </a>
            <div className="ct-reach-card ct-reach-static">
              <span className="ct-reach-ic"><MapPin size={20} /></span>
              <span><small>Based in</small><strong>Kuala Lumpur, Malaysia</strong></span>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
