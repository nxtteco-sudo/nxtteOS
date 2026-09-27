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
create policy "anon can insert contact submissions"
  on public.contact_submissions
  for insert
  to anon
  with check (true);
