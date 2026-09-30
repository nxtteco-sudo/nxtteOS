import type { Metadata } from "next";
import "@/components/home/home.css";
import "@/components/insights/insights.css";
import "@/components/work/work.css";
import "@/components/my/my.css";
import "@/components/admin/admin.css";

export const metadata: Metadata = {
  title: "nxtte admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
