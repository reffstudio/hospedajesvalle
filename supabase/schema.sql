-- Hospedajes Valle — Supabase schema (MVP)
-- Run in Supabase SQL Editor or via: supabase db push

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Properties
-- ---------------------------------------------------------------------------
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  price_label text not null,
  currency text not null check (currency in ('MXN', 'USD')),
  status text not null default 'draft' check (status in ('published', 'hidden', 'draft')),
  stay_type text not null default 'private' check (stay_type in ('private', 'shared', 'events')),
  featured boolean not null default false,
  featured_order int,
  max_guests int not null default 2,
  bedrooms int not null default 1,
  full_bathrooms int not null default 1,
  half_bathrooms int not null default 0,
  includes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_status_idx on public.properties (status);
create index if not exists properties_stay_type_idx on public.properties (stay_type);
create index if not exists properties_featured_idx on public.properties (featured, featured_order);

-- ---------------------------------------------------------------------------
-- Property images (Supabase Storage path + public URL)
-- ---------------------------------------------------------------------------
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists property_images_property_id_idx on public.property_images (property_id, sort_order);

-- ---------------------------------------------------------------------------
-- Global custom amenities catalog
-- ---------------------------------------------------------------------------
create table if not exists public.custom_amenities (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  icon_id text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Catalog amenity junctions (amenity_id matches lib/property-amenities.ts)
-- ---------------------------------------------------------------------------
create table if not exists public.property_amenities (
  property_id uuid not null references public.properties (id) on delete cascade,
  amenity_id text not null,
  primary key (property_id, amenity_id)
);

create table if not exists public.property_highlight_amenities (
  property_id uuid not null references public.properties (id) on delete cascade,
  amenity_id text not null,
  primary key (property_id, amenity_id)
);

create table if not exists public.property_custom_amenities (
  property_id uuid not null references public.properties (id) on delete cascade,
  custom_amenity_id uuid not null references public.custom_amenities (id) on delete cascade,
  is_highlight boolean not null default false,
  primary key (property_id, custom_amenity_id)
);

-- ---------------------------------------------------------------------------
-- Pre-reservation leads (public insert, admin read)
-- ---------------------------------------------------------------------------
create table if not exists public.pre_reservation_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  guests int not null,
  property_ids jsonb not null default '[]'::jsonb,
  check_in date not null,
  check_out date not null,
  locale text not null default 'es' check (locale in ('es', 'en')),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'scheduled', 'rejected', 'archived')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pre_reservation_leads_status_idx on public.pre_reservation_leads (status);
create index if not exists pre_reservation_leads_created_at_idx on public.pre_reservation_leads (created_at desc);

drop trigger if exists pre_reservation_leads_set_updated_at on public.pre_reservation_leads;
create trigger pre_reservation_leads_set_updated_at
  before update on public.pre_reservation_leads
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Property owner inquiries (public insert, admin read)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.custom_amenities enable row level security;
alter table public.property_amenities enable row level security;
alter table public.property_highlight_amenities enable row level security;
alter table public.property_custom_amenities enable row level security;
alter table public.pre_reservation_leads enable row level security;
alter table public.property_inquiry_leads enable row level security;

-- Public read: published properties and related rows
create policy "Public read published properties"
  on public.properties for select
  using (status = 'published');

create policy "Public read images of published properties"
  on public.property_images for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.status = 'published'
    )
  );

create policy "Public read custom amenities"
  on public.custom_amenities for select
  using (true);

create policy "Public read amenities of published properties"
  on public.property_amenities for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.status = 'published'
    )
  );

create policy "Public read highlight amenities of published properties"
  on public.property_highlight_amenities for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.status = 'published'
    )
  );

create policy "Public read custom amenities of published properties"
  on public.property_custom_amenities for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.status = 'published'
    )
  );

-- Anyone can submit a lead (rate-limit at edge/API in production)
create policy "Public insert pre-reservation leads"
  on public.pre_reservation_leads
  for insert
  to anon, authenticated
  with check (true);

-- Authenticated dashboard users (admin role) — adjust to your auth setup
-- Example: users with app_metadata.role = 'admin'
create policy "Admin full access properties"
  on public.properties for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin full access property_images"
  on public.property_images for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin full access custom_amenities"
  on public.custom_amenities for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin full access property_amenities"
  on public.property_amenities for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin full access property_highlight_amenities"
  on public.property_highlight_amenities for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin full access property_custom_amenities"
  on public.property_custom_amenities for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin read pre-reservation leads"
  on public.pre_reservation_leads for select
  using (auth.role() = 'authenticated');

create policy "Admin update pre-reservation leads"
  on public.pre_reservation_leads for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Public insert property inquiry leads"
  on public.property_inquiry_leads
  for insert
  to anon, authenticated
  with check (true);

create policy "Admin read property inquiry leads"
  on public.property_inquiry_leads for select
  using (auth.role() = 'authenticated');

create policy "Admin update property inquiry leads"
  on public.property_inquiry_leads for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Storage bucket (run in Dashboard or via API)
-- Bucket: property-images, public read, authenticated write
-- Path pattern: {property_id}/{uuid}-{filename}
-- ---------------------------------------------------------------------------

-- Refresh PostgREST schema cache after creating tables
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- Storage policies — also in supabase/storage-policies.sql (run after bucket exists)
-- ---------------------------------------------------------------------------
-- drop policy if exists "Public read property images" on storage.objects;
-- create policy "Public read property images"
--   on storage.objects for select to public
--   using (bucket_id = 'property-images');
-- ... (see storage-policies.sql)
