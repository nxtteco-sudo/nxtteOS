import Link from "next/link";
import { BookOpenText, ImageOff, Lightbulb, Newspaper, PenLine, Plus } from "lucide-react";
import { EmptyState, HeroStat, PageHero } from "@/components/admin/page-hero";
import { requireAdmin } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

// A first goal of six posts (the spec's bar for a credible Insights page).
const GOAL = 6;

type Row = { id: string; slug: string; title: string; status: "draft" | "published"; cover_image_url: string | null; updated_at: string };

export default async function InsightsAdminPage() {
  await requireAdmin();
  const { data, error } = await supabaseAdmin()
    .from("insight_posts")
    .select("id, slug, title, status, cover_image_url, updated_at")
    .order("updated_at", { ascending: false });
  const posts = (data ?? []) as Row[];
  const live = posts.filter((p) => p.status === "published").length;

  return (
    <div className="ov">
      <PageHero
        slim
        kicker="Website"
        title="Insights"
        accent="worth reading."
        sub="Turn one Instagram carousel into a 400 to 700 word post. Each one helps people find nxtte on Google."
        actions={<Link href="/admin/insights/new" className="ov-btn ov-btn-light"><Plus size={16} /> New post</Link>}
        aside={<HeroStat icon={Newspaper} label="Published" value={`${live} of ${GOAL}`} progress={live / GOAL} sub={`${posts.length - live} draft${posts.length - live === 1 ? "" : "s"}${live >= GOAL ? " · first goal reached" : ""}`} />}
      />

      {error && <p className="adm-error" role="alert">Could not load posts. Check that the migration has been run.</p>}

      {posts.length === 0 && !error ? (
        <EmptyState icons={[Lightbulb, BookOpenText, PenLine]} title="No posts yet." body="Pick your best-performing carousel, expand it into a short article, add a cover image, and publish. It goes live at /insights straight away." action={<Link href="/admin/insights/new" className="adm-btn adm-btn-primary"><Plus size={16} /> Write the first post</Link>} />
      ) : (
        <ul className="adm-list">
          {posts.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/insights/${p.id}`} className="adm-row">
                <span className="adm-thumb">
                  {p.cover_image_url
                    // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail
                    ? <img src={p.cover_image_url} alt="" />
                    : <ImageOff size={16} aria-hidden="true" />}
                </span>
                <span className="adm-row-text">
                  <strong>{p.title}</strong>
                  <small>/insights/{p.slug} · edited {new Date(p.updated_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</small>
                </span>
                <span className={`adm-pill ${p.status === "published" ? "is-live" : ""}`}>{p.status === "published" ? "Published" : "Draft"}</span>
                <PenLine size={16} className="adm-row-go" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
