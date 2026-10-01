import Link from "next/link";
import { Briefcase, Camera, ImageOff, PenLine, Plus, TrendingUp } from "lucide-react";
import { EmptyState, HeroStat, PageHero } from "@/components/admin/page-hero";
import { requireAdmin } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CATEGORY_LABEL, type ServiceCategory } from "@/lib/pricing";
import { CASE_TYPE_LABEL, type CaseType } from "@/types/work";

// A first goal of three cases, each with a real result.
const GOAL = 3;

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
    <div className="ov">
      <PageHero
        slim
        kicker="Website"
        title="Work"
        accent="that proves it."
        sub="Case studies by service, each with a real result. The Work page shows 3 to 6 at a time, in the order you set."
        actions={<Link href="/admin/work/new" className="ov-btn ov-btn-light"><Plus size={16} /> New case study</Link>}
        aside={<HeroStat icon={Briefcase} label="Published" value={`${live} of ${GOAL}`} progress={live / GOAL} sub={`${cases.length - live} draft${cases.length - live === 1 ? "" : "s"}${live >= GOAL ? " · first goal reached" : ""}`} />}
      />

      {error && <p className="adm-error" role="alert">Could not load case studies. Check that migration 0004 has been run.</p>}

      {cases.length === 0 && !error ? (
        <EmptyState icons={[Camera, TrendingUp, Briefcase]} title="No case studies yet." body="Start with nxtte's own account, then a trial client. Add the problem, what you did, a real result, and before and after images." action={<Link href="/admin/work/new" className="adm-btn adm-btn-primary"><Plus size={16} /> Write the first case</Link>} />
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
