"use client";

// Client pieces of the customer dashboard (/my): the shell with its nav, the
// sign-in form, the details form, the payment panel and the message thread.
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ClipboardList, Copy, CreditCard, FileText, KeyRound, LayoutDashboard, Loader2, Store, LogOut, MessageCircle, MessagesSquare, Paperclip, SendHorizontal } from "lucide-react";
import { claimPayment, markMessagesRead, requestLink, saveDetails, sendMessage, signInCustomer, signOutCustomer } from "@/app/my/actions";
import { auditDetailsSchema } from "@/lib/validation/forms";
import { formatDate, type Audit, type AuditMessage, type PaymentSettings } from "@/types/audit";

export type NavBadge = { text: string; tone: "done" | "todo" | "wait" | "new" | "lock" } | null;
export type NavState = { details: NavBadge; payment: NavBadge; messages: NavBadge; report: NavBadge };

const NAV = [
  { href: "/my", label: "Overview", icon: LayoutDashboard, key: null },
  { href: "/my/details", label: "My details", icon: ClipboardList, key: "details" },
  { href: "/my/payment", label: "Payment", icon: CreditCard, key: "payment" },
  { href: "/my/messages", label: "Messages", icon: MessagesSquare, key: "messages" },
  { href: "/my/report", label: "Report", icon: FileText, key: "report" },
] as const;

export function MyShell({ business, reference, nav, helpHref, children }: { business: string; reference: string | null; nav: NavState; helpHref: string; children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="my">
      <header className="my-top">
        <Link href="/" className="logo-lockup" aria-label="nxtte home">
          <span className="logo-badge"><Image src="/brand/nxtte-logo.png" alt="nxtte" width={480} height={204} priority sizes="120px" /></span>
        </Link>
        <span className="my-top-biz"><strong>{business}</strong>{reference && <small>Ref {reference}</small>}</span>
        <form action={signOutCustomer}><button type="submit" className="my-signout"><LogOut size={16} /> <span>Sign out</span></button></form>
      </header>
      <div className="my-body">
        <aside className="my-side">
          <nav className="my-nav" aria-label="Your audit">
            {NAV.map(({ href, label, icon: Icon, key }) => {
              const badge = key ? nav[key] : null;
              const active = href === "/my" ? path === "/my" : path.startsWith(href);
              return (
                <Link key={href} href={href} aria-current={active ? "page" : undefined}>
                  <Icon size={19} />
                  <span>{label}</span>
                  {badge && <em className={`my-badge is-${badge.tone} ${/^\d+$/.test(badge.text) ? "is-num" : ""}`}>{badge.text}</em>}
                </Link>
              );
            })}
          </nav>
          <a className="my-help" href={helpHref} target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            <span><strong>Need a hand?</strong><small>WhatsApp us. We reply within 24 hours.</small></span>
          </a>
        </aside>
        <main className="my-main">{children}</main>
      </div>
    </div>
  );
}

export function SignInForm() {
  const [mode, setMode] = useState<"password" | "link">("password");
  const [login, loginAction, loginPending] = useActionState(signInCustomer, null);
  const [link, linkAction, linkPending] = useActionState(requestLink, null);

  if (mode === "link" && link?.sent) {
    return (
      <div className="my-sent" role="status">
        <span><Check size={22} strokeWidth={3} /></span>
        <strong>Check your email.</strong>
        <p>If that address has an audit with us, a link to your dashboard is on its way.</p>
      </div>
    );
  }

  if (mode === "link") {
    return (
      <form action={linkAction} className="my-signin-form">
        <label htmlFor="my-link-email">Your email</label>
        <input id="my-link-email" name="email" type="email" autoComplete="email" placeholder="you@business.com" required />
        {link?.error && <p className="my-error" role="alert">{link.error}</p>}
        <button type="submit" className="my-btn my-btn-dark my-btn-wide" disabled={linkPending}>
          {linkPending && <Loader2 size={17} className="my-spin" />} Email me a sign-in link
        </button>
        <button type="button" className="my-textbtn" onClick={() => setMode("password")}>Back to password sign-in</button>
      </form>
    );
  }

  return (
    <form action={loginAction} className="my-signin-form">
      <label htmlFor="my-email">Email</label>
      <input id="my-email" name="email" type="email" autoComplete="email" placeholder="you@business.com" required />
      <label htmlFor="my-password">Password</label>
      <input id="my-password" name="password" type="password" autoComplete="current-password" required />
      {login?.error && <p className="my-error" role="alert">{login.error}</p>}
      <button type="submit" className="my-btn my-btn-dark my-btn-wide" disabled={loginPending}>
        {loginPending && <Loader2 size={17} className="my-spin" />} Sign in
      </button>
      <button type="button" className="my-textbtn" onClick={() => setMode("link")}>Forgot your password? Email me a link</button>
    </form>
  );
}

