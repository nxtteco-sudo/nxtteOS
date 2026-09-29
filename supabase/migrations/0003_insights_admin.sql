-- Insights (blog) posts, the admin allowlist and the public image bucket.
-- Names are nxtte-specific (insight_posts, admin_users, nxtte-media) so this can
-- run in a Supabase project shared with Aurexis without clashing.

-- Posts -----------------------------------------------------------------------
create table if not exists public.insight_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  title text not null check (char_length(title) between 1 and 200),
  excerpt text not null default '' check (char_length(excerpt) <= 300),
  body text not null default '',
  cover_image_url text,
  cover_alt text not null default '' check (char_length(cover_alt) <= 200),
  status text not null default 'draft' check (status in ('draft', 'published')),
  -- Set on first publish, kept after. Used for ordering only: the site shows no dates.
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists insight_posts_published_idx
  on public.insight_posts (status, published_at desc);

create or replace function public.insight_posts_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists insight_posts_touch on public.insight_posts;
create trigger insight_posts_touch
  before update on public.insight_posts
  for each row execute function public.insight_posts_touch();

alter table public.insight_posts enable row level security;

-- Visitors can read published posts only. Drafts are invisible to the anon key;
-- all writes go through the service role in server actions (after an admin check).
drop policy if exists "public can read published insights" on public.insight_posts;
create policy "public can read published insights"
  on public.insight_posts
  for select
  to anon, authenticated
  using (status = 'published');

-- Admins ----------------------------------------------------------------------
-- Allowlist of Supabase Auth users who may use /admin. No policies: only the
-- service role can read or write it.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- To add an admin: create the user in Supabase > Authentication > Users, then run
--   insert into public.admin_users (user_id)
--   select id from auth.users where email = 'name@example.com';

-- Images ----------------------------------------------------------------------
-- Public bucket for cover and in-post images. Uploads happen server-side with
-- the service role, so no storage.objects write policies are needed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('nxtte-media', 'nxtte-media', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;
