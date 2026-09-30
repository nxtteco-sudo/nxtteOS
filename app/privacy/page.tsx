import type { Metadata } from "next";
import { PrivacyView } from "@/components/legal/privacy-view";
import "@/components/home/home.css";
import "@/components/legal/legal.css";

export const metadata: Metadata = {
  title: "Privacy notice | nxtte",
  description: "What nxtte collects when you use this site, why, and what you can ask us to do with it.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <PrivacyView />;
}