const DETAIL_FIELDS = [
  { name: "email", label: "Your email", hint: "You sign in with this, and we send updates here.", type: "email", required: true, rows: 0, placeholder: "you@business.com" },
  { name: "password", label: "Create a password", hint: "At least 8 characters. You use it with your email to sign in again.", type: "password", required: true, rows: 0, placeholder: "" },
  { name: "goals", label: "What do you want from your social media?", hint: "More bookings, more walk-ins, more online orders? Say it in your own words.", required: true, rows: 3, placeholder: "" },
  { name: "ideal_customer", label: "Who is your best customer?", hint: "Age, area, what they usually buy.", rows: 2, placeholder: "" },
  { name: "best_sellers", label: "What do you most want to sell more of?", hint: "Your best sellers, or what makes you the most money.", rows: 2, placeholder: "" },
  { name: "competitors", label: "Who do you compete with?", hint: "Two or three Instagram handles or business names.", rows: 2, placeholder: "@competitor.one, @competitor.two" },
  { name: "other_platforms", label: "Other accounts we should review", hint: "TikTok, Facebook page, website.", rows: 0, placeholder: "" },
  { name: "notes", label: "Anything else we should know?", hint: "What you have tried before, what did not work.", rows: 3, placeholder: "" },
] as const;

type DetailField = (typeof DETAIL_FIELDS)[number];
const LOGIN_FIELDS: readonly string[] = ["email", "password"];

export function DetailsForm({ audit, hasPassword }: { audit: Audit; hasPassword: boolean }) {
  const router = useRouter();
  const initial = Object.fromEntries(DETAIL_FIELDS.map((f) => [f.name, f.name === "password" ? "" : ((audit[f.name] as string | null) ?? "")])) as Record<string, string>;
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const check = (name: string, value = values[name]) => {
    const field = (auditDetailsSchema.shape as Record<string, { safeParse: (v: unknown) => { success: boolean; error?: { issues: { message: string }[] } } }>)[name];
    const res = field.safeParse(value);
    setErrors((prev) => {
      const next = { ...prev };
      if (res.success) delete next[name];
      else next[name] = res.error?.issues[0]?.message ?? "Check this field";
      return next;
    });
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaved(false);
    start(async () => {
      const res = await saveDetails(values);
      if (!res.ok) {
        if (res.fieldErrors) setErrors(res.fieldErrors);
        setFormError(res.error);
        return;
      }
      setSaved(true);
      setValues((v) => ({ ...v, password: "" }));
      router.refresh();
    });
  }

  const renderField = (f: DetailField, n?: number) => {
    const id = `d-${f.name}`;
    const error = errors[f.name];
    const common = {
      id,
      name: f.name,
      value: values[f.name],
      placeholder: f.placeholder,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": `${id}-hint${error ? ` ${id}-error` : ""}`,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setValues((v) => ({ ...v, [f.name]: e.target.value })); setSaved(false); if (error) check(f.name, e.target.value); },
      onBlur: () => check(f.name),
    };
    const isPassword = f.name === "password";
    const required = "required" in f && f.required && !(isPassword && hasPassword);
    const filled = !isPassword && values[f.name].trim() !== "";
    return (
      <div key={f.name} className={`my-field ${error ? "has-error" : ""} ${filled ? "is-filled" : ""}`}>
        <label htmlFor={id}>
          {n !== undefined && <b className="my-qn" aria-hidden="true">{filled ? <Check size={14} strokeWidth={3} /> : String(n).padStart(2, "0")}</b>}
          <span>{isPassword && hasPassword ? "Change your password" : f.label}{required ? <i aria-hidden="true"> *</i> : <em> optional</em>}</span>
        </label>
        <p id={`${id}-hint`} className="my-hint">{isPassword && hasPassword ? "Leave this empty to keep your current password." : f.hint}</p>
        {f.rows ? <textarea rows={f.rows} {...common} /> : <input type={"type" in f ? f.type : "text"} autoComplete={f.name === "email" ? "email" : isPassword ? "new-password" : "off"} {...common} />}
        {error && <p id={`${id}-error`} className="my-error">{error}</p>}
      </div>
    );
  };

  const loginFields = DETAIL_FIELDS.filter((f) => LOGIN_FIELDS.includes(f.name));
  const businessFields = DETAIL_FIELDS.filter((f) => !LOGIN_FIELDS.includes(f.name));
  const answered = businessFields.filter((f) => values[f.name].trim() !== "").length;

  return (
    <form className="my-form" onSubmit={submit} noValidate>
      <fieldset className="my-fs my-fs-login">
        <legend className="my-fs-head">
          <span className="my-fs-ic"><KeyRound size={19} /></span>
          <span><strong>Your login</strong><small>How you get back into this dashboard</small></span>
        </legend>
        <div className="my-fs-grid">{loginFields.map((f) => renderField(f))}</div>
      </fieldset>

      <fieldset className="my-fs my-fs-biz">
        <legend className="my-fs-head">
          <span className="my-fs-ic"><Store size={19} /></span>
          <span><strong>About your business</strong><small>{answered} of {businessFields.length} answered</small></span>
        </legend>
        <div className="my-fs-bar" aria-hidden="true"><i style={{ "--p": answered / businessFields.length } as React.CSSProperties} /></div>
        {businessFields.map((f, i) => renderField(f, i + 1))}
      </fieldset>

      {formError && <p className="my-error my-error-box" role="alert">{formError}</p>}
      <div className="my-form-foot">
        <button type="submit" className="my-btn my-btn-pink" disabled={pending}>
          {pending ? <Loader2 size={17} className="my-spin" /> : <Check size={17} />} {audit.details_submitted_at ? "Save changes" : "Send my details"}
        </button>
        {saved ? <span className="my-saved" role="status"><Check size={15} strokeWidth={3} /> Saved</span> : <span className="my-foot-note">You can change these any time before we start.</span>}
      </div>
    </form>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-pay-row">
      <span><small>{label}</small><strong>{value}</strong></span>
      <button type="button" className="my-copy" onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked: the value is still visible to copy by hand */ } }}>
        {copied ? <><Check size={15} strokeWidth={3} /> Copied</> : <><Copy size={15} /> Copy</>}
      </button>
    </div>
  );
}

