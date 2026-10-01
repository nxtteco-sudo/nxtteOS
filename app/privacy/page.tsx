import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { PrivacyView } from "@/components/legal/privacy-view";
import "@/components/home/home.css";
import "@/components/legal/legal.css";

export const metadata: Metadata = pageMetadata({
  title: "Privacy notice: what nxtte collects and why | nxtte",
  description: "What nxtte collects through its forms, audit dashboard and WhatsApp, why we use it, who processes it, and how to see, correct or delete your details.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Privacy", path: "/privacy" }])} />
      <PrivacyView />
    </>
  );
}
