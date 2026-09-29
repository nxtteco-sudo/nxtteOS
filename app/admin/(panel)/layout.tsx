import Link from "next/link";
import { LogOut } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth/admin";
import { signOut } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <Link href="/admin/insights" className="adm-brand"><span className="adm-logo" aria-hidden="true">n.</span> nxtte admin</Link>
        <AdminNav />
        <div className="adm-me">
          <span title={admin.email}>{admin.email}</span>
          <form action={signOut}><button type="submit" className="adm-signout"><LogOut size={15} /> Sign out</button></form>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
