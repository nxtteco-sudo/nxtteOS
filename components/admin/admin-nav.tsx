"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, ExternalLink, FileText } from "lucide-react";

const LINKS = [
  { href: "/admin/insights", label: "Insights", icon: FileText },
  { href: "/admin/work", label: "Work", icon: Briefcase },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="adm-nav" aria-label="Admin">
      {LINKS.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} aria-current={path.startsWith(href) ? "page" : undefined}><Icon size={17} /> {label}</Link>
      ))}
      <a href="/" target="_blank" rel="noreferrer"><ExternalLink size={17} /> View site</a>
    </nav>
  );
}
