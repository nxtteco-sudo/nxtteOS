import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { TermsView } from "@/components/legal/terms-view";
import "@/components/home/home.css";
import "@/components/legal/legal.css";

export const metadata: Metadata = pageMetadata({
  title: "Terms of service: packages, payments and content | nxtte",
  description: "How nxtte packages work: the 3-month minimum, 30 days' notice, payment dates, who owns the content, and what we need from you to start.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Terms", path: "/terms" }])} />
      <TermsView />
    </>
  );
}
