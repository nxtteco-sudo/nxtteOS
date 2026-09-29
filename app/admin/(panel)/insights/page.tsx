import Link from "next/link";
import { ImageOff, PenLine, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

// AGENTS.md: Insights goes in the site nav only once six posts are live.
const NAV_THRESHOLD = 6;

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
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Insights</h1>
          <p>{live} published, {posts.length - live} draft{posts.length - live === 1 ? "" : "s"}</p>
        </div>
        <Link href="/admin/insights/new" className="adm-btn adm-btn-primary"><Plus size={16} /> New post</Link>
      </header>

      <div className="adm-goal" role="status">
        <div className="adm-goal-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, (live / NAV_THRESHOLD) * 100)}%` }} /></div>
        <span>
          {live >= NAV_THRESHOLD
            ? "Six or more posts are live, so Insights can go in the site menu."
            : `${live} of ${NAV_THRESHOLD} posts live. The spec keeps Insights out of the site menu until six are published.`}
        </span>
      </div>

      {error && <p className="adm-error" role="alert">Could not load posts. Check that the migration has been run.</p>}

      {posts.length === 0 && !error ? (
        <div className="adm-empty">
          <h2>No posts yet</h2>
          <p>Turn one of your Instagram carousels into a 400 to 700 word post.</p>
          <Link href="/admin/insights/new" className="adm-btn adm-btn-primary"><Plus size={16} /> Write the first post</Link>
        </div>
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
