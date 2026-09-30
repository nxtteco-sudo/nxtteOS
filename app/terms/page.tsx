import type { Metadata } from "next";
import { TermsView } from "@/components/legal/terms-view";
import "@/components/home/home.css";
import "@/components/legal/legal.css";

export const metadata: Metadata = {
  title: "Terms of service | nxtte",
  description: "What you can expect from us, and what we need from you, when you book nxtte.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <TermsView />;
}
