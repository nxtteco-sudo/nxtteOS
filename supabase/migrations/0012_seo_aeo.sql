-- SEO and AEO fields for Insights posts and case studies (ported from the
-- Aurexis 040 migration). All optional: empty values fall back to the title,
-- summary and cover image in code, so existing rows keep working unchanged.

alter table public.insight_posts
  add column if not exists seo_title        text not null default '' check (char_length(seo_title) <= 120),
  add column if not exists meta_description text not null default '' check (char_length(meta_description) <= 300),
  add column if not exists focus_keyword    text not null default '' check (char_length(focus_keyword) <= 80),
  add column if not exists og_image_url     text,
  add column if not exists canonical_url    text not null default '' check (char_length(canonical_url) <= 300),
  add column if not exists noindex          boolean not null default false,
  add column if not exists author_slug      text check (author_slug is null or author_slug in ('nemila', 'jay')),
  -- AEO: a short direct answer at the top, and questions answered at the end.
  add column if not exists takeaways        text not null default '' check (char_length(takeaways) <= 600),
  add column if not exists faqs             jsonb not null default '[]'::jsonb;

alter table public.case_studies
  add column if not exists seo_title        text not null default '' check (char_length(seo_title) <= 120),
  add column if not exists meta_description text not null default '' check (char_length(meta_description) <= 300),
  add column if not exists focus_keyword    text not null default '' check (char_length(focus_keyword) <= 80),
  add column if not exists noindex          boolean not null default false,
  add column if not exists faqs             jsonb not null default '[]'::jsonb;
