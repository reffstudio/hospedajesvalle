-- Ensure public (anon) can insert leads from the website forms.
-- Safe to re-run: drops and recreates insert policies.

drop policy if exists "Public insert pre-reservation leads" on public.pre_reservation_leads;
create policy "Public insert pre-reservation leads"
  on public.pre_reservation_leads
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public insert property inquiry leads" on public.property_inquiry_leads;
create policy "Public insert property inquiry leads"
  on public.property_inquiry_leads
  for insert
  to anon, authenticated
  with check (true);

notify pgrst, 'reload schema';
