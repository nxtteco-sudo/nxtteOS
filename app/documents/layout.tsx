import type { Metadata } from "next";
import "@/components/home/home.css";
import "@/components/admin/admin.css";
import "@/components/documents/documents.css";

export const metadata: Metadata = {
  title: "Documents | nxtte",
  robots: { index: false, follow: false },
};

export default function DocumentsRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
