import { AlertCircle, CheckCircle2 } from "lucide-react";
import { HeroStat, PageHero } from "@/components/admin/page-hero";
import { PaymentSettingsForm } from "@/components/admin/crm";
import { requireAdmin } from "@/lib/auth/admin";
import { getPaymentSettings } from "@/lib/customer";
import { ALERT_EMAIL } from "@/lib/email";

export default async function SettingsPage() {
  const admin = await requireAdmin();
  const settings = await getPaymentSettings();
  return (
    <div className="ov pg-narrow">
      <PageHero
        slim
        kicker="Setup"
        title="Settings"
        sub={`Signed in as ${admin.email}. Payment details here show on customer dashboards and new invoices.`}
        aside={<HeroStat icon={settings.account_number || settings.duitnow_id ? CheckCircle2 : AlertCircle} label="Payment details" value={settings.account_number || settings.duitnow_id ? "Ready" : "Missing"} sub={settings.account_number || settings.duitnow_id ? "Customers can pay" : "Add them below"} />}
      />
      <PaymentSettingsForm settings={settings} />
      <section className="adm-card crm-settings">
        <h2 className="crm-h">Alerts</h2>
        <p className="adm-muted">New enquiries, bookings, payments and customer messages are emailed to <strong>{ALERT_EMAIL}</strong>. {process.env.RESEND_API_KEY ? "Email sending is switched on." : "Email sending is off until RESEND_API_KEY is added in Vercel."}</p>
      </section>
    </div>
  );
}
