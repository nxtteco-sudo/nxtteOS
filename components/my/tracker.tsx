import { CalendarCheck, Check, ClipboardList, Clock3, CreditCard, FileText, ScanSearch, ShieldCheck } from "lucide-react";
import { auditSteps, type Audit, type AuditStep } from "@/types/audit";

const ICONS: Record<AuditStep["key"], typeof Check> = {
  booked: CalendarCheck, details: ClipboardList, review: ShieldCheck, payment: CreditCard, audit: ScanSearch, report: FileText,
};

// The status tracker on the customer's overview (and the admin audit page).
export function Tracker({ audit }: { audit: Audit }) {
  const steps = auditSteps(audit);
  const done = steps.filter((s) => s.state === "done").length;
  // The line fills up to the last finished step.
  const reached = Math.max(0, steps.map((s) => s.state).lastIndexOf("done"));
  return (
    <ol className="my-track" aria-label={`Progress: ${done} of ${steps.length} steps complete`} style={{ "--n": steps.length, "--fill": reached / (steps.length - 1) } as React.CSSProperties}>
      {steps.map((s, i) => {
        const Icon = s.state === "done" ? Check : s.state === "waiting" ? Clock3 : ICONS[s.key];
        return (
          <li key={s.key} className={`is-${s.state}`} style={{ "--i": i } as React.CSSProperties} aria-current={s.state === "current" || s.state === "waiting" ? "step" : undefined}>
            <span className="my-track-dot" aria-hidden="true"><Icon size={18} strokeWidth={s.state === "done" ? 3 : 2} /></span>
            <strong>{s.label}</strong>
            <small>{s.hint}</small>
          </li>
        );
      })}
    </ol>
  );
}
