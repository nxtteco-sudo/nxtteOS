import type { Metadata } from "next";
import { AboutPageContent } from "@/components/home/home-page";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import "@/components/home/home.css";

export const metadata: Metadata = pageMetadata({
  title: "About nxtte: meet Ms. Nemila and Mr. Jay | nxtte",
  description: "nxtte is run by Ms. Nemila and Mr. Jay, with the Aurexis Solution team building the sites and funnels your content feeds.",
  path: "/about",
});

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
      <AboutPageContent />
    </>
  );
}
