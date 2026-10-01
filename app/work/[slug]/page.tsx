import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyView } from "@/components/work/work-views";
import { PostBody } from "@/components/insights/post-body";
import { JsonLd } from "@/components/seo/json-ld";
import { parseFaqs } from "@/lib/content-seo";
import { CATEGORY_LABEL } from "@/lib/pricing";
import { breadcrumbJsonLd, faqJsonLd, orgId } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
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
  const resultLine = `${[c.result_value, c.result_label, c.result_period].filter(Boolean).join(" ")}. ${c.client_type}.`.trim();
  const title = c.seo_title || c.headline;
  const description = c.meta_description || resultLine;
  return {
    title: `${title} | nxtte`,
    description,
    alternates: { canonical: `/work/${c.slug}` },
    ...(c.noindex && { robots: { index: false, follow: true } }),
    ...(c.focus_keyword && { keywords: [c.focus_keyword] }),
    openGraph: { type: "article", siteName: "nxtte", locale: "en_MY", title, description, url: `${SITE_URL}/work/${c.slug}`, images: c.cover_image_url ? [{ url: c.cover_image_url, alt: c.cover_alt }] : undefined },
    twitter: { card: c.cover_image_url ? "summary_large_image" : "summary", title, description },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const c = await getPublishedCase(slug);
  if (!c) notFound();
  const more = (await getPublishedCases()).filter((m) => m.slug !== c.slug).slice(0, 2);
  const faqs = parseFaqs(c.faqs);
  const url = `${SITE_URL}/work/${c.slug}`;
  const jsonLd: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: c.seo_title || c.headline,
      description: c.meta_description || `${[c.result_value, c.result_label, c.result_period].filter(Boolean).join(" ")}.`,
      url,
      mainEntityOfPage: url,
      articleSection: "Case study",
      about: CATEGORY_LABEL[c.category],
      ...(c.published_at && { datePublished: c.published_at }),
      dateModified: c.updated_at,
      inLanguage: "en-MY",
      ...(c.focus_keyword && { keywords: c.focus_keyword }),
      ...(c.cover_image_url && { image: c.cover_image_url }),
      author: { "@id": orgId },
      publisher: { "@id": orgId },
    },
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }, { name: c.headline, path: `/work/${c.slug}` }]),
    ...(faqs.length ? [faqJsonLd(faqs.map((f) => [f.q, f.a] as const))] : []),
  ];
  return (
    <>
    <JsonLd data={jsonLd} />
    <CaseStudyView
      c={c}
      more={more}
      situation={<PostBody markdown={c.situation} />}
      whatWeDid={<PostBody markdown={c.what_we_did} />}
      whatChanged={<PostBody markdown={c.what_changed} />}
    />
    </>
  );
}
