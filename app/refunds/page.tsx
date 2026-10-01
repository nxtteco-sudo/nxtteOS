import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { RefundsView } from "@/components/legal/refunds-view";
import "@/components/home/home.css";
import "@/components/legal/legal.css";

export const metadata: Metadata = pageMetadata({
  title: "Refund policy: audit, packages and menu services | nxtte",
  description: "When you can get your money back from nxtte: the RM 199 audit before the report, menu services before work starts, and how fast refunds are paid.",
  path: "/refunds",
});

export default function RefundsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Refunds", path: "/refunds" }])} />
      <RefundsView />
    </>
  );
}
