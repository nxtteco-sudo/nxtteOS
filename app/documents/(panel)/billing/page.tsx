import Link from "next/link";
import { Plus } from "lucide-react";
import { DocList } from "@/components/documents/doc-list";
import { PageHero } from "@/components/admin/page-hero";
import { getDocsUser } from "@/lib/documents/access";

export default async function BillingPage() {
  if (!(await getDocsUser())) return null;
  return (
    <div className="ov dc-page">
      <PageHero
        slim
        kicker="Billing"
        title="Invoices"
        accent="and receipts."
        sub="Fill in the details and get the PDF. Make a receipt from any invoice. Receipts for paid audits appear here on their own."
        actions={<>
          <Link href="/documents/billing/new?kind=invoice" className="ov-btn ov-btn-light"><Plus size={16} /> New invoice</Link>
          <Link href="/documents/billing/new?kind=receipt" className="ov-btn"><Plus size={16} /> New receipt</Link>
        </>}
      />
      <DocList kinds={["invoice", "receipt"]} empty="billing" />
    </div>
  );
}
