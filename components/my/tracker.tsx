import { Check, Clock3 } from "lucide-react";
import { auditSteps, type Audit } from "@/types/audit";

// The five-step status tracker at the top of the customer's overview.
export function Tracker({ audit }: { audit: Audit }) {
  const steps = auditSteps(audit);
  const done = steps.filter((s) => s.state === "done").length;
  return (
    <ol className="my-track" aria-label={`Progress: ${done} of ${steps.length} steps complete`} style={{ "--fill": `${((done - 1) / (steps.length - 1)) * 100}%` } as React.CSSProperties}>
      {steps.map((s, i) => (
        <li key={s.key} className={`is-${s.state}`} aria-current={s.state === "current" || s.state === "waiting" ? "step" : undefined}>
          <span className="my-track-dot" aria-hidden="true">
            {s.state === "done" ? <Check size={17} strokeWidth={3} /> : s.state === "waiting" ? <Clock3 size={16} /> : i + 1}
          </span>
          <strong>{s.label}</strong>
          <small>{s.hint}</small>
        </li>
      ))}
    </ol>
  );
}
