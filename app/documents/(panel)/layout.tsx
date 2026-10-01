import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { DocsLogin } from "@/components/documents/docs-login";
import { DocsNav } from "@/components/documents/docs-nav";
import { getDocsUser } from "@/lib/documents/access";
import { docsSignOut } from "@/app/documents/actions";

export const dynamic = "force-dynamic";

export default async function DocumentsPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getDocsUser();
  if (!user) return <DocsLogin />;
  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <span className="adm-side-glow" aria-hidden="true" />
        <Link href="/documents" className="adm-brand" aria-label="nxtte documents home">
          <span className="adm-brand-logo"><Image src="/brand/nxtte-logo.png" alt="nxtte" width={480} height={204} priority sizes="110px" /></span>
          <em>Documents</em>
        </Link>
        <DocsNav />
        <div className="adm-me">
          <span className="adm-me-av" aria-hidden="true">{user.email.charAt(0).toUpperCase()}</span>
          <span className="adm-me-text"><strong>Signed in</strong><small title={user.email}>{user.email}</small></span>
          <form action={docsSignOut}><button type="submit" className="adm-signout" aria-label="Sign out" title="Sign out"><LogOut size={17} /></button></form>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
