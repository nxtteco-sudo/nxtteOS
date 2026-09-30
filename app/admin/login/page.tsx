import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getAdminUser, isAdminConfigured } from "@/lib/auth/admin";
import { LoginForm } from "@/components/admin/login-form";
import { HeroBackground } from "@/components/home/home-page";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAdminUser()) redirect("/admin");
  return (
    <main className="adm-login">
      <HeroBackground />
      <div className="adm-login-card">
        <div className="adm-login-top">
          <span className="logo-badge adm-login-logo"><Image src="/brand/nxtte-logo.png" alt="nxtte" width={480} height={204} priority sizes="120px" /></span>
          <span className="adm-login-tag">Admin</span>
        </div>
        <h1>Welcome back<span>.</span></h1>
        <p>Leads, audits, case studies and Insights, all in one place.</p>
        {isAdminConfigured() ? (
          <LoginForm />
        ) : (
          <p className="adm-notice" role="status">
            The admin portal is not connected yet. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and
            SUPABASE_SERVICE_ROLE_KEY to the environment, then run supabase/migrations/0003_insights_admin.sql.
          </p>
        )}
        <div className="adm-login-foot">
          <span><ShieldCheck size={15} aria-hidden="true" /> Team accounts only</span>
          <Link href="/"><ArrowLeft size={15} aria-hidden="true" /> Back to nxtte.com</Link>
        </div>
      </div>
    </main>
  );
}
