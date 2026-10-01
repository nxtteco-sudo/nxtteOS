import { PageHero } from "@/components/admin/page-hero";
import { ProposalEditor, type ProposalState } from "@/components/documents/proposal-editor";
import { getDocsUser } from "@/lib/documents/access";
import { addDays, nextSequence, proposalPrefix, proposalRef, todayMY } from "@/lib/documents/model";
import { TEMPLATE_PACKAGES } from "@/lib/documents/presets";
import { DEFAULT_TITLE, defaultSections } from "@/lib/documents/proposal";
import { AUDIT_PRICE } from "@/lib/pricing";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function NewProposalPage() {
  if (!(await getDocsUser())) return null;
  const { data } = await supabaseAdmin().from("documents").select("number").eq("kind", "proposal").limit(10000);
  const today = todayMY();
  const year = Number(today.slice(0, 4));
  const growth = TEMPLATE_PACKAGES.find((p) => p.name === "Growth") ?? TEMPLATE_PACKAGES[0];
  const initial: ProposalState = {
    ref: proposalRef(year, nextSequence(proposalPrefix(year), (data ?? []).map((r) => r.number as string))),
    date: today,
    validUntil: addDays(today, 14),
    title: DEFAULT_TITLE,
    clientName: "",
    pkg: growth.name,
    auditCredit: true,
    sections: defaultSections(growth, AUDIT_PRICE),
  };
  return (
    <div className="ov dc-page dc-edit-page">
      <PageHero slim kicker="New proposal" title="New proposal" sub="Write each section on the left. The preview is the real PDF, on the Night glow template." />
      <ProposalEditor initial={initial} />
    </div>
  );
}
