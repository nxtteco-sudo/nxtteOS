import { PageHero } from "@/components/admin/page-hero";
import { notFound } from "next/navigation";
import { ProposalEditor } from "@/components/documents/proposal-editor";
import { getDocsUser } from "@/lib/documents/access";
import { checkProposal } from "@/lib/documents/validate";
import { supabaseAdmin } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function EditProposalPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getDocsUser())) return null;
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { data: row } = await supabaseAdmin().from("documents").select("id, data").eq("id", id).eq("kind", "proposal").maybeSingle();
  if (!row) notFound();
  const c = checkProposal(row.data);
  if (!c.ok) notFound();
  return (
    <div className="ov dc-page dc-edit-page">
      <PageHero slim kicker="Edit proposal" title={`Edit ${c.data.ref}`} sub="Change anything, then save. The PDF is rebuilt from your changes." />
      <ProposalEditor key={id} docId={id} initial={{ ...c.data, pkg: "Growth", auditCredit: true }} />
    </div>
  );
}
