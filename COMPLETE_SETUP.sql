-- ============================================
-- COMPLETE SETUP SQL FOR PAGES + LINKS EDITOR
-- Copy and paste this entire file into Supabase SQL Editor
-- ============================================

-- 1) Create admin_users table
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 2) Create pages table
create table if not exists public.pages (
  id bigserial primary key,
  slug text not null unique,
  title text,
  subtitle text,
  avatar_url text,
  exclusive_preview_image text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Create page_links table
create table if not exists public.page_links (
  id bigserial primary key,
  page_id bigint not null references public.pages(id) on delete cascade,
  label text not null,
  url text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4) Create indexes for performance
create index if not exists idx_pages_slug on public.pages (slug);
create index if not exists idx_page_links_page_id on public.page_links (page_id);
create index if not exists idx_page_links_sort on public.page_links (page_id, sort_order, id);

-- 5) Enable Row Level Security
alter table public.admin_users enable row level security;
alter table public.pages enable row level security;
alter table public.page_links enable row level security;

-- 6) Drop existing policies if they exist (to avoid conflicts)
drop policy if exists "public_read_active_pages" on public.pages;
drop policy if exists "public_read_active_links" on public.page_links;
drop policy if exists "admins_select_admin_users" on public.admin_users;
drop policy if exists "admins_manage_pages" on public.pages;
drop policy if exists "admins_manage_page_links" on public.page_links;

-- 7) Create policies for public read access
create policy "public_read_active_pages"
on public.pages
for select
using (is_active = true);

create policy "public_read_active_links"
on public.page_links
for select
using (
  is_active = true
  and exists (
    select 1 from public.pages p
    where p.id = page_links.page_id and p.is_active = true
  )
);

-- 8) Create policies for admin access
create policy "admins_select_admin_users"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

create policy "admins_manage_pages"
on public.pages
for all
to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "admins_manage_page_links"
on public.page_links
for all
to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

-- ============================================
-- DONE! 
-- 
-- Next steps:
-- 1. Sign in to your app at /login (creates your user in auth.users)
-- 2. Find your user UUID in Supabase Dashboard → Authentication → Users
-- 3. Run this to add yourself as admin (replace YOUR_UUID_HERE):
--
--    insert into public.admin_users (user_id) values ('YOUR_UUID_HERE');
--
-- 4. Go to /admin/pages to start creating pages!
--
-- 5. AFTER migrating pages, run MIGRATION_ANALYTICS_UPDATE.sql to add link-level tracking
-- ============================================

