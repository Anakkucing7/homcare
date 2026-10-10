create table if not exists public.service_categories (
  id text primary key,
  name text not null,
  description text not null default '',
  image_url text not null default '/images/homecare-visit.jpg',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  category_id text not null references public.service_categories(id) on update cascade on delete restrict,
  name text not null,
  description text not null default '',
  note text not null default '',
  price integer not null check (price >= 0),
  media_url text not null default '/images/homecare-visit.jpg',
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists services_category_name_key on public.services (category_id, name);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  service_name text not null default '',
  description text not null default '',
  media_url text not null default '/images/homecare-visit.jpg',
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.testimonials enable row level security;

revoke all on public.service_categories, public.services, public.testimonials from anon, authenticated;
grant select on public.service_categories, public.services, public.testimonials to anon, authenticated;
grant insert, update, delete on public.service_categories, public.services, public.testimonials to authenticated;

drop policy if exists "Public reads active service categories" on public.service_categories;
create policy "Public reads active service categories" on public.service_categories
  for select to anon, authenticated using (active or (select auth.uid()) in (select id from public.profiles where role = 'owner'));
drop policy if exists "Owner manages service categories" on public.service_categories;
create policy "Owner manages service categories" on public.service_categories
  for all to authenticated
  using ((select auth.uid()) in (select id from public.profiles where role = 'owner'))
  with check ((select auth.uid()) in (select id from public.profiles where role = 'owner'));

drop policy if exists "Public reads active services" on public.services;
create policy "Public reads active services" on public.services
  for select to anon, authenticated using (active or (select auth.uid()) in (select id from public.profiles where role = 'owner'));
drop policy if exists "Owner manages services" on public.services;
create policy "Owner manages services" on public.services
  for all to authenticated
  using ((select auth.uid()) in (select id from public.profiles where role = 'owner'))
  with check ((select auth.uid()) in (select id from public.profiles where role = 'owner'));

drop policy if exists "Public reads published testimonials" on public.testimonials;
create policy "Public reads published testimonials" on public.testimonials
  for select to anon, authenticated using (published or (select auth.uid()) in (select id from public.profiles where role = 'owner'));
drop policy if exists "Owner manages testimonials" on public.testimonials;
create policy "Owner manages testimonials" on public.testimonials
  for all to authenticated
  using ((select auth.uid()) in (select id from public.profiles where role = 'owner'))
  with check ((select auth.uid()) in (select id from public.profiles where role = 'owner'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('homecare-media', 'homecare-media', true, 52428800, array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Owner uploads homecare media" on storage.objects;
create policy "Owner uploads homecare media" on storage.objects for insert to authenticated
  with check (bucket_id = 'homecare-media' and (select auth.uid()) in (select id from public.profiles where role = 'owner'));
drop policy if exists "Owner updates homecare media" on storage.objects;
create policy "Owner updates homecare media" on storage.objects for update to authenticated
  using (bucket_id = 'homecare-media' and (select auth.uid()) in (select id from public.profiles where role = 'owner'))
  with check (bucket_id = 'homecare-media' and (select auth.uid()) in (select id from public.profiles where role = 'owner'));
drop policy if exists "Owner deletes homecare media" on storage.objects;
create policy "Owner deletes homecare media" on storage.objects for delete to authenticated
  using (bucket_id = 'homecare-media' and (select auth.uid()) in (select id from public.profiles where role = 'owner'));

insert into public.service_categories (id, name, description, sort_order) values
  ('infus', 'Layanan infus', 'Pilihan layanan infus sesuai kebutuhan kunjungan.', 1),
  ('suntik', 'Layanan suntik', 'Layanan suntik dan paket sesuai kebutuhan.', 2),
  ('cek-darah', 'Cek darah', 'Pemeriksaan sederhana yang tersedia.', 3),
  ('ngt', 'Layanan NGT', 'Pemasangan, pemberian makan, dan pelepasan NGT.', 4),
  ('luka', 'Perawatan luka', 'Perawatan luka berdasarkan jenis perawatan.', 5)
on conflict (id) do nothing;

insert into public.services (category_id, name, description, note, price, sort_order) values
  ('infus', 'Infus Vitamin C 500', '', '', 225000, 1),
  ('infus', 'Infus Vitamin C 1000', '', '', 245000, 2),
  ('infus', 'Infus Vitamin B Kompleks', '', '', 250000, 3),
  ('infus', 'Infus Vitamin C & B Kompleks', '', 'Vitamin C 500 + B Kompleks (B1, B6, B12)', 325000, 4),
  ('infus', 'Infus Extra Vitamin C & B Kompleks', '', 'Vitamin C 1000 + B Kompleks (B1, B6, B12)', 350000, 5),
  ('infus', 'Infus Multivitamin Viviena-9', '', '9 multivitamin: Vitamin C + B1, B2, B3, B5, B6, B7, B9, B12', 450000, 6),
  ('infus', 'Infus Extra Multivitamin Cernevit', '', '12 multivitamin: Vitamin A, D3, E, C + B1, B2, B3, B5, B6, B7, B9, B12', 650000, 7),
  ('infus', 'Infus Whitening & Multivitamin', '', '', 1250000, 8),
  ('infus', 'Infus Demam', '', '', 150000, 9),
  ('infus', 'Infus Rehidrasi / Dehidrasi', '', '', 150000, 10),
  ('suntik', 'Suntik Vitamin C 500', '', '', 215000, 1),
  ('suntik', 'Suntik Vitamin C 1000', '', '', 225000, 2),
  ('suntik', 'Suntik Vitamin B Kompleks', '', 'B1, B6, B12', 245000, 3),
  ('suntik', 'Suntik Anti Alergi', '', '', 185000, 4),
  ('suntik', 'Suntik Pereda Nyeri', '', '', 185000, 5),
  ('suntik', 'Suntik Anti Radang', '', '', 185000, 6),
  ('suntik', 'Suntik Anti Mual', '', '', 185000, 7),
  ('suntik', 'Suntik Asam Lambung / GERD', '', '', 200000, 8),
  ('suntik', 'Suntik (Bundle) Anti Mual & Asam Lambung / GERD', '', '', 300000, 9),
  ('suntik', 'Suntik (Extra Bundle) Pereda Nyeri, Mual & Asam Lambung / GERD', '', '', 350000, 10),
  ('suntik', 'Jasa Infus / Suntik saja (tanpa obat)', '', '', 166500, 11),
  ('cek-darah', 'Gula Darah Sewaktu (GDS)', '', '', 35000, 1),
  ('cek-darah', 'Asam Urat', '', '', 40000, 2),
  ('cek-darah', 'Kolesterol Total', '', '', 45000, 3),
  ('cek-darah', 'Cek Darah Bundle: GDS + Asam Urat + Kolesterol Total', '', '', 120000, 4),
  ('ngt', 'Pemasangan NGT', '', '', 300000, 1),
  ('ngt', 'Pemberian Makan lewat NGT', '', '', 100000, 2),
  ('ngt', 'Pelepasan NGT', '', '', 300000, 3),
  ('luka', 'Perawatan Luka Pasca Operasi', '', '', 300000, 1),
  ('luka', 'Perawatan Luka Kronis', '', '', 300000, 2),
  ('luka', 'Perawatan Luka Caesar', '', '', 300000, 3),
  ('luka', 'Perawatan Luka Tekan / Decubitus', '', '', 285000, 4),
  ('luka', 'Perawatan Luka Bakar', '', '', 285000, 5),
  ('luka', 'Perawatan Luka Diabetes', '', '', 285000, 6),
  ('luka', 'Perawatan Luka Kecelakaan', '', '', 285000, 7),
  ('luka', 'Perawatan Luka Umum', '', '', 150000, 8),
  ('luka', 'Perawatan Buka Jahitan', '', '', 150000, 9)
on conflict (category_id, name) do nothing;
