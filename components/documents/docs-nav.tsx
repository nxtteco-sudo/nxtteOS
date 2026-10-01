"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, FileText, LayoutDashboard, Receipt } from "lucide-react";

const LINKS = [
  { href: "/documents", label: "Overview", icon: LayoutDashboard },
  { href: "/documents/proposals", label: "Proposals", icon: FileText },
  { href: "/documents/billing", label: "Invoices and receipts", icon: Receipt },
] as const;

export function DocsNav() {
  const path = usePathname();
  return (
    <nav className="adm-nav" aria-label="Documents">
      <div className="adm-nav-group">
        <p>Documents</p>
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = href === "/documents" ? path === "/documents" : path.startsWith(href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}>
              <span className="adm-nav-ic"><Icon size={17} /></span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
      <a className="adm-nav-site" href="/" target="_blank" rel="noreferrer"><span className="adm-nav-ic"><ExternalLink size={16} /></span><span>View site</span></a>
    </nav>
  );
}
