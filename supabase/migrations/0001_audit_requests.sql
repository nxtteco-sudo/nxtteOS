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
create policy "anon can insert audit requests"
  on public.audit_requests
  for insert
  to anon
  with check (true);
