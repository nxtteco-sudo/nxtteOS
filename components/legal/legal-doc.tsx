import Link from "next/link";
import { PageShell, Eyebrow } from "@/components/home/home-page";
import { CONTACT } from "@/lib/site";

// Shared layout for /privacy, /terms and /refunds.
export type LegalSection = { title: string; body: React.ReactNode };

const LEGAL_LINKS = [
  ["/terms", "Terms"],
  ["/refunds", "Refunds"],
  ["/privacy", "Privacy"],
] as const;

export function LegalDoc({ eyebrow, title, lead, updated, current, sections }: { eyebrow: string; title: string; lead: string; updated: string; current: string; sections: LegalSection[] }) {
  return (
    <PageShell>
      <main className="lg">
        <div className="site-shell lg-shell">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1>{title}</h1>
          <p className="lg-lead">{lead}</p>
          <p className="lg-date">Last updated {updated}</p>
          <nav className="lg-tabs" aria-label="Legal pages">
            {LEGAL_LINKS.map(([href, label]) => (
              <Link key={href} href={href} aria-current={href === current ? "page" : undefined}>{label}</Link>
            ))}
          </nav>
          {sections.map((s) => (
            <section key={s.title}>
              <h2>{s.title}</h2>
              {s.body}
            </section>
          ))}
          <section>
            <h2>Questions</h2>
            <p>Email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or message us on WhatsApp. We reply within 24 hours.</p>
          </section>
        </div>
      </main>
    </PageShell>
  );
}
