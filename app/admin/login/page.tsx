import { BrandMark } from "@/components/brand-mark";
import { redirect } from "next/navigation";
import { getAdminUser, isAdminConfigured } from "@/lib/auth/admin";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAdminUser()) redirect("/admin/insights");
  return (
    <main className="adm-login">
      <div className="adm-login-card">
        <span className="adm-logo" aria-hidden="true"><BrandMark size={18} /></span>
        <h1>nxtte admin</h1>
        <p>Sign in to write and publish Insights.</p>
        {isAdminConfigured() ? (
          <LoginForm />
        ) : (
          <p className="adm-notice" role="status">
            The admin portal is not connected yet. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and
            SUPABASE_SERVICE_ROLE_KEY to the environment, then run supabase/migrations/0003_insights_admin.sql.
          </p>
        )}
      </div>
    </main>
  );
}
