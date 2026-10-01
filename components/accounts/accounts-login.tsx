import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { HeroBackground } from "@/components/home/home-page";
import { accountsSignIn } from "@/app/accounts/actions";

// Same look as the admin and Documents sign-in, for the private Accounts dashboard.
export function AccountsLogin() {
  return (
    <main className="adm-login">
      <HeroBackground />
      <div className="adm-login-card">
        <div className="adm-login-top">
          <span className="logo-badge adm-login-logo"><Image src="/brand/nxtte-logo.png" alt="nxtte" width={480} height={204} priority sizes="120px" /></span>
          <span className="adm-login-tag">Accounts</span>
        </div>
        <h1>Welcome back<span>.</span></h1>
        <p>Income, expenses and profit, with invoices and receipts flowing in on their own.</p>
        <LoginForm action={accountsSignIn} />
        <div className="adm-login-foot">
          <span><ShieldCheck size={15} aria-hidden="true" /> Approved accounts only</span>
          <Link href="/"><ArrowLeft size={15} aria-hidden="true" /> Back to nxtte.com</Link>
        </div>
      </div>
    </main>
  );
}
