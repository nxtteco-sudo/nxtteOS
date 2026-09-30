"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock3, Loader2, SendHorizontal } from "lucide-react";
import { trackEvent, type TrackedEvent } from "@/lib/analytics";
import { formSchemas, validateField, type ActionResult, type FormKey } from "@/lib/validation/forms";

// Shared by /contact (5 fields) and /audit (4 fields), AGENTS.md section 8.
// Controlled inputs submitted via onSubmit, so a failed submit never clears
// what the visitor typed. Errors show on blur and on submit.
export type LeadField = { name: string; label: string; autoComplete?: string; placeholder?: string; type?: "text" | "tel" };

type Props = {
  formKey: FormKey;
  fields: LeadField[];
  choice?: { name: string; legend: string; options: readonly string[] };
  action: (data: FormData) => Promise<ActionResult>;
  event: TrackedEvent;
  submitLabel: string;
  fine: string;
  redirectTo?: string;
  legal?: React.ReactNode;
};

export function LeadForm({ formKey, fields, choice, action, event, submitLabel, fine, redirectTo = "/thanks", legal }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const names = [...fields.map((f) => f.name), ...(choice ? [choice.name] : [])];
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(names.map((n) => [n, ""])));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  // Spam trap: when the form appeared, sent with the hidden field below.
  const [startedAt] = useState(() => Date.now());

  const setValue = (name: string, value: string) => setValues((v) => ({ ...v, [name]: value }));
  const check = (name: string, value = values[name] ?? "") => {
    const message = validateField(formKey, name, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  };

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const result = formSchemas[formKey].safeParse(values);
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
    data.set("started", String(startedAt));
    data.set("website", (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "");
    start(async () => {
      const res = await action(data);
      if (res.success) {
        trackEvent(event);
        router.push(res.redirectTo ?? redirectTo);
        return;
      }
      if (res.fieldErrors) setErrors(res.fieldErrors);
      setFormError(res.error);
    });
  }

  const choiceError = choice ? errors[choice.name] : undefined;
  return (
    <form className="lf-form" onSubmit={submit} noValidate>
      <div className="lf-trap" aria-hidden="true"><label>Leave this empty<input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" /></label></div>
      <div className="lf-fields">
        {fields.map((f) => {
          const error = errors[f.name];
          const id = `${formKey}-${f.name}`;
          return (
            <div key={f.name} className={`lf-field ${error ? "has-error" : ""}`}>
              <label htmlFor={id}>{f.label}</label>
              <input
                id={id}
                name={f.name}
                type={f.type ?? "text"}
                autoComplete={f.autoComplete}
                placeholder={f.placeholder}
                value={values[f.name]}
                onChange={(e) => { setValue(f.name, e.target.value); if (error) check(f.name, e.target.value); }}
                onBlur={() => check(f.name)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
              />
              {error && <p id={`${id}-error`} className="lf-error">{error}</p>}
            </div>
          );
        })}
      </div>
      {choice && (
        <fieldset className={`lf-choice ${choiceError ? "has-error" : ""}`} aria-describedby={choiceError ? `${formKey}-choice-error` : undefined}>
          <legend>{choice.legend}</legend>
          <div className="lf-chips">
            {choice.options.map((o) => (
              <label key={o} className={`lf-chip ${values[choice.name] === o ? "is-on" : ""}`}>
                <input type="radio" name={choice.name} value={o} checked={values[choice.name] === o} onChange={() => { setValue(choice.name, o); check(choice.name, o); }} />
                {values[choice.name] === o && <Check size={14} strokeWidth={3} aria-hidden="true" />}
                {o}
              </label>
            ))}
          </div>
          {choiceError && <p id={`${formKey}-choice-error`} className="lf-error">{choiceError}</p>}
        </fieldset>
      )}
      {formError && <p className="lf-form-error" role="alert">{formError}</p>}
      <button type="submit" className="lf-submit" disabled={pending}>
        {pending ? <Loader2 size={18} className="adm-spin" /> : <SendHorizontal size={18} />} {pending ? "Sending" : submitLabel}
      </button>
      <p className="lf-fine"><Clock3 size={14} /> {fine}</p>
      {legal && <p className="lf-legal">{legal}</p>}
    </form>
  );
}
