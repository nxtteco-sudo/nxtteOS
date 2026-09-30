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
