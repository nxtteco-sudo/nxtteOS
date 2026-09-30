import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { auditStage, listAudits, unreadByAudit } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { signOut } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

// Counts for the sidebar badges: new enquiries, and audits waiting on nxtte.
async function navCounts() {
  try {
    const [leads, audits, unread] = await Promise.all([
      supabaseAdmin().from("contact_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
      listAudits(),
      unreadByAudit(),
    ]);
    return { leads: leads.count ?? 0, audits: audits.filter((a) => auditStage(a).tone === "you" || unread[a.id]).length };
  } catch {
    return { leads: 0, audits: 0 };
  }
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const counts = await navCounts();
  const initial = admin.email.charAt(0).toUpperCase();
  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <span className="adm-side-glow" aria-hidden="true" />
        <Link href="/admin" className="adm-brand" aria-label="nxtte admin home">
          <span className="adm-brand-logo"><Image src="/brand/nxtte-logo.png" alt="nxtte" width={480} height={204} priority sizes="110px" /></span>
          <em>Admin</em>
        </Link>
        <AdminNav counts={counts} />
        <div className="adm-me">
          <span className="adm-me-av" aria-hidden="true">{initial}</span>
          <span className="adm-me-text"><strong>Signed in</strong><small title={admin.email}>{admin.email}</small></span>
          <form action={signOut}><button type="submit" className="adm-signout" aria-label="Sign out" title="Sign out"><LogOut size={17} /></button></form>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
