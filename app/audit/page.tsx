import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { auditJsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { AuditView } from "@/components/audit/audit-view";
import "@/components/home/home.css";
import "@/components/forms/lead-form.css";
import "@/components/audit/audit.css";

export const metadata: Metadata = pageMetadata({
  title: "Find out why your content is not converting: RM 199 audit | nxtte",
  description: "A profile teardown, content review, competitor comparison, gap analysis and 90-day roadmap in five working days. RM 199, credited to your first month.",
  path: "/audit",
});

export default function AuditPage() {
  return (
    <>
      <JsonLd data={[auditJsonLd(), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "RM 199 audit", path: "/audit" }])]} />
      <AuditView />
    </>
  );
}
