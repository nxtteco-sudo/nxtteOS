import type { Metadata } from "next";
import { WorkIndexView } from "@/components/work/work-views";
import { getPublishedCases } from "@/lib/work";
import "@/components/home/home.css";
import "@/components/insights/insights.css";
import "@/components/work/work.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Our work: case studies with real results | nxtte",
  description: "How nxtte helped Malaysian businesses turn social media into enquiries and bookings. Every case ends with a real number.",
  alternates: { canonical: "/work" },
};

export default async function Page() {
  const cases = await getPublishedCases();
  return <WorkIndexView cases={cases} />;
}
