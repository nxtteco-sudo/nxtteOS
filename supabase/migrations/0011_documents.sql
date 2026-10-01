-- Documents: proposals, invoices and receipts (the private /documents dashboard).
-- Each row keeps the full form data (`data`) so a document can be reopened,
-- duplicated or re-downloaded exactly as issued. Written only by the server
-- (service role) after an access check, so RLS is on with no policies.
create table if not exists public.documents (
  id          uuid          primary key default gen_random_uuid(),
  kind        text          not null check (kind in ('proposal', 'invoice', 'receipt')),
  number      text          not null check (char_length(btrim(number)) between 1 and 60),
  title       text          not null default '' check (char_length(title) <= 200),
  status      text          not null default 'issued' check (status in ('issued', 'void')),
  data        jsonb         not null,
  total_myr   numeric(12,2) not null default 0 check (total_myr >= 0),
  doc_date    date          not null default current_date,
  -- The invoice a receipt pays, when it was made from one.
  source_id   uuid          references public.documents (id) on delete set null,
  -- The RM 199 audit a receipt was issued for (created when an audit is marked paid).
  audit_id    uuid          references public.audit_requests (id) on delete set null,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now(),
  unique (kind, number)
);
create index if not exists documents_kind_date_idx on public.documents (kind, doc_date desc);
create unique index if not exists documents_audit_receipt_idx on public.documents (audit_id) where kind = 'receipt' and audit_id is not null;
alter table public.documents enable row level security;

-- Who may open /documents. Separate from admin: being an admin does not grant
-- access. Add a person by creating their user in Supabase Auth, then:
--   insert into public.documents_access (user_id)
--   select id from auth.users where email = 'doc@nxtte.com';
create table if not exists public.documents_access (
  user_id     uuid        primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);
alter table public.documents_access enable row level security;
