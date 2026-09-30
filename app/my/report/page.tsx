import Link from "next/link";
import { ArrowRight, BarChart3, CalendarRange, Crosshair, Download, Lock, MessageCircle, Search, UserRound } from "lucide-react";
import { requireMyAudit } from "@/lib/customer";
import { formatRM, packages, priceToNumber } from "@/lib/pricing";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { creditDeadline, expectedDelivery, formatDate } from "@/types/audit";

const PARTS = [
  { icon: UserRound, label: "Profile and bio teardown" },
  { icon: BarChart3, label: "Content performance review" },
  { icon: Crosshair, label: "Competitor comparison" },
  { icon: Search, label: "Gap analysis" },
  { icon: CalendarRange, label: "90-day roadmap with weekly deliverables" },
];

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ download?: string }> }) {
  const audit = await requireMyAudit();
  const { download } = await searchParams;
  const ready = Boolean(audit.report_ready_at && audit.report_path);
  const credit = creditDeadline(audit);
  const daysLeft = credit ? Math.ceil((credit.getTime() - Date.now()) / 86_400_000) : 0;
  const due = expectedDelivery(audit);

  return (
    <div className="my-page">
      <header className="my-head">
        <p className="my-kicker">Step 6 of 6</p>
        <h1>Your report<span>.</span></h1>
        <p>{ready ? "Your audit and 90-day roadmap, ready to download." : "Your audit and 90-day roadmap will appear here as soon as they are done."}</p>
      </header>

      {ready ? (
        <section className="my-report-ready">
          <div>
            <span className="my-next-label">Delivered {formatDate(audit.report_ready_at as string)}</span>
            <h2>Social media audit for {audit.business}</h2>
            <p>Five parts, ending in a 90-day roadmap with weekly deliverables.</p>
            {download === "failed" && <p className="my-error my-error-box" role="alert">The download link could not be created. Try again, or message us.</p>}
          </div>
          <a className="my-btn my-btn-light" href="/my/report/download"><Download size={18} /> Download the report (PDF)</a>
        </section>
      ) : (
        <section className="my-card my-locked">
          <span className="my-tip-ic"><Lock size={18} /></span>
          <div>
            <h2>Not ready yet</h2>
            <p>{due ? `We have everything we need. Expected by ${formatDate(due)}.` : "We start once we have your details and your payment, and deliver within five working days."}</p>
          </div>
          <ol className="my-parts">{PARTS.map(({ icon: Icon, label }, i) => <li key={label}><span><Icon size={17} /></span><em>0{i + 1}</em>{label}</li>)}</ol>
        </section>
      )}

      {ready && credit && (
        <section className="my-upgrade">
          <div className="my-upgrade-head">
            <div>
              <h2>Want us to do the roadmap for you?</h2>
              <p>{daysLeft > 0
                ? <>Sign a package by <strong>{formatDate(credit)}</strong> and your RM {audit.amount} comes off the first month.</>
                : <>Your RM {audit.amount} credit ended on {formatDate(credit)}. The packages below are at their published prices.</>}</p>
            </div>
            {daysLeft > 0 && <span className="my-countdown"><strong>{daysLeft}</strong> day{daysLeft === 1 ? "" : "s"} left on your credit</span>}
          </div>
          <ul className="my-packs">
            {packages.map((p) => {
              const price = priceToNumber(p.price);
              return (
                <li key={p.name} className={p.featured ? "is-feat" : ""}>
                  {p.featured && <span className="my-pack-tag">Most popular</span>}
                  <strong>{p.name}</strong>
                  <span className="my-pack-price">{p.price}<small>/mo</small></span>
                  {daysLeft > 0 && <span className="my-pack-first">First month {formatRM(price - audit.amount)}</span>}
                  <p>{p.detail}</p>
                  <a className="my-btn my-btn-dark my-btn-wide" target="_blank" rel="noreferrer" href={buildWhatsAppLink(`Hi nxtte, I have my audit (${audit.reference ?? audit.business}) and I'd like to start the ${p.name} package.`)}>
                    <MessageCircle size={16} /> Start {p.name}
                  </a>
                </li>
              );
            })}
          </ul>
          <Link className="my-link" href="/services#packages">Compare everything in each package <ArrowRight size={15} /></Link>
        </section>
      )}
    </div>
  );
}
