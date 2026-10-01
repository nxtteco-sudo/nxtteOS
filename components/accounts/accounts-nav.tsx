"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, ExternalLink, FileBarChart, LayoutDashboard } from "lucide-react";

const LINKS = [
  { href: "/accounts", label: "Overview", icon: LayoutDashboard },
  { href: "/accounts/income", label: "Income", icon: ArrowUpRight },
  { href: "/accounts/expenses", label: "Expenses", icon: ArrowDownRight },
  { href: "/accounts/reports", label: "Reports", icon: FileBarChart },
] as const;

export function AccountsNav() {
  const path = usePathname();
  return (
    <nav className="adm-nav" aria-label="Accounts">
      <div className="adm-nav-group">
        <p>Accounts</p>
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = href === "/accounts" ? path === "/accounts" : path.startsWith(href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}>
              <span className="adm-nav-ic"><Icon size={17} /></span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
      <a className="adm-nav-site" href="/documents" target="_blank" rel="noreferrer"><span className="adm-nav-ic"><ExternalLink size={16} /></span><span>Documents</span></a>
    </nav>
  );
}
