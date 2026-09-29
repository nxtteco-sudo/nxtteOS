import type { Metadata } from "next";
import { InsightsIndexView } from "@/components/insights/insights-views";
import { getPublishedInsights } from "@/lib/insights";
import "@/components/home/home.css";
import "@/components/insights/insights.css";

// Rebuilt at most every 5 minutes; publishing from /admin refreshes it at once.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Insights: practical social media reads for Malaysian businesses | nxtte",
  description: "Short, practical reads on turning social media posts into WhatsApp enquiries and bookings, for Malaysian business owners.",
  alternates: { canonical: "/insights" },
};

export default async function Page() {
  const posts = await getPublishedInsights();
  return <InsightsIndexView posts={posts} />;
}
