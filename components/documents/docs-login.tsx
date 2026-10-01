import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { HeroBackground } from "@/components/home/home-page";
import { docsSignIn } from "@/app/documents/actions";

// Same look as the admin login, for the private Documents dashboard.
export function DocsLogin() {
  return (
    <main className="adm-login">
      <HeroBackground />
      <div className="adm-login-card">
        <div className="adm-login-top">
          <span className="logo-badge adm-login-logo"><Image src="/brand/nxtte-logo.png" alt="nxtte" width={480} height={204} priority sizes="120px" /></span>
          <span className="adm-login-tag">Documents</span>
        </div>
        <h1>Welcome back<span>.</span></h1>
        <p>Proposals, invoices and receipts, on the nxtte templates.</p>
        <LoginForm action={docsSignIn} />
        <div className="adm-login-foot">
          <span><ShieldCheck size={15} aria-hidden="true" /> Approved accounts only</span>
          <Link href="/"><ArrowLeft size={15} aria-hidden="true" /> Back to nxtte.com</Link>
        </div>
      </div>
    </main>
  );
}
