import { Inbox, MessageCircle, Send } from "lucide-react";
import { EmptyState, HeroStat, PageHero } from "@/components/admin/page-hero";
import { LeadCard, type Lead } from "@/components/admin/crm";
import { requireAdmin } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

const STATUS: [Lead["status"], string][] = [["new", "New"], ["contacted", "Contacted"], ["won", "Won"], ["lost", "Lost"]];

export default async function LeadsPage() {
  await requireAdmin();
  const { data, error } = await supabaseAdmin()
    .from("contact_submissions")
    .select("id, name, business, instagram, whatsapp, service_interest, status, admin_notes, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const leads = (data ?? []) as Lead[];
  const count = (s: Lead["status"]) => leads.filter((l) => l.status === s).length;
  const fresh = count("new");

  return (
    <div className="ov">
      <PageHero
        slim
        kicker="Customers"
        title="Leads"
        accent={fresh ? "waiting for you." : "all answered."}
        sub={fresh ? <>Reply within 24 hours. <strong>{fresh}</strong> new {fresh === 1 ? "enquiry needs" : "enquiries need"} a first message.</> : "Every enquiry from the contact form lands here, and you get an email for each one."}
        aside={<HeroStat icon={Inbox} label="New enquiries" value={String(fresh)} sub={`${leads.length} in total`} />}
      />
      {error && <p className="adm-error" role="alert">Could not load leads. Check that migration 0006 has been run.</p>}
      {leads.length > 0 && (
        <div className="pg-filters" aria-label="Leads by status">
          {STATUS.map(([s, label]) => <span key={s} className={s === "new" && fresh ? "is-you" : ""}>{label} <b>{count(s)}</b></span>)}
        </div>
      )}
      {leads.length === 0 && !error
        ? <EmptyState icons={[MessageCircle, Inbox, Send]} title="No enquiries yet." body="When someone fills in the contact form, their enquiry appears here with a one-tap WhatsApp reply, and you get an email." />
        : <ul className="crm-leads">{leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}</ul>}
    </div>
  );
}
