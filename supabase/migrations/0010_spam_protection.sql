-- Spam protection. The site limits how often one visitor can submit a form or
-- try to sign in. Only a scrambled (SHA-256) form of the visitor's IP address is
-- stored, and rows older than a day are deleted by the site.
create table if not exists public.form_attempts (
  id bigint generated always as identity primary key,
  bucket text not null check (bucket in ('audit', 'contact', 'signin', 'link')),
  ip_hash text not null check (char_length(ip_hash) = 64),
  created_at timestamptz not null default now()
);
create index if not exists form_attempts_lookup on public.form_attempts (bucket, ip_hash, created_at desc);
create index if not exists form_attempts_created on public.form_attempts (created_at);
alter table public.form_attempts enable row level security;
-- No policies: only the server (service role) reads or writes this table.

-- The contact form now saves through the server like every other form, so the
-- public key can no longer write to this table directly and skip the checks.
drop policy if exists "anon can insert contact submissions" on public.contact_submissions;
