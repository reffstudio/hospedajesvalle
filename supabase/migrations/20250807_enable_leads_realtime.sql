-- Enable Supabase Realtime for dashboard lead tables (live updates without refresh).
-- Safe to run multiple times — ignores tables already in the publication.

do $$
begin
  alter publication supabase_realtime add table public.pre_reservation_leads;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.property_inquiry_leads;
exception
  when duplicate_object then null;
end $$;
