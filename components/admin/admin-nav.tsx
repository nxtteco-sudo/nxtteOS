"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, ClipboardCheck, ExternalLink, FileText, Inbox, LayoutDashboard, Settings } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/audits", label: "Audits", icon: ClipboardCheck },
  { href: "/admin/insights", label: "Insights", icon: FileText },
  { href: "/admin/work", label: "Work", icon: Briefcase },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="adm-nav" aria-label="Admin">
      {LINKS.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} aria-current={(href === "/admin" ? path === "/admin" : path.startsWith(href)) ? "page" : undefined}><Icon size={17} /> {label}</Link>
      ))}
      <a href="/" target="_blank" rel="noreferrer"><ExternalLink size={17} /> View site</a>
    </nav>
  );
}
