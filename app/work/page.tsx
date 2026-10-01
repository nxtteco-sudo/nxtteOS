import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, itemListJsonLd, pageMetadata } from "@/lib/seo";
import { WorkIndexView } from "@/components/work/work-views";
import { getPublishedCases } from "@/lib/work";
import "@/components/home/home.css";
import "@/components/insights/insights.css";
import "@/components/work/work.css";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Our work: case studies with real results | nxtte",
  description: "How nxtte helped Malaysian businesses turn social media into enquiries and bookings. Every case ends with a real number.",
  path: "/work",
});

export default async function Page() {
  const cases = await getPublishedCases();
  return (
    <>
      <JsonLd data={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }]), ...(cases.length ? [itemListJsonLd("nxtte case studies", cases.filter((c) => !c.noindex).map((c) => ({ name: c.headline, path: `/work/${c.slug}` })))] : [])]} />
      <WorkIndexView cases={cases} />
    </>
  );
}
