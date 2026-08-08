-- Pre-reservation lead tracking (status + notes)
-- Run in Supabase SQL Editor if schema.sql was already applied without these columns.

alter table public.pre_reservation_leads
  add column if not exists status text not null default 'new'
    check (status in ('new', 'contacted', 'scheduled', 'rejected', 'archived')),
  add column if not exists notes text not null default '',
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists pre_reservation_leads_set_updated_at on public.pre_reservation_leads;
create trigger pre_reservation_leads_set_updated_at
  before update on public.pre_reservation_leads
  for each row execute function public.set_updated_at();

create policy "Admin update pre-reservation leads"
  on public.pre_reservation_leads for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

notify pgrst, 'reload schema';
