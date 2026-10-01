import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { AccountsLogin } from "@/components/accounts/accounts-login";
import { AccountsNav } from "@/components/accounts/accounts-nav";
import { getAccountsUser } from "@/lib/accounts/access";
import { accountsSignOut } from "@/app/accounts/actions";

export const dynamic = "force-dynamic";

export default async function AccountsPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getAccountsUser();
  if (!user) return <AccountsLogin />;
  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <span className="adm-side-glow" aria-hidden="true" />
        <Link href="/accounts" className="adm-brand" aria-label="nxtte accounts home">
          <span className="adm-brand-logo"><Image src="/brand/nxtte-logo.png" alt="nxtte" width={480} height={204} priority sizes="110px" /></span>
          <em>Accounts</em>
        </Link>
        <AccountsNav />
        <div className="adm-me">
          <span className="adm-me-av" aria-hidden="true">{user.email.charAt(0).toUpperCase()}</span>
          <span className="adm-me-text"><strong>Signed in</strong><small title={user.email}>{user.email}</small></span>
          <form action={accountsSignOut}><button type="submit" className="adm-signout" aria-label="Sign out" title="Sign out"><LogOut size={17} /></button></form>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
