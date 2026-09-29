import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyView } from "@/components/work/work-views";
import { PostBody } from "@/components/insights/post-body";
import { getPublishedCase, getPublishedCases } from "@/lib/work";
import "@/components/home/home.css";
import "@/components/insights/insights.css";
import "@/components/work/work.css";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getPublishedCase(slug);
  if (!c) return {};
  const description = `${c.result_value} ${c.result_label} ${c.result_period}. ${c.client_type}.`.trim();
  return {
    title: `${c.headline} | nxtte`,
    description,
    alternates: { canonical: `/work/${c.slug}` },
    openGraph: { type: "article", title: c.headline, description, images: c.cover_image_url ? [{ url: c.cover_image_url, alt: c.cover_alt }] : undefined },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const c = await getPublishedCase(slug);
  if (!c) notFound();
  const more = (await getPublishedCases()).filter((m) => m.slug !== c.slug).slice(0, 2);
  return (
    <CaseStudyView
      c={c}
      more={more}
      situation={<PostBody markdown={c.situation} />}
      whatWeDid={<PostBody markdown={c.what_we_did} />}
      whatChanged={<PostBody markdown={c.what_changed} />}
    />
  );
}
