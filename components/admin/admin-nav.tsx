"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, ClipboardCheck, ExternalLink, FileText, Inbox, LayoutDashboard, Settings } from "lucide-react";

export type NavCounts = { leads: number; audits: number };

// Grouped by what the admin is doing: today, customers, the site's content, setup.
const GROUPS = [
  { title: "Today", links: [{ href: "/admin", label: "Overview", icon: LayoutDashboard, count: null }] },
  {
    title: "Customers",
    links: [
      { href: "/admin/leads", label: "Leads", icon: Inbox, count: "leads" },
      { href: "/admin/audits", label: "Audits", icon: ClipboardCheck, count: "audits" },
    ],
  },
  {
    title: "Website",
    links: [
      { href: "/admin/insights", label: "Insights", icon: FileText, count: null },
      { href: "/admin/work", label: "Work", icon: Briefcase, count: null },
    ],
  },
  { title: "Setup", links: [{ href: "/admin/settings", label: "Settings", icon: Settings, count: null }] },
] as const;

export function AdminNav({ counts }: { counts: NavCounts }) {
  const path = usePathname();
  return (
    <nav className="adm-nav" aria-label="Admin">
      {GROUPS.map((group) => (
        <div key={group.title} className="adm-nav-group">
          <p>{group.title}</p>
          {group.links.map(({ href, label, icon: Icon, count }) => {
            const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
            const n = count ? counts[count] : 0;
            return (
              <Link key={href} href={href} aria-current={active ? "page" : undefined}>
                <span className="adm-nav-ic"><Icon size={17} /></span>
                <span>{label}</span>
                {n > 0 && <em aria-label={`${n} waiting`}>{n}</em>}
              </Link>
            );
          })}
        </div>
      ))}
      <a className="adm-nav-site" href="/" target="_blank" rel="noreferrer"><span className="adm-nav-ic"><ExternalLink size={16} /></span><span>View site</span></a>
    </nav>
  );
}
