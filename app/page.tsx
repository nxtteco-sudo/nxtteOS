import type { Metadata } from "next";
import HomePage from "@/components/home/home-page";
import { JsonLd } from "@/components/seo/json-ld";
import { FAQ_ITEMS } from "@/lib/faq";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import "@/components/home/home.css";

export const metadata: Metadata = pageMetadata({
  title: "nxtte — Content that produces bookings, not just likes",
  description: "Social media management for Malaysian businesses. Content, reels and a WhatsApp funnel from one team, with fixed monthly prices and a RM 199 audit to start.",
  path: "/",
});

export default function Page() {
  return (
    <>
      <JsonLd data={faqJsonLd(FAQ_ITEMS)} />
      <HomePage />
    </>
  );
}
