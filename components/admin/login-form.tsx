"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2, LockKeyhole, Mail } from "lucide-react";
import { signIn } from "@/app/admin/actions";

type SignInAction = (prev: { error: string } | null, formData: FormData) => Promise<{ error: string }>;

// Shared by the admin and Documents sign-in pages.
export function LoginForm({ action: signInAction = signIn }: { action?: SignInAction }) {
  const [state, action, pending] = useActionState(signInAction, null);
  return (
    <form action={action} className="adm-form">
      <label className="adm-field adm-field-ic">
        <span>Email</span>
        <span className="adm-input-wrap"><Mail size={17} aria-hidden="true" /><input name="email" type="email" autoComplete="email" placeholder="you@nxtte.com" required /></span>
      </label>
      <label className="adm-field adm-field-ic">
        <span>Password</span>
        <span className="adm-input-wrap"><LockKeyhole size={17} aria-hidden="true" /><input name="password" type="password" autoComplete="current-password" required /></span>
      </label>
      {state?.error && <p className="adm-error" role="alert">{state.error}</p>}
      <button type="submit" className="adm-btn adm-btn-primary adm-btn-wide" disabled={pending}>
        {pending ? <Loader2 size={16} className="adm-spin" /> : null} Sign in {!pending && <ArrowRight size={16} />}
      </button>
    </form>
  );
}
