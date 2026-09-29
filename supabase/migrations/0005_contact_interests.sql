-- Contact form "what do you need" options now match the 2026 packages and menu.
-- The old values stay allowed so any rows already saved remain valid.
alter table public.contact_submissions
  drop constraint if exists contact_submissions_service_interest_check;

alter table public.contact_submissions
  add constraint contact_submissions_service_interest_check check (
    service_interest in (
      'A monthly package',
      'Ads management',
      'Something from the menu',
      'The RM 199 audit',
      'Not sure yet',
      -- legacy options
      'Content Creation',
      'Social Media Management',
      'Ads & Growth',
      'Brand & Business'
    )
  );
