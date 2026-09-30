import type { Metadata } from "next";
import { AuditView } from "@/components/audit/audit-view";
import "@/components/home/home.css";
import "@/components/forms/lead-form.css";
import "@/components/audit/audit.css";

export const metadata: Metadata = {
  title: "Find out why your content is not converting: RM 199 audit | nxtte",
  description:
    "A profile teardown, content review, competitor comparison, gap analysis and a 90-day roadmap, delivered in five working days. RM 199, credited to your first month.",
  alternates: { canonical: "/audit" },
};

export default function AuditPage() {
  return <AuditView />;
}
