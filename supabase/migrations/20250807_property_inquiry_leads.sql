-- Property owner inquiry leads (¿Tienes una propiedad?)
-- Run in Supabase SQL Editor if schema.sql was already applied without this table.

create table if not exists public.property_inquiry_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  property_details text not null,
  locale text not null default 'es' check (locale in ('es', 'en')),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'scheduled', 'rejected', 'archived')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists property_inquiry_leads_status_idx on public.property_inquiry_leads (status);
create index if not exists property_inquiry_leads_created_at_idx on public.property_inquiry_leads (created_at desc);

drop trigger if exists property_inquiry_leads_set_updated_at on public.property_inquiry_leads;
create trigger property_inquiry_leads_set_updated_at
  before update on public.property_inquiry_leads
  for each row execute function public.set_updated_at();

alter table public.property_inquiry_leads enable row level security;

create policy "Public insert property inquiry leads"
  on public.property_inquiry_leads for insert
  with check (true);

create policy "Admin read property inquiry leads"
  on public.property_inquiry_leads for select
  using (auth.role() = 'authenticated');

create policy "Admin update property inquiry leads"
  on public.property_inquiry_leads for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

notify pgrst, 'reload schema';
