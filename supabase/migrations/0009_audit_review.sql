-- nxtte reviews a customer's details before payment opens. Approving unlocks
-- the Payment step; declining closes the audit with a reason shown to the customer.
alter table public.audit_requests
  add column if not exists approved_at timestamptz,
  add column if not exists declined_at timestamptz,
  add column if not exists decline_reason text not null default '' check (char_length(decline_reason) <= 500);

-- Audits that were already paid or claimed before this step existed stay usable.
update public.audit_requests set approved_at = coalesce(paid_at, payment_claimed_at, now())
where approved_at is null and payment_status in ('claimed', 'paid');
