import { PaymentSettingsForm } from "@/components/admin/crm";
import { requireAdmin } from "@/lib/auth/admin";
import { getPaymentSettings } from "@/lib/customer";
import { ALERT_EMAIL } from "@/lib/email";

export default async function SettingsPage() {
  const admin = await requireAdmin();
  const settings = await getPaymentSettings();
  return (
    <div className="adm-page">
      <header className="adm-head"><div><h1>Settings</h1><p>Signed in as {admin.email}</p></div></header>
      <PaymentSettingsForm settings={settings} />
      <section className="adm-card crm-settings">
        <h2 className="crm-h">Alerts</h2>
        <p className="adm-muted">New enquiries, bookings, payments and customer messages are emailed to <strong>{ALERT_EMAIL}</strong>. {process.env.RESEND_API_KEY ? "Email sending is switched on." : "Email sending is off until RESEND_API_KEY is added in Vercel."}</p>
      </section>
    </div>
  );
}
