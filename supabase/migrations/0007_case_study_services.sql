-- Case studies can be filed under any nxtte service, and can show more than one
-- image: a gallery, and a before / after pair for redesign work.
alter table public.case_studies
  add column if not exists category text not null default 'social'
    check (category in ('social', 'content', 'growth', 'brand', 'start')),
  -- [{ "url": "https://...", "alt": "Page 3, services spread" }], up to 8
  add column if not exists gallery jsonb not null default '[]'::jsonb,
  add column if not exists before_image_url text,
  add column if not exists after_image_url text;

create index if not exists case_studies_category_idx on public.case_studies (category);
