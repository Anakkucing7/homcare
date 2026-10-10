alter table public.profiles add column if not exists address text not null default '';
grant update (full_name, phone, address) on public.profiles to authenticated;
