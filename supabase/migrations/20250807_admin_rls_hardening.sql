-- Dashboard admin access: restrict authenticated policies to an explicit email allowlist.
-- 1. Replace admin emails below with real Supabase Auth users.
-- 2. Run in Supabase SQL Editor (or via CLI migrate).

create or replace function public.is_dashboard_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() ->> 'email', '') = any (
    array[
      'admin@hospedajesvalle.com'
    ]::text[]
  );
$$;

revoke all on function public.is_dashboard_admin() from public;
grant execute on function public.is_dashboard_admin() to authenticated;

-- Properties
drop policy if exists "Authenticated users can manage properties" on public.properties;
drop policy if exists "Authenticated full access properties" on public.properties;
drop policy if exists "Authenticated users can read properties" on public.properties;
drop policy if exists "Authenticated users can insert properties" on public.properties;
drop policy if exists "Authenticated users can update properties" on public.properties;
drop policy if exists "Authenticated users can delete properties" on public.properties;

create policy "Dashboard admins can read properties"
  on public.properties for select to authenticated
  using (public.is_dashboard_admin());

create policy "Dashboard admins can insert properties"
  on public.properties for insert to authenticated
  with check (public.is_dashboard_admin());

create policy "Dashboard admins can update properties"
  on public.properties for update to authenticated
  using (public.is_dashboard_admin())
  with check (public.is_dashboard_admin());

create policy "Dashboard admins can delete properties"
  on public.properties for delete to authenticated
  using (public.is_dashboard_admin());

-- Pre-reservation leads
drop policy if exists "Authenticated users can read pre_reservation_leads" on public.pre_reservation_leads;
drop policy if exists "Authenticated users can update pre_reservation_leads" on public.pre_reservation_leads;

create policy "Dashboard admins can read pre_reservation_leads"
  on public.pre_reservation_leads for select to authenticated
  using (public.is_dashboard_admin());

create policy "Dashboard admins can update pre_reservation_leads"
  on public.pre_reservation_leads for update to authenticated
  using (public.is_dashboard_admin())
  with check (public.is_dashboard_admin());

-- Property inquiry leads
drop policy if exists "Authenticated users can read property_inquiry_leads" on public.property_inquiry_leads;
drop policy if exists "Authenticated users can update property_inquiry_leads" on public.property_inquiry_leads;

create policy "Dashboard admins can read property_inquiry_leads"
  on public.property_inquiry_leads for select to authenticated
  using (public.is_dashboard_admin());

create policy "Dashboard admins can update property_inquiry_leads"
  on public.property_inquiry_leads for update to authenticated
  using (public.is_dashboard_admin())
  with check (public.is_dashboard_admin());
