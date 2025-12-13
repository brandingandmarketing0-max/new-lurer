# Supabase Setup: DB-backed Pages + Links (Editor-Friendly)

This adds **two configuration tables** so you can create/edit pages and their links from the app:

- `pages`: one row per public page (slug, title, avatar, etc.)
- `page_links`: multiple rows per page (label + url + ordering)

It also adds an `admin_users` table to restrict editing to approved Supabase Auth users.

## 1) Create tables

Run this in the Supabase SQL editor:

```sql
-- 1) Admin allowlist (who can edit)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 2) Pages
create table if not exists public.pages (
  id bigserial primary key,
  slug text not null unique,
  title text,
  subtitle text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Links for a page
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

create index if not exists idx_pages_slug on public.pages (slug);
create index if not exists idx_page_links_page_id on public.page_links (page_id);
create index if not exists idx_page_links_sort on public.page_links (page_id, sort_order, id);
```

## 2) Enable RLS + policies

Run this in the Supabase SQL editor:

```sql
alter table public.admin_users enable row level security;
alter table public.pages enable row level security;
alter table public.page_links enable row level security;

-- Public can read only active pages + active links (so public pages can render)
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

-- Admin users can do everything
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
```

## 3) Add yourself as an admin

1. Sign in to the app once (so your user exists in `auth.users`)
2. Find your user id in Supabase Auth → Users
3. Insert into `admin_users`:

```sql
insert into public.admin_users (user_id) values ('YOUR_AUTH_USER_UUID');
```

## 4) Seed pages (optional)

Use the admin UI at `/admin/pages` to create pages + links.

For existing slugs, you can just create matching `pages.slug` rows (e.g. `jen`, `sel`, etc.).


