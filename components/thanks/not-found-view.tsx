"use client";

import Link from "next/link";
import { ArrowUpRight, Home, MessageCircle } from "lucide-react";
import { PageShell, Eyebrow, whatsappHref } from "@/components/home/home-page";
import { trackEvent } from "@/lib/analytics";

// AGENTS.md section 11: a styled 404 with a route back to Home.
const ROUTES = [
  { href: "/services", label: "Packages and prices" },
  { href: "/about", label: "Who we are" },
  { href: "/contact", label: "Contact us" },
];

export function NotFoundView() {
  return (
    <PageShell>
      <main className="nf">
        <div className="tk-glow" aria-hidden="true"><i /><i /></div>
        <div className="site-shell nf-grid">
          <div className="nf-tile" aria-hidden="true">
            <span className="nf-tile-top"><i /><b>nxtte</b></span>
            <strong>404</strong>
            <span className="nf-tile-foot">This post did not make the calendar.</span>
          </div>
          <div className="nf-copy">
            <Eyebrow>Page not found</Eyebrow>
            <h1>That page <em>does not exist.</em></h1>
            <p>The link may be out of date, or the page has moved. Here is where to go instead.</p>
            <div className="nf-actions">
              <Link className="nf-btn" href="/"><Home size={17} /> Back to the homepage</Link>
              <a className="nf-btn nf-btn-pink" href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { source: "404" })}><MessageCircle size={17} /> WhatsApp us</a>
            </div>
            <ul className="nf-routes">
              {ROUTES.map((r) => <li key={r.href}><Link href={r.href}>{r.label} <ArrowUpRight size={15} /></Link></li>)}
            </ul>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
