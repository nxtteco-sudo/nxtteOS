-- Accounts: income, payments received and expenses (the private /accounts
-- dashboard, ported from the Aurexis 038 migration without referrals).
-- Invoices and receipts from Documents, including RM 199 audit receipts, flow in
-- on their own. Written only by the server (service role) after an access
-- check, so RLS is on with no policies.

-- Who may open /accounts. Separate from admin and from Documents. Create the
-- person in Supabase Auth first, then:
--   insert into public.accounts_access (user_id)
--   select id from auth.users where email = 'you@nxtte.com';
create table if not exists public.accounts_access (
  user_id     uuid        primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);
alter table public.accounts_access enable row level security;

-- Money we are owed. One row per invoice or standalone receipt (document_id),
-- or per entry typed in by hand.
create table if not exists public.account_income (
  id           uuid          primary key default gen_random_uuid(),
  income_date  date          not null default current_date,
  client_name  text          not null default '' check (char_length(client_name) <= 160),
  project      text          not null default '' check (char_length(project) <= 200),
  description  text          not null default '' check (char_length(description) <= 400),
  amount       numeric(12,2) not null check (amount > 0),
  document_id  uuid          references public.documents (id) on delete set null,
  notes        text          not null default '' check (char_length(notes) <= 2000),
  created_at   timestamptz   not null default now(),
  updated_at   timestamptz   not null default now()
);
create unique index if not exists account_income_document_uniq on public.account_income (document_id) where document_id is not null;
create index if not exists account_income_date_idx on public.account_income (income_date desc);
alter table public.account_income enable row level security;

-- Money received against an income row. A receipt from Documents is one payment.
create table if not exists public.account_payments (
  id          uuid          primary key default gen_random_uuid(),
  income_id   uuid          not null references public.account_income (id) on delete cascade,
  amount      numeric(12,2) not null check (amount > 0),
  paid_on     date          not null default current_date,
  method      text          not null default '' check (char_length(method) <= 60),
  reference   text          not null default '' check (char_length(reference) <= 120),
  receipt_id  uuid          references public.documents (id) on delete set null,
  created_at  timestamptz   not null default now()
);
create unique index if not exists account_payments_receipt_uniq on public.account_payments (receipt_id) where receipt_id is not null;
create index if not exists account_payments_income_idx on public.account_payments (income_id);
create index if not exists account_payments_date_idx on public.account_payments (paid_on desc);
alter table public.account_payments enable row level security;

create table if not exists public.account_expenses (
  id            uuid          primary key default gen_random_uuid(),
  expense_date  date          not null default current_date,
  category      text          not null check (char_length(btrim(category)) between 1 and 80),
  vendor        text          not null default '' check (char_length(vendor) <= 160),
  amount        numeric(12,2) not null check (amount > 0),
  notes         text          not null default '' check (char_length(notes) <= 2000),
  created_at    timestamptz   not null default now(),
  updated_at    timestamptz   not null default now()
);
create index if not exists account_expenses_date_idx on public.account_expenses (expense_date desc);
alter table public.account_expenses enable row level security;
