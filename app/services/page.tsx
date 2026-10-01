import type { Metadata } from "next";
import { ServicesPageContent } from "@/components/home/home-page";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, packagesJsonLd, pageMetadata } from "@/lib/seo";
import "@/components/home/home.css";

export const metadata: Metadata = pageMetadata({
  title: "Social media packages: RM 1,199, RM 2,299 or RM 3,399 | nxtte",
  description: "Three monthly social media packages (Starter, Growth, Pro) and a menu of fixed-price services: content, ads, landing pages and brand.",
  path: "/services",
});

export default function Page() {
  return (
    <>
      <JsonLd data={[packagesJsonLd(), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])]} />
      <ServicesPageContent />
    </>
  );
}
