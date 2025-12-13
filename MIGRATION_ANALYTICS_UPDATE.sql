-- ============================================
-- UPDATE ANALYTICS TO TRACK BY LINK ID
-- Run this AFTER migrating pages to database
-- ============================================

-- Add link_id column to all existing analytics tables
-- This allows tracking clicks per individual link instead of just page-wide

-- First, let's create a unified analytics table that can track by link_id
create table if not exists public.link_analytics (
  id bigserial primary key,
  page_id bigint references public.pages(id) on delete cascade,
  link_id bigint references public.page_links(id) on delete set null,
  page_slug text not null, -- Keep for backward compatibility
  referrer text,
  readable_referrer text,
  user_agent text,
  ip_address varchar(45),
  timestamp timestamptz not null,
  pathname text,
  search_params text,
  click_type text default 'page_visit', -- page_visit, link_click, etc.
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_link_analytics_page_id on public.link_analytics(page_id);
create index if not exists idx_link_analytics_link_id on public.link_analytics(link_id);
create index if not exists idx_link_analytics_page_slug on public.link_analytics(page_slug);
create index if not exists idx_link_analytics_created_at on public.link_analytics(created_at desc);
create index if not exists idx_link_analytics_click_type on public.link_analytics(click_type);

-- Enable RLS
alter table public.link_analytics enable row level security;

-- Public can't read analytics (admin only)
create policy "admins_read_link_analytics"
on public.link_analytics
for select
to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

-- Allow inserts (for tracking)
create policy "allow_link_analytics_inserts"
on public.link_analytics
for insert
with check (true);

-- ============================================
-- NOTE: Existing ${page}_analytics tables will continue to work
-- New tracking will go to link_analytics with link_id
-- You can migrate old data later if needed
-- ============================================

