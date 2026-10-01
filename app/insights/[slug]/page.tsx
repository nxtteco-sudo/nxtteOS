import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightPostView } from "@/components/insights/insights-views";
import { PostBody } from "@/components/insights/post-body";
import { JsonLd } from "@/components/seo/json-ld";
import { authorBySlug, countWords, parseFaqs } from "@/lib/content-seo";
import { getPublishedInsight, getPublishedInsights, readingMinutes } from "@/lib/insights";
import { breadcrumbJsonLd, faqJsonLd, orgId } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import "@/components/home/home.css";
import "@/components/insights/insights.css";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedInsight(slug);
  if (!post) return {};
  const title = post.seo_title || post.title;
  const description = post.meta_description || post.excerpt || undefined;
  const image = post.og_image_url || post.cover_image_url;
  const author = authorBySlug(post.author_slug);
  return {
    title: `${title} | nxtte`,
    description,
    alternates: { canonical: post.canonical_url || `/insights/${post.slug}` },
    ...(post.noindex && { robots: { index: false, follow: true } }),
    ...(post.focus_keyword && { keywords: [post.focus_keyword] }),
    ...(author && { authors: [{ name: author.name }] }),
    openGraph: {
      type: "article",
      siteName: "nxtte",
      locale: "en_MY",
      title,
      description,
      url: `${SITE_URL}/insights/${post.slug}`,
      ...(post.published_at && { publishedTime: post.published_at }),
      modifiedTime: post.updated_at,
      ...(author && { authors: [author.name] }),
      ...(image && { images: [{ url: image, alt: post.cover_alt || title }] }),
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, ...(image && { images: [image] }) },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedInsight(slug);
  if (!post) notFound();
  const more = (await getPublishedInsights()).filter((p) => p.slug !== post.slug).slice(0, 3);
  const author = authorBySlug(post.author_slug);
  const faqs = parseFaqs(post.faqs);
  const url = `${SITE_URL}/insights/${post.slug}`;

  // Dates stay out of the page (spec) but are fine in structured data for search engines.
  const jsonLd: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.seo_title || post.title,
      description: post.meta_description || post.excerpt,
      url,
      mainEntityOfPage: url,
      ...(post.published_at && { datePublished: post.published_at }),
      dateModified: post.updated_at,
      inLanguage: "en-MY",
      wordCount: countWords(post.body),
      ...(post.takeaways.trim() && { abstract: post.takeaways.trim() }),
      ...(post.focus_keyword && { keywords: post.focus_keyword }),
      ...((post.og_image_url || post.cover_image_url) && { image: post.og_image_url || post.cover_image_url }),
      author: author ? { "@type": "Person", name: author.schemaName, honorificPrefix: author.name.split(" ")[0], jobTitle: author.role, worksFor: { "@id": orgId } } : { "@id": orgId },
      publisher: { "@id": orgId },
    },
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }, { name: post.title, path: `/insights/${post.slug}` }]),
    ...(faqs.length ? [faqJsonLd(faqs.map((f) => [f.q, f.a] as const))] : []),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <InsightPostView post={post} minutes={readingMinutes(post.body)} more={more}>
        <PostBody markdown={post.body} />
      </InsightPostView>
    </>
  );
}
