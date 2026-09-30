import type { Metadata } from "next";
import { MyShell, type NavState } from "@/components/my/my-ui";
import { getMessages, getMyAudit } from "@/lib/customer";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import "@/components/home/home.css";
import "@/components/my/my.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your audit dashboard | nxtte",
  robots: { index: false, follow: false },
};

export default async function MyLayout({ children }: { children: React.ReactNode }) {
  const audit = await getMyAudit();
  if (!audit) return <div className="my my-guest">{children}</div>;

  const unread = (await getMessages(audit.id)).filter((m) => m.sender === "nxtte" && !m.read_at).length;
  const nav: NavState = {
    details: audit.details_submitted_at ? { text: "Done", tone: "done" } : { text: "To do", tone: "todo" },
    payment: audit.payment_status === "paid" ? { text: "Paid", tone: "done" } : audit.payment_status === "claimed" ? { text: "Checking", tone: "wait" } : audit.approved_at ? { text: "To do", tone: "todo" } : { text: "Locked", tone: "lock" },
    messages: unread ? { text: String(unread), tone: "new" } : null,
    report: audit.report_ready_at ? { text: "Ready", tone: "new" } : null,
  };
  const helpHref = buildWhatsAppLink(`Hi nxtte, I have a question about my audit (${audit.reference ?? audit.business}).`);

  return <MyShell business={audit.business} reference={audit.reference} nav={nav} helpHref={helpHref}>{children}</MyShell>;
}
