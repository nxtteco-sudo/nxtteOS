-- Case studies for /work, written from /admin/work. Same model as insight_posts:
-- public reads published rows with the anon key, all writes go through the
-- service role after an admin check. Requires 0003 (admin_users, nxtte-media).
--
-- Spec (AGENTS.md section 4): each case is situation -> what nxtte did -> what
-- changed, with a number. Never publish a case without a result.

create table if not exists public.case_studies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  headline text not null check (char_length(headline) between 1 and 160),
  client_name text not null default '' check (char_length(client_name) <= 100),
  -- Shown on the tile, e.g. "Café, Petaling Jaya".
  client_type text not null default '' check (char_length(client_type) <= 100),
  -- Honesty label: a paying client, nxtte's own account, or unpaid trial work.
  case_type text not null default 'client' check (case_type in ('client', 'own', 'trial')),
  -- The one result line, e.g. "+38%" / "more profile visits" / "in 30 days".
  result_value text not null default '' check (char_length(result_value) <= 20),
  result_label text not null default '' check (char_length(result_label) <= 80),
  result_period text not null default '' check (char_length(result_period) <= 60),
  situation text not null default '',
  what_we_did text not null default '',
  what_changed text not null default '',
  -- Up to three supporting numbers: [{ "value": "4.6x", "label": "more saves" }]
  metrics jsonb not null default '[]'::jsonb,
  services text[] not null default '{}',
  testimonial_quote text not null default '' check (char_length(testimonial_quote) <= 400),
  testimonial_author text not null default '' check (char_length(testimonial_author) <= 100),
  cover_image_url text,
  cover_alt text not null default '' check (char_length(cover_alt) <= 200),
  status text not null default 'draft' check (status in ('draft', 'published')),
  -- Lower shows first; the page curates 3 to 6 tiles.
  sort_order integer not null default 100,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists case_studies_published_idx
  on public.case_studies (status, sort_order, published_at desc);

create or replace function public.case_studies_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists case_studies_touch on public.case_studies;
create trigger case_studies_touch
  before update on public.case_studies
  for each row execute function public.case_studies_touch();

alter table public.case_studies enable row level security;

drop policy if exists "public can read published case studies" on public.case_studies;
create policy "public can read published case studies"
  on public.case_studies
  for select
  to anon, authenticated
  using (status = 'published');
