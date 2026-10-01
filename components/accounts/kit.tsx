import Link from "next/link";

// Small server-safe pieces shared by the /accounts pages.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** 2100 -> "RM 2,100.00"; -199 -> "- RM 199.00" */
export function rm(n: number): string {
  const v = Math.round((n + Number.EPSILON) * 100) / 100;
  return `${v < 0 ? "- " : ""}RM ${Math.abs(v).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** 2026-10-01 -> "1 Oct 2026" */
export function shortDate(d: string): string {
  const [y, m, day] = d.split("-").map(Number);
  return `${day} ${MONTHS[m - 1]} ${y}`;
}

export const monthLabel = (key: string) => `${MONTHS_FULL[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`;

export function PeriodTabs({ current, options }: { current: string; options: { value: string; label: string; href: string }[] }) {
  return (
    <nav className="ac-tabs" aria-label="Period">
      {options.map((o) => <Link key={o.value} href={o.href} aria-current={current === o.value ? "page" : undefined}>{o.label}</Link>)}
    </nav>
  );
}

/** Money in (pink) and out (ink) side by side for each month. */
export function MonthChart({ series }: { series: { key: string; income: number; expenses: number }[] }) {
  const peak = Math.max(1, ...series.flatMap((m) => [m.income, m.expenses]));
  return (
    <div className="ac-chart-wrap">
      <div className="ac-chart" role="img" aria-label={`Money in and out over ${series.length} months`}>
        {series.map((m, i) => (
          <div key={m.key} className="ac-chart-col" title={`${monthLabel(m.key)}: in ${rm(m.income)}, out ${rm(m.expenses)}`}>
            <div className="ac-chart-bars">
              <i className="is-in" style={{ height: `${m.income ? Math.max(2, (m.income / peak) * 100) : 0}%` }} />
              <i className="is-out" style={{ height: `${m.expenses ? Math.max(2, (m.expenses / peak) * 100) : 0}%` }} />
            </div>
            <span>{MONTHS[Number(m.key.slice(5)) - 1]}{(m.key.endsWith("-01") || i === 0) && <small>{m.key.slice(0, 4)}</small>}</span>
          </div>
        ))}
      </div>
      <p className="ac-legend"><span><i className="is-in" /> Money in</span><span><i className="is-out" /> Money out</span><span className="ac-legend-hint">Hover a month for the exact figures</span></p>
    </div>
  );
}

/** Ranked rows with a proportional bar, for income by client or spend by category. */
export function BarList({ rows, tone = "in", empty }: { rows: { name: string; total: number; count?: number; href?: string }[]; tone?: "in" | "out"; empty: string }) {
  if (!rows.length) return <p className="ac-empty-line">{empty}</p>;
  const top = Math.max(...rows.map((r) => r.total), 1);
  return (
    <ul className="ac-bars">
      {rows.map((r) => {
        const label = r.href ? <Link href={r.href}>{r.name}</Link> : r.name;
        return (
          <li key={r.name}>
            <span className="ac-bars-top"><span className="ac-bars-name">{label}{r.count !== undefined && <small>{r.count}</small>}</span><b>{rm(r.total)}</b></span>
            <span className={`ac-bars-track is-${tone}`} aria-hidden="true"><i style={{ width: `${Math.max(2, (r.total / top) * 100)}%` }} /></span>
          </li>
        );
      })}
    </ul>
  );
}
