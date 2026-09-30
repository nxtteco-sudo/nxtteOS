-- nxtte: full database setup (migrations 0001 to 0006 in order).
-- GENERATED from supabase/migrations/ for one-time setup; the migration files
-- are the source of truth. Paste into Supabase > SQL Editor and press Run.
-- It runs as one transaction: if anything fails, nothing is changed.
-- Safe to run again.

begin;

-- ===== 0001_audit_requests.sql =====
create table if not exists public.audit_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  business text not null check (char_length(business) between 1 and 100),
  instagram text not null check (char_length(instagram) between 1 and 31),
  whatsapp text not null check (char_length(whatsapp) between 8 and 20),
  created_at timestamptz not null default now()
);

alter table public.audit_requests enable row level security;

-- Anonymous visitors may insert, never read. Reads happen via the dashboard or
-- a service-role key only.
drop policy if exists "anon can insert audit requests" on public.audit_requests;
create policy "anon can insert audit requests"
  on public.audit_requests
  for insert
  to anon
  with check (true);

-- ===== 0002_contact_submissions.sql =====
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  business text not null check (char_length(business) between 1 and 100),
  instagram text not null check (char_length(instagram) between 1 and 31),
  whatsapp text not null check (char_length(whatsapp) between 8 and 20),
  service_interest text not null check (
    service_interest in (
      'Content Creation',
      'Social Media Management',
      'Ads & Growth',
      'Brand & Business'
    )
  ),
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

-- Anonymous visitors may insert, never read. Reads happen via the dashboard or
-- a service-role key only.
drop policy if exists "anon can insert contact submissions" on public.contact_submissions;
create policy "anon can insert contact submissions"
  on public.contact_submissions
  for insert
  to anon
  with check (true);

-- ===== 0003_insights_admin.sql =====
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

-- ===== 0004_case_studies.sql =====
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

-- ===== 0005_contact_interests.sql =====
-- Contact form "what do you need" options now match the 2026 packages and menu.
-- The old values stay allowed so any rows already saved remain valid.
alter table public.contact_submissions
  drop constraint if exists contact_submissions_service_interest_check;

alter table public.contact_submissions
  add constraint contact_submissions_service_interest_check check (
    service_interest in (
      'A monthly package',
      'Ads management',
      'Something from the menu',
      'The RM 199 audit',
      'Not sure yet',
      -- legacy options
      'Content Creation',
      'Social Media Management',
      'Ads & Growth',
      'Brand & Business'
    )
  );

-- ===== 0006_audit_dashboard.sql =====
-- Customer audit dashboard (/my) and the admin CRM (/admin leads, audits, settings).
-- Everything here is server-only: RLS is on with no public policies, and all
-- reads and writes go through the service role after a token or admin check.

-- Audits: extend the original request row with the dashboard fields -----------
alter table public.audit_requests
  add column if not exists reference text unique,
  add column if not exists email text check (email is null or char_length(email) <= 254),
  add column if not exists goals text not null default '' check (char_length(goals) <= 1500),
  add column if not exists ideal_customer text not null default '' check (char_length(ideal_customer) <= 800),
  add column if not exists best_sellers text not null default '' check (char_length(best_sellers) <= 800),
  add column if not exists competitors text not null default '' check (char_length(competitors) <= 800),
  add column if not exists other_platforms text not null default '' check (char_length(other_platforms) <= 400),
  add column if not exists notes text not null default '' check (char_length(notes) <= 1500),
  add column if not exists details_submitted_at timestamptz,
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'claimed', 'paid')),
  add column if not exists payment_claimed_at timestamptz,
  add column if not exists payment_proof_path text,
  add column if not exists paid_at timestamptz,
  add column if not exists amount integer not null default 199,
  add column if not exists work_started_at timestamptz,
  add column if not exists report_path text,
  add column if not exists report_ready_at timestamptz,
  add column if not exists admin_notes text not null default '',
  add column if not exists updated_at timestamptz not null default now();

create index if not exists audit_requests_created_idx on public.audit_requests (created_at desc);
create index if not exists audit_requests_email_idx on public.audit_requests (lower(email));

-- The audit form now writes through the server (it must create the customer's
-- private link), so visitors can no longer insert rows directly.
drop policy if exists "anon can insert audit requests" on public.audit_requests;

-- Contact leads: workflow fields for the admin inbox --------------------------
alter table public.contact_submissions
  add column if not exists status text not null default 'new'
    check (status in ('new', 'contacted', 'won', 'lost')),
  add column if not exists admin_notes text not null default '',
  add column if not exists updated_at timestamptz not null default now();

-- Visitors may still insert a contact lead, but only as a fresh, untouched row.
drop policy if exists "anon can insert contact submissions" on public.contact_submissions;
create policy "anon can insert contact submissions"
  on public.contact_submissions
  for insert
  to anon
  with check (status = 'new' and admin_notes = '');

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists audit_requests_touch on public.audit_requests;
create trigger audit_requests_touch before update on public.audit_requests
  for each row execute function public.touch_updated_at();

drop trigger if exists contact_submissions_touch on public.contact_submissions;
create trigger contact_submissions_touch before update on public.contact_submissions
  for each row execute function public.touch_updated_at();

-- Private links: only a SHA-256 hash of each link token is stored --------------
create table if not exists public.audit_tokens (
  token_hash text primary key,
  audit_id uuid not null references public.audit_requests (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists audit_tokens_audit_idx on public.audit_tokens (audit_id);
alter table public.audit_tokens enable row level security;

-- Messages between the customer and nxtte -------------------------------------
create table if not exists public.audit_messages (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audit_requests (id) on delete cascade,
  sender text not null check (sender in ('customer', 'nxtte')),
  body text not null check (char_length(body) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists audit_messages_audit_idx on public.audit_messages (audit_id, created_at);
alter table public.audit_messages enable row level security;

-- Settings the admin edits (payment details shown to customers) ---------------
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;

-- Private files: audit reports and payment proofs. Never public; the server
-- hands out short-lived signed links after checking who is asking.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('nxtte-private', 'nxtte-private', false, 10485760,
        array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

commit;
