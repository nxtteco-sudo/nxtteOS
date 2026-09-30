import Link from "next/link";
import { ImageOff, PenLine, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CATEGORY_LABEL, type ServiceCategory } from "@/lib/pricing";
import { CASE_TYPE_LABEL, type CaseType } from "@/types/work";

// AGENTS.md: /work goes in the site nav only once three cases with a result are live.
const NAV_THRESHOLD = 3;

type Row = { id: string; slug: string; headline: string; client_type: string; case_type: CaseType; category: ServiceCategory; result_value: string; status: "draft" | "published"; cover_image_url: string | null; sort_order: number };

export default async function WorkAdminPage() {
  await requireAdmin();
  const { data, error } = await supabaseAdmin()
    .from("case_studies")
    .select("id, slug, headline, client_type, case_type, category, result_value, status, cover_image_url, sort_order")
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });
  const cases = (data ?? []) as Row[];
  const live = cases.filter((c) => c.status === "published").length;

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Work</h1>
          <p>{live} published, {cases.length - live} draft{cases.length - live === 1 ? "" : "s"}. The page shows 3 to 6 cases.</p>
        </div>
        <Link href="/admin/work/new" className="adm-btn adm-btn-primary"><Plus size={16} /> New case study</Link>
      </header>

      <div className="adm-goal" role="status">
        <div className="adm-goal-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, (live / NAV_THRESHOLD) * 100)}%` }} /></div>
        <span>
          {live >= NAV_THRESHOLD
            ? "Three or more cases are live, so Work can go in the site menu."
            : `${live} of ${NAV_THRESHOLD} cases live. The spec keeps Work out of the site menu until three are published, each with a real result.`}
        </span>
      </div>

      {error && <p className="adm-error" role="alert">Could not load case studies. Check that migration 0004 has been run.</p>}

      {cases.length === 0 && !error ? (
        <div className="adm-empty">
          <h2>No case studies yet</h2>
          <p>Start with nxtte&rsquo;s own account, as the spec suggests, then an unpaid trial.</p>
          <Link href="/admin/work/new" className="adm-btn adm-btn-primary"><Plus size={16} /> Write the first case</Link>
        </div>
      ) : (
        <ul className="adm-list">
          {cases.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/work/${c.id}`} className="adm-row">
                <span className="adm-thumb">
                  {c.cover_image_url
                    // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail
                    ? <img src={c.cover_image_url} alt="" />
                    : <ImageOff size={16} aria-hidden="true" />}
                </span>
                <span className="adm-row-text">
                  <strong>{c.result_value ? `${c.result_value} · ` : ""}{c.headline}</strong>
                  <small>{CATEGORY_LABEL[c.category] ?? "Uncategorised"} · {CASE_TYPE_LABEL[c.case_type]}{c.client_type ? ` · ${c.client_type}` : ""} · order {c.sort_order}</small>
                </span>
                <span className={`adm-pill ${c.status === "published" ? "is-live" : ""}`}>{c.status === "published" ? "Published" : "Draft"}</span>
                <PenLine size={16} className="adm-row-go" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
