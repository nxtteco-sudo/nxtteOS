import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightPostView } from "@/components/insights/insights-views";
import { PostBody } from "@/components/insights/post-body";
import { getPublishedInsight, getPublishedInsights, readingMinutes } from "@/lib/insights";
import { SITE_URL } from "@/lib/site";
import "@/components/home/home.css";
import "@/components/insights/insights.css";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedInsight(slug);
  if (!post) return {};
  return {
    title: `${post.title} | nxtte`,
    description: post.excerpt || undefined,
    alternates: { canonical: `/insights/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url, alt: post.cover_alt }] : undefined,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedInsight(slug);
  if (!post) notFound();
  const more = (await getPublishedInsights()).filter((p) => p.slug !== post.slug).slice(0, 3);

  // Dates stay out of the page (spec) but are fine in structured data for search engines.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image_url ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    mainEntityOfPage: `${SITE_URL}/insights/${post.slug}`,
    author: { "@type": "Organization", name: "nxtte" },
    publisher: { "@type": "Organization", name: "nxtte" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <InsightPostView post={post} minutes={readingMinutes(post.body)} more={more}>
        <PostBody markdown={post.body} />
      </InsightPostView>
    </>
  );
}
