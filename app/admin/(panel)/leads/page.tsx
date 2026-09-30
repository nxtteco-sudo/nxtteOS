import { requireAdmin } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { LeadCard, type Lead } from "@/components/admin/crm";

export default async function LeadsPage() {
  await requireAdmin();
  const { data, error } = await supabaseAdmin()
    .from("contact_submissions")
    .select("id, name, business, instagram, whatsapp, service_interest, status, admin_notes, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const leads = (data ?? []) as Lead[];
  const fresh = leads.filter((l) => l.status === "new").length;

  return (
    <div className="adm-page">
      <header className="adm-head"><div><h1>Leads</h1><p>{fresh} new, {leads.length} in total. From the contact form. Reply within 24 hours.</p></div></header>
      {error && <p className="adm-error" role="alert">Could not load leads. Check that migration 0006 has been run.</p>}
      {leads.length === 0 && !error
        ? <div className="adm-empty"><h2>No enquiries yet</h2><p>Contact form submissions appear here, and you get an email for each one.</p></div>
        : <ul className="crm-leads">{leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}</ul>}
    </div>
  );
}
