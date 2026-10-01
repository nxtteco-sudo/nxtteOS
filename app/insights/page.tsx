import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, itemListJsonLd, pageMetadata } from "@/lib/seo";
import { InsightsIndexView } from "@/components/insights/insights-views";
import { getPublishedInsights } from "@/lib/insights";
import "@/components/home/home.css";
import "@/components/insights/insights.css";

// Rebuilt at most every 5 minutes; publishing from /admin refreshes it at once.
export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Insights: social media tips for Malaysian businesses | nxtte",
  description: "Short, practical reads on turning social media posts into WhatsApp enquiries and bookings, for Malaysian business owners.",
  path: "/insights",
});

export default async function Page() {
  const posts = await getPublishedInsights();
  return (
    <>
      <JsonLd data={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }]), ...(posts.length ? [itemListJsonLd("nxtte Insights", posts.filter((p) => !p.noindex).map((p) => ({ name: p.title, path: `/insights/${p.slug}` })))] : [])]} />
      <InsightsIndexView posts={posts} />
    </>
  );
}
