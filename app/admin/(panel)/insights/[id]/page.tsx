import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { InsightEditor } from "@/components/admin/insight-editor";
import type { InsightPost } from "@/types/insights";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditInsightPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (id === "new") return <InsightEditor post={null} />;
  if (!UUID_RE.test(id)) notFound();
  const { data } = await supabaseAdmin()
    .from("insight_posts")
    .select("id, slug, title, excerpt, body, cover_image_url, cover_alt, status, published_at, updated_at, seo_title, meta_description, focus_keyword, og_image_url, canonical_url, noindex, author_slug, takeaways, faqs")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  return <InsightEditor post={data as InsightPost} />;
}
