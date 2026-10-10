create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  address text not null default '',
  role text not null default 'user' check (role in ('user', 'owner')),
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists address text not null default '';

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, address) on public.profiles to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own contact details" on public.profiles;
create policy "Users can update their own contact details"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.create_homecare_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  );
  return new;
end;
$$;

revoke execute on function public.create_homecare_profile() from public, anon, authenticated;

drop trigger if exists on_homecare_user_created on auth.users;
create trigger on_homecare_user_created
  after insert on auth.users
  for each row execute procedure public.create_homecare_profile();

-- After creating the owner account, run this as project admin with that account's email:
-- update public.profiles set role = 'owner'
-- where id = (select id from auth.users where email = 'owner@example.com');
