"use client";

import { ArrowDown, BarChart3, CalendarRange, Camera, Clock3, Crosshair, Search, Ticket, UserRound } from "lucide-react";
import { StrippedShell, Eyebrow, delay, useRevealOnce, useInView } from "@/components/home/home-page";
import { LeadForm, type LeadField } from "@/components/forms/lead-form";
import { submitAuditRequest } from "@/app/audit/actions";

// AGENTS.md section 5, audit landing page: stripped header, no links out except
// the logo. Hero, what you get, sample, turnaround, the offer, 4-field form.

const FIELDS: LeadField[] = [
  { name: "name", label: "Your name", autoComplete: "name" },
  { name: "business", label: "Business name", autoComplete: "organization" },
  { name: "instagram", label: "Instagram handle", autoComplete: "off", placeholder: "@yourbrand" },
  { name: "whatsapp", label: "WhatsApp number", autoComplete: "tel", placeholder: "+60 12 345 6789", type: "tel" },
];

const PARTS = [
  { icon: UserRound, title: "Profile and bio teardown", body: "Line by line: what your profile says in the three seconds a visitor gives it, and what it should say." },
  { icon: BarChart3, title: "Content performance review", body: "Which posts earned attention, which earned enquiries, and why those are rarely the same posts." },
  { icon: Crosshair, title: "Competitor comparison", body: "What the businesses you compete with are doing, and where the gap you can take is." },
  { icon: Search, title: "Gap analysis", body: "Everything between a like and a booking that is leaking customers, in order of how much it costs you." },
];

const REPORT = ["Profile and bio", "Content review", "Competitors", "Gap analysis", "90-day roadmap"];

function useMotion() {
  const [ref, state] = useRevealOnce<HTMLDivElement>();
  const motion = state === "static" ? "" : state === "in" ? "anim-ready is-in" : "anim-ready";
  return [ref, motion] as const;
}

export function AuditView() {
  const [heroRef, heroMotion] = useMotion();
  const [getRef, getMotion] = useMotion();
  const [offerRef, offerMotion] = useMotion();
  const [secRef, inView] = useInView<HTMLElement>();

  return (
    <StrippedShell>
      <main>
        <section ref={secRef} className={`au-hero ${inView ? "" : "loop-paused"}`}>
          <div className="au-glow" aria-hidden="true"><i /><i /></div>
          <div ref={heroRef} className={`site-shell au-hero-grid ${heroMotion}`}>
            <div className="au-copy">
              <div className="art-step" style={delay(0)}><Eyebrow>The RM 199 audit</Eyebrow></div>
              <h1 className="art-step" style={delay(80)}>Find out why your content <em>is not converting.</em></h1>
              <p className="art-step" style={delay(160)}>A full review of your accounts, your content and your competitors, ending in a 90-day plan with weekly deliverables. RM 199, credited to your first month.</p>
              <div className="au-actions art-step" style={delay(240)}>
                <a className="au-btn" href="#audit-form">Book the audit <ArrowDown size={17} /></a>
                <span className="au-meta"><Clock3 size={16} /> Delivered in 5 working days</span>
              </div>
            </div>

            <div className="au-report art-step" style={delay(200)} aria-hidden="true">
              <span className="au-page au-page-3" />
              <span className="au-page au-page-2" />
              <div className="au-page au-page-1">
                <span className="au-report-top"><b>nxtte</b><i>Social media audit</i></span>
                <strong>Your business</strong>
                <small>Prepared for the owner</small>
                <ol>{REPORT.map((r, i) => <li key={r}><b>0{i + 1}</b>{r}</li>)}</ol>
                <span className="au-scan" />
              </div>
              <span className="au-badge"><Ticket size={16} /> RM 199, credited to month one</span>
            </div>
          </div>
        </section>

        <section className="au-get">
          <div ref={getRef} className={`site-shell ${getMotion}`}>
            <div className="au-head art-step" style={delay(0)}>
              <Eyebrow>What you get</Eyebrow>
              <h2>Five parts. <em>One plan you can act on.</em></h2>
            </div>
            <div className="au-get-grid">
              {PARTS.map(({ icon: Icon, title, body }, i) => (
                <article key={title} className="au-part art-step" style={delay(120 + i * 90)}>
                  <span className="au-part-n">0{i + 1}</span>
                  <span className="au-part-ic" aria-hidden="true"><Icon size={20} /></span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
              <article className="au-part au-part-road art-step" style={delay(480)}>
                <span className="au-part-n">05</span>
                <span className="au-part-ic" aria-hidden="true"><CalendarRange size={20} /></span>
                <h3>90-day roadmap with weekly deliverables</h3>
                <p>The part that matters most: what to post, fix and build, week by week, for the next 12 weeks.</p>
                <ol className="au-weeks" aria-hidden="true">
                  {Array.from({ length: 12 }, (_, w) => <li key={w} style={{ "--w": w } as React.CSSProperties}>W{w + 1}</li>)}
                </ol>
              </article>
            </div>
          </div>
        </section>

        <section className="au-sample">
          <div className="site-shell">
            <div className="au-head">
              <Eyebrow>Sample pages</Eyebrow>
              <h2>What the report <em>looks like.</em></h2>
            </div>
            {/* TODO: two or three screenshots of a real audit deliverable (AGENTS.md
                section 5). Produce one for a real business first, even unpaid. No mockups. */}
            <div className="au-sample-grid">
              {[1, 2, 3].map((n) => (
                <div key={n} className="au-shot">
                  <Camera size={22} aria-hidden="true" />
                  <span>TODO: real audit screenshot {n}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="au-offer dark-band">
          <div ref={offerRef} className={`site-shell au-offer-grid ${offerMotion}`}>
            <div className="au-ticket art-step" style={delay(0)}>
              <span className="au-ticket-label">The offer</span>
              <strong>RM 199</strong>
              <span className="au-ticket-line">Fully credited against your first month if you sign a package within 14 days.</span>
              <span className="au-ticket-tear" aria-hidden="true" />
              <span className="au-ticket-foot"><Clock3 size={16} /> Delivered in 5 working days</span>
            </div>
            <div className="au-offer-copy art-step" style={delay(120)}>
              <Eyebrow light>Why it is RM 199</Eyebrow>
              <h2>The audit is not the product. <em>The gap it shows you is.</em></h2>
              <p>You get a plan specific enough to act on yourself. If you would rather we act on it, the RM 199 comes off your first month.</p>
            </div>
          </div>
        </section>

        <section id="audit-form" className="au-form">
          <div className="site-shell au-form-grid">
            <div className="au-form-copy">
              <Eyebrow>Book your audit</Eyebrow>
              <h2>Four fields. <em>We take it from there.</em></h2>
              <p>We message you on WhatsApp within 24 hours to confirm and to ask for access to what we need.</p>
            </div>
            <div className="au-form-card">
              <LeadForm formKey="audit" fields={FIELDS} action={submitAuditRequest} event="audit_submit" submitLabel="Book the RM 199 audit" fine="We will WhatsApp you within 24 hours." />
            </div>
          </div>
        </section>
      </main>
    </StrippedShell>
  );
}
