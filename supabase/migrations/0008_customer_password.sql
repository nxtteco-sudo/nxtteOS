-- Customer login with email and password (in addition to the private link).
-- Only a salted scrypt hash is stored. Failed attempts are counted so a login
-- can be locked for a while after too many wrong passwords.
alter table public.audit_requests
  add column if not exists password_hash text,
  add column if not exists login_failed_count integer not null default 0,
  add column if not exists login_locked_until timestamptz;
