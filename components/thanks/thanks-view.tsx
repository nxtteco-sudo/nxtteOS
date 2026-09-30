"use client";

import Link from "next/link";
import { ArrowLeft, Check, MessageCircle } from "lucide-react";
import { siInstagram, siTiktok } from "simple-icons";
import { PageShell, Eyebrow, delay, useRevealOnce } from "@/components/home/home-page";
import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppLink } from "@/lib/whatsapp";

// AGENTS.md section 5 /thanks: confirmation with a time promise, a WhatsApp
// button for anyone who wants to start now, Instagram and TikTok links. The
// conversion pixel is fired by the page (MetaPixelLead).
// TODO: real nxtte handles (content gap, do not fabricate).
const INSTAGRAM_URL = "https://instagram.com/TODO_HANDLE";
const TIKTOK_URL = "https://tiktok.com/@TODO_HANDLE";

const NEXT = [
  { when: "Within 24 hours", text: "We message you on WhatsApp to confirm and ask any questions." },
  { when: "Then", text: "We look at your accounts before we talk, so the conversation is about your business." },
  { when: "After that", text: "You get a clear next step, at the published price." },
];

function BrandIcon({ path }: { path: string }) {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={path} /></svg>;
}

export function ThanksView() {
  const [ref, state] = useRevealOnce<HTMLDivElement>();
  const motion = state === "static" ? "" : state === "in" ? "anim-ready is-in" : "anim-ready";
  return (
    <PageShell>
      <main className="tk">
        <div className="tk-glow" aria-hidden="true"><i /><i /></div>
        <div ref={ref} className={`site-shell tk-grid ${motion}`}>
          <div className="tk-copy">
            <span className="tk-check art-step" style={delay(0)} aria-hidden="true"><Check size={40} strokeWidth={3} /></span>
            <div className="art-step" style={delay(120)}><Eyebrow light>Got it, thank you</Eyebrow></div>
            <h1 className="art-step" style={delay(180)}>We will WhatsApp you <em>within 24 hours.</em></h1>
            <p className="art-step" style={delay(260)}>Your details are with us. Would you rather start right now? Message us directly.</p>
            <div className="tk-actions art-step" style={delay(340)}>
              <a className="tk-wa" href={buildWhatsAppLink("Hi nxtte, I just sent my details and I'd like to start now.")} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { source: "thanks" })}>
                <MessageCircle size={20} /> Chat on WhatsApp
              </a>
              <a className="tk-social" href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="nxtte on Instagram"><BrandIcon path={siInstagram.path} /></a>
              <a className="tk-social" href={TIKTOK_URL} target="_blank" rel="noreferrer" aria-label="nxtte on TikTok"><BrandIcon path={siTiktok.path} /></a>
            </div>
            <Link href="/" className="tk-home art-step" style={delay(400)}><ArrowLeft size={15} /> Back to the homepage</Link>
          </div>
          <ol className="tk-next">
            {NEXT.map((n, i) => (
              <li key={n.when} className="art-step" style={delay(300 + i * 140)}>
                <b>{i + 1}</b>
                <span><small>{n.when}</small>{n.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </main>
    </PageShell>
  );
}
