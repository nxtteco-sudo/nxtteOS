import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CaseEditor } from "@/components/admin/case-editor";
import type { CaseStudy } from "@/types/work";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (id === "new") return <CaseEditor c={null} />;
  if (!UUID_RE.test(id)) notFound();
  const { data } = await supabaseAdmin()
    .from("case_studies")
    .select("id, slug, headline, client_name, client_type, case_type, category, result_value, result_label, result_period, situation, what_we_did, what_changed, metrics, services, gallery, before_image_url, after_image_url, testimonial_quote, testimonial_author, cover_image_url, cover_alt, status, sort_order, published_at, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  return <CaseEditor c={data as CaseStudy} />;
}