export function PaymentPanel({ audit, settings, helpHref }: { audit: Audit; settings: PaymentSettings; helpHref: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const hasDetails = Boolean(settings.account_number || settings.duitnow_id);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    start(async () => {
      const res = await claimPayment(data);
      if (!res.ok) return setError(res.error);
      router.refresh();
    });
  }

  if (!hasDetails) {
    return (
      <div className="my-card my-pay-none">
        <h2>We will send you the payment details</h2>
        <p>You will get the bank and DuitNow details for RM {audit.amount} on WhatsApp. Once you have paid, come back here and tell us.</p>
        <a className="my-btn my-btn-pink" href={helpHref} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Ask for payment details</a>
      </div>
    );
  }

  return (
    <div className="my-card my-pay">
      <h2>Pay by bank transfer or DuitNow</h2>
      <ol className="my-pay-steps">
        <li><b>1</b>Transfer RM {audit.amount} using the details below.</li>
        <li><b>2</b>Use your reference so we can match it.</li>
        <li><b>3</b>Tell us you have paid. We confirm within one working day.</li>
      </ol>
      <div className="my-pay-rows">
        <CopyRow label="Amount" value={`RM ${audit.amount}.00`} />
        {audit.reference && <CopyRow label="Payment reference" value={audit.reference} />}
        {settings.bank_name && <CopyRow label="Bank" value={settings.bank_name} />}
        {settings.account_name && <CopyRow label="Account name" value={settings.account_name} />}
        {settings.account_number && <CopyRow label="Account number" value={settings.account_number} />}
        {settings.duitnow_id && <CopyRow label="DuitNow ID" value={settings.duitnow_id} />}
      </div>
      {settings.note && <p className="my-hint">{settings.note}</p>}
      <form onSubmit={submit} className="my-pay-claim">
        <label className="my-file">
          <Paperclip size={16} />
          <span>{fileName || "Attach your receipt (optional)"}</span>
          <input type="file" name="proof" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
        </label>
        {error && <p className="my-error" role="alert">{error}</p>}
        <button type="submit" className="my-btn my-btn-dark my-btn-wide" disabled={pending}>
          {pending ? <Loader2 size={17} className="my-spin" /> : <Check size={17} />} I have paid RM {audit.amount}
        </button>
      </form>
    </div>
  );
}

export function MessageThread({ messages, firstName }: { messages: AuditMessage[]; firstName: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [messages.length]);
  useEffect(() => {
    if (messages.some((m) => m.sender === "nxtte" && !m.read_at)) void markMessagesRead();
  }, [messages]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    start(async () => {
      const res = await sendMessage(text);
      if (!res.ok) return setError(res.error);
      setText("");
      router.refresh();
    });
  }

  return (
    <div className="my-card my-chat">
      <div className="my-chat-log" role="log" aria-live="polite" aria-label="Messages with nxtte">
        <div className="my-msg is-nxtte"><p>Hi {firstName}, this is nxtte. Ask us anything about your audit here and we will reply within 24 hours.</p></div>
        {messages.map((m) => (
          <div key={m.id} className={`my-msg ${m.sender === "nxtte" ? "is-nxtte" : "is-me"}`}>
            <p>{m.body}</p>
            <time dateTime={m.created_at}>{m.sender === "nxtte" ? "nxtte" : "You"} · {formatDate(m.created_at)}</time>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form className="my-chat-form" onSubmit={submit}>
        <label htmlFor="my-message" className="my-sr">Your message</label>
        <textarea id="my-message" rows={2} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e); }} />
        <button type="submit" className="my-btn my-btn-pink" disabled={pending || !text.trim()}>
          {pending ? <Loader2 size={17} className="my-spin" /> : <SendHorizontal size={17} />} Send
        </button>
      </form>
      {error && <p className="my-error" role="alert">{error}</p>}
    </div>
  );
}
