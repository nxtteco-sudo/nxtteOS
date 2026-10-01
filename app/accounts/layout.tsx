import type { Metadata } from "next";
import "@/components/home/home.css";
import "@/components/admin/admin.css";
import "@/components/documents/documents.css";
import "@/components/accounts/accounts.css";

export const metadata: Metadata = {
  title: "Accounts | nxtte",
  robots: { index: false, follow: false },
};

export default function AccountsRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
