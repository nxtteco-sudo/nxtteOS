import Link from "next/link";
import { Plus } from "lucide-react";
import { DocList } from "@/components/documents/doc-list";
import { PageHero } from "@/components/admin/page-hero";
import { getDocsUser } from "@/lib/documents/access";

export default async function ProposalsPage() {
  if (!(await getDocsUser())) return null;
  return (
    <div className="ov dc-page">
      <PageHero
        slim
        kicker="Proposals"
        title="Proposals"
        accent="that win."
        sub="Pick a package, write the findings, and watch the Night glow PDF build as you type."
        actions={<Link href="/documents/proposals/new" className="ov-btn ov-btn-light"><Plus size={16} /> New proposal</Link>}
      />
      <DocList kinds={["proposal"]} empty="proposal" />
    </div>
  );
}
