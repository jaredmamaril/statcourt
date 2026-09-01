-- StatCourt feedback board tables, views, indexes, and RLS.
-- Run in Supabase SQL Editor after reviewing.
--
-- Privacy model:
-- - feedback_items and feedback_votes store raw user ownership data.
-- - public feedback reads are served through GET /api/feedback.
-- - individual voter rows are not publicly readable.

begin;

do $$
declare
  missing_tables text[];
begin
  select array_agg(table_name)
  into missing_tables
  from unnest(array[
    'public.user_profiles',
    'public.admin_users'
  ]) as required_tables(table_name)
  where to_regclass(table_name) is null;

  if missing_tables is not null then
    raise exception 'Missing required StatCourt tables: %',
      array_to_string(missing_tables, ', ');
  end if;
end $$;

create table if not exists public.feedback_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  details text not null,
  page_url text null,
  status text not null default 'new',
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint feedback_items_type_check
    check (type in ('bug', 'feature_request', 'ui_design', 'data_issue', 'other')),
  constraint feedback_items_status_check
    check (status in ('new', 'planned', 'in_progress', 'done', 'declined')),
  constraint feedback_items_title_length
    check (char_length(title) between 3 and 120),
  constraint feedback_items_details_length
    check (char_length(details) between 10 and 1200),
  constraint feedback_items_page_url_length
    check (page_url is null or char_length(page_url) <= 300),
  constraint feedback_items_page_url_path_check
    check (
      page_url is null
      or (
        page_url like '/%'
        and page_url not like '//%'
        and page_url not like '%://%'
      )
    )
);

create table if not exists public.feedback_votes (
  feedback_item_id uuid not null references public.feedback_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (feedback_item_id, user_id)
);

create or replace function public.set_feedback_item_timestamps()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at = now();
    new.updated_at = now();
    return new;
  end if;

  new.id = old.id;
  new.user_id = old.user_id;
  new.created_at = old.created_at;
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_feedback_item_timestamps() from public;

drop trigger if exists set_feedback_item_timestamps
on public.feedback_items;
drop trigger if exists set_feedback_item_updated_at
on public.feedback_items;

create trigger set_feedback_item_timestamps
before insert or update on public.feedback_items
for each row
execute function public.set_feedback_item_timestamps();

create or replace function public.set_feedback_vote_created_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_at = now();
  return new;
end;
$$;

revoke all on function public.set_feedback_vote_created_at() from public;

drop trigger if exists set_feedback_vote_created_at
on public.feedback_votes;

create trigger set_feedback_vote_created_at
before insert on public.feedback_votes
for each row
execute function public.set_feedback_vote_created_at();

drop function if exists public.is_feedback_item_votable(uuid);

create index if not exists feedback_items_public_created_at_idx
on public.feedback_items using btree (created_at desc)
where is_hidden = false;

create index if not exists feedback_items_public_status_created_at_idx
on public.feedback_items using btree (status, created_at desc)
where is_hidden = false;

create index if not exists feedback_items_user_created_at_idx
on public.feedback_items using btree (user_id, created_at desc);

create index if not exists feedback_votes_item_created_at_idx
on public.feedback_votes using btree (feedback_item_id, created_at desc);

alter table public.feedback_items enable row level security;
alter table public.feedback_votes enable row level security;

drop view if exists public.public_feedback_vote_counts;
drop view if exists public.public_feedback_items;

-- Public feedback reads intentionally go through the trusted server API route
-- instead of SECURITY DEFINER views, so raw UUID-bearing tables remain private.

drop policy if exists "StatCourt read public feedback items"
on public.feedback_items;
drop policy if exists "StatCourt read own feedback items"
on public.feedback_items;
drop policy if exists "StatCourt insert own feedback items"
on public.feedback_items;
drop policy if exists "StatCourt update own feedback items"
on public.feedback_items;
drop policy if exists "StatCourt update own new feedback items"
on public.feedback_items;
drop policy if exists "StatCourt delete own feedback items"
on public.feedback_items;
drop policy if exists "StatCourt delete own new feedback items"
on public.feedback_items;

create policy "StatCourt read own feedback items"
on public.feedback_items
for select
to authenticated
using (auth.uid() = user_id);

create policy "StatCourt insert own feedback items"
on public.feedback_items
for insert
to authenticated
with check (
  auth.uid() = user_id
  and is_hidden = false
  and status = 'new'
);

create policy "StatCourt update own new feedback items"
on public.feedback_items
for update
to authenticated
using (
  auth.uid() = user_id
  and status = 'new'
  and is_hidden = false
)
with check (
  auth.uid() = user_id
  and status = 'new'
  and is_hidden = false
);

create policy "StatCourt delete own new feedback items"
on public.feedback_items
for delete
to authenticated
using (
  auth.uid() = user_id
  and status = 'new'
  and is_hidden = false
);

drop policy if exists "StatCourt read visible feedback votes"
on public.feedback_votes;
drop policy if exists "StatCourt read own feedback votes"
on public.feedback_votes;
drop policy if exists "StatCourt insert own feedback votes"
on public.feedback_votes;
drop policy if exists "StatCourt delete own feedback votes"
on public.feedback_votes;

create policy "StatCourt read own feedback votes"
on public.feedback_votes
for select
to authenticated
using (auth.uid() = user_id);

-- Vote mutations are performed only through /api/feedback/votes after
-- authenticated server-side authorization and feedback visibility checks.

commit;
