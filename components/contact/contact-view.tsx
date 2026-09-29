"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Check, Clock3, FileText, Loader2, Mail, MapPin, MessageCircle, Phone, Plus, Receipt, SendHorizontal, Tag, Ticket } from "lucide-react";
import { siInstagram, siTiktok } from "simple-icons";
import { PageShell, Eyebrow, delay, useRevealOnce, useInView, FAQ_ITEMS } from "@/components/home/home-page";
import { submitContactForm } from "@/app/contact/actions";
import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { contactSchema, SERVICE_INTERESTS, validateField } from "@/lib/validation/forms";

// AGENTS.md section 5: WhatsApp is the hero and the largest object on the page;
// the form is the fallback (five fields); "We reply within 24 hours" in writing;
// email and both socials below the fold.
const WHATSAPP_MESSAGE = "Hi nxtte, I'd like to talk about my business's social media.";

// TODO: real business email and handles (content gap, do not fabricate).
const EMAIL = "TODO_BUSINESS_EMAIL";
const INSTAGRAM_URL = "https://instagram.com/TODO_HANDLE";
const TIKTOK_URL = "https://tiktok.com/@TODO_HANDLE";

const FIELDS = [
  { name: "name", label: "Your name", autoComplete: "name", placeholder: "" },
  { name: "business", label: "Business name", autoComplete: "organization", placeholder: "" },
  { name: "instagram", label: "Instagram handle", autoComplete: "off", placeholder: "@yourbrand" },
  { name: "whatsapp", label: "WhatsApp number", autoComplete: "tel", placeholder: "+60 12 345 6789", type: "tel" },
] as const;

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

function ContactForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [values, setValues] = useState<Record<string, string>>({ name: "", business: "", instagram: "", whatsapp: "", service_interest: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const setValue = (name: string, value: string) => setValues((v) => ({ ...v, [name]: value }));
  const check = (name: string, value = values[name] ?? "") => {
    const message = validateField("contact", name, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  };

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const result = contactSchema.safeParse(values);
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    const data = new FormData();
    Object.entries(values).forEach(([k, v]) => data.set(k, v));
    start(async () => {
      const res = await submitContactForm(data);
      if (res.success) {
        trackEvent("contact_submit");
        router.push("/thanks");
        return;
      }
      if (res.fieldErrors) setErrors(res.fieldErrors);
      setFormError(res.error);
    });
  }

  const interestError = errors.service_interest;
  return (
    <form className="ct-form" onSubmit={submit} noValidate>
      <div className="ct-fields">
        {FIELDS.map((f) => {
          const error = errors[f.name];
          return (
            <div key={f.name} className={`ct-field ${error ? "has-error" : ""}`}>
              <label htmlFor={`ct-${f.name}`}>{f.label}</label>
              <input
                id={`ct-${f.name}`}
                name={f.name}
                type={"type" in f ? f.type : "text"}
                autoComplete={f.autoComplete}
                placeholder={f.placeholder}
                value={values[f.name]}
                onChange={(e) => { setValue(f.name, e.target.value); if (error) check(f.name, e.target.value); }}
                onBlur={() => check(f.name)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `ct-${f.name}-error` : undefined}
              />
              {error && <p id={`ct-${f.name}-error`} className="ct-error">{error}</p>}
            </div>
          );
        })}
      </div>
      <fieldset className={`ct-interest ${interestError ? "has-error" : ""}`} aria-describedby={interestError ? "ct-interest-error" : undefined}>
        <legend>What do you need help with?</legend>
        <div className="ct-chips">
          {SERVICE_INTERESTS.map((s) => (
            <label key={s} className={`ct-chip ${values.service_interest === s ? "is-on" : ""}`}>
              <input type="radio" name="service_interest" value={s} checked={values.service_interest === s} onChange={() => { setValue("service_interest", s); check("service_interest", s); }} />
              {values.service_interest === s && <Check size={14} strokeWidth={3} aria-hidden="true" />}
              {s}
            </label>
          ))}
        </div>
        {interestError && <p id="ct-interest-error" className="ct-error">{interestError}</p>}
      </fieldset>
      {formError && <p className="ct-form-error" role="alert">{formError}</p>}
      <button type="submit" className="ct-submit" disabled={pending}>
        {pending ? <Loader2 size={18} className="adm-spin" /> : <SendHorizontal size={18} />} {pending ? "Sending" : "Send my details"}
      </button>
      <p className="ct-fine"><Clock3 size={14} /> We reply within 24 hours, on WhatsApp.</p>
    </form>
  );
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
              <span className="ct-wa-inner">
                <span className="art-step" style={delay(0)}><Eyebrow light>Contact</Eyebrow></span>
                <span className="ct-wa-title art-step" style={delay(80)} role="heading" aria-level={1}>Let&rsquo;s talk <em>on WhatsApp.</em></span>
                <span className="ct-wa-sub art-step" style={delay(160)}>The fastest way to reach us. Tell us what your business does and what you need, and a real person replies.</span>
                <span className="ct-promise art-step" style={delay(220)}><Clock3 size={17} /> We reply within 24 hours.</span>
                <span className="ct-wa-btn art-step" style={delay(300)}>
                  <span><strong>Chat on WhatsApp</strong><small>Opens WhatsApp with a message ready to send</small></span>
                  <i aria-hidden="true"><MessageCircle size={32} /></i>
                </span>
              </span>
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
              <ContactForm />
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
              <span><small>Instagram</small><strong>@TODO_HANDLE</strong></span>
            </a>
            <a className="ct-reach-card" href={TIKTOK_URL} target="_blank" rel="noreferrer">
              <span className="ct-reach-ic"><BrandIcon path={siTiktok.path} /></span>
              <span><small>TikTok</small><strong>@TODO_HANDLE</strong></span>
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
