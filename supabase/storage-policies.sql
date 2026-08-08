-- Hospedajes Valle — Storage policies for property-images bucket
-- Run in Supabase SQL Editor AFTER creating the bucket "property-images"

drop policy if exists "Public read property images" on storage.objects;
create policy "Public read property images"
  on storage.objects for select
  to public
  using (bucket_id = 'property-images');

drop policy if exists "Authenticated upload property images" on storage.objects;
create policy "Authenticated upload property images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'property-images');

drop policy if exists "Authenticated update property images" on storage.objects;
create policy "Authenticated update property images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'property-images');

drop policy if exists "Authenticated delete property images" on storage.objects;
create policy "Authenticated delete property images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'property-images');

notify pgrst, 'reload schema';
