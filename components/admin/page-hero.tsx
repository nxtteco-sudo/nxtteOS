import type { LucideIcon } from "lucide-react";

// Dark header with the pink aurora, shared by the admin and Documents pages.
export function PageHero({ kicker, title, accent, sub, actions, aside, slim = false }: {
  kicker: string;
  title: string;
  accent?: string;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  slim?: boolean;
}) {
  return (
    <section className={`ov-hero pg-hero ${slim ? "is-slim" : ""}`}>
      <div className="ov-aurora" aria-hidden="true"><i /><i /><i /></div>
      <div className="ov-hero-copy">
        <p className="ov-date">{kicker}</p>
        <h1>{title}{accent && <> <span>{accent}</span></>}</h1>
        {sub && <p className="ov-status">{sub}</p>}
        {actions && <div className="ov-actions">{actions}</div>}
      </div>
      {aside}
    </section>
  );
}

/** The glass number card on the right of a header. */
export function HeroStat({ icon: Icon, label, value, sub, progress }: { icon: LucideIcon; label: string; value: string; sub?: string; progress?: number }) {
  return (
    <div className="ov-money pg-stat">
      <span className="ov-money-label"><Icon size={16} /> {label}</span>
      <strong>{value}</strong>
      {progress !== undefined && <span className="pg-stat-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }} /></span>}
      {sub && <small>{sub}</small>}
    </div>
  );
}

/** Illustrated empty state: three floating icon tiles, a line of copy and an action. */
export function EmptyState({ icons, title, body, action }: { icons: [LucideIcon, LucideIcon, LucideIcon]; title: string; body: string; action?: React.ReactNode }) {
  const [A, B, C] = icons;
  return (
    <div className="pg-empty">
      <div className="pg-empty-art" aria-hidden="true">
        <span className="is-a"><A size={22} /></span>
        <span className="is-b"><B size={30} /></span>
        <span className="is-c"><C size={20} /></span>
      </div>
      <div>
        <h2>{title}</h2>
        <p>{body}</p>
        {action}
      </div>
    </div>
  );
}
