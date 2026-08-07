-- StatCourt RLS baseline
-- Run in Supabase SQL Editor after reviewing.
--
-- Notes:
-- - Service role bypasses RLS, so server API routes and admin scripts using
--   SUPABASE_SERVICE_ROLE_KEY will still work.
-- - Import/backfill scripts that use NEXT_PUBLIC_SUPABASE_ANON_KEY may fail
--   after this unless you switch them to service role or add temporary import
--   policies.

begin;

do $$
declare
  missing_tables text[];
begin
  select array_agg(table_name)
  into missing_tables
  from unnest(array[
    'public.players',
    'public.player_stat_profiles',
    'public.player_directory',
    'public.player_awards',
    'public.player_season_stats',
    'public.user_profiles',
    'public.saved_lineups',
    'public.favorite_players',
    'public.recent_players',
    'public.user_compare_slots',
    'public.user_activity',
    'public.user_settings',
    'public.user_signins',
    'public.user_devices',
    'public.user_follows',
    'public.user_reports',
    'storage.objects'
  ]) as required_tables(table_name)
  where to_regclass(table_name) is null;

  if missing_tables is not null then
    raise exception 'Missing required StatCourt tables: %',
      array_to_string(missing_tables, ', ');
  end if;
end $$;

-- Optional audit before running policy cleanup:
--
-- select
--   schemaname,
--   tablename,
--   policyname,
--   roles,
--   cmd
-- from pg_policies
-- where schemaname in ('public', 'storage')
-- order by schemaname, tablename, policyname;

-- Drop known older policies so permissive duplicates do not broaden access.
drop policy if exists "Public can read players" on public.players;
drop policy if exists "Allow public read player awards" on public.player_awards;
drop policy if exists "Public can read player directory" on public.player_directory;
drop policy if exists "Allow anon season stat reads" on public.player_season_stats;
drop policy if exists "Allow anon season stat inserts" on public.player_season_stats;
drop policy if exists "Allow anon season stat updates" on public.player_season_stats;
drop policy if exists "Allow anon stat profile reads" on public.player_stat_profiles;
drop policy if exists "Allow anon stat profile inserts" on public.player_stat_profiles;
drop policy if exists "Allow anon stat profile updates" on public.player_stat_profiles;

drop policy if exists "Profiles are readable" on public.user_profiles;
drop policy if exists "Public profiles are viewable when enabled" on public.user_profiles;
drop policy if exists "Users can insert own profile" on public.user_profiles;
drop policy if exists "Users can update own profile" on public.user_profiles;

drop policy if exists "Public saved lineups are viewable" on public.saved_lineups;
drop policy if exists "Users can read their saved lineups" on public.saved_lineups;
drop policy if exists "Users can insert their saved lineups" on public.saved_lineups;
drop policy if exists "Users can update their saved lineups" on public.saved_lineups;
drop policy if exists "Users can delete their saved lineups" on public.saved_lineups;

drop policy if exists "Public profile favorites are viewable" on public.favorite_players;
drop policy if exists "Users can read their favorite players" on public.favorite_players;
drop policy if exists "Users can insert their favorite players" on public.favorite_players;
drop policy if exists "Users can delete their favorite players" on public.favorite_players;

drop policy if exists "Users can read recent players" on public.recent_players;
drop policy if exists "Users can insert recent players" on public.recent_players;
drop policy if exists "Users can update recent players" on public.recent_players;
drop policy if exists "Users can delete recent players" on public.recent_players;

drop policy if exists "Users can read their compare slots" on public.user_compare_slots;
drop policy if exists "Users can insert their compare slots" on public.user_compare_slots;
drop policy if exists "Users can update their compare slots" on public.user_compare_slots;

drop policy if exists "Users can read their activity" on public.user_activity;
drop policy if exists "Users can insert their activity" on public.user_activity;
drop policy if exists "Users can delete their activity" on public.user_activity;

drop policy if exists "Users can read their settings" on public.user_settings;
drop policy if exists "Users can insert their settings" on public.user_settings;
drop policy if exists "Users can update their settings" on public.user_settings;
drop policy if exists "Users can delete their settings" on public.user_settings;

drop policy if exists "Users can read their signins" on public.user_signins;
drop policy if exists "Users can insert their signins" on public.user_signins;
drop policy if exists "Users can delete their signins" on public.user_signins;
drop policy if exists "Users can read their own signins" on public.user_signins;
drop policy if exists "Users can insert their own signins" on public.user_signins;
drop policy if exists "Users can delete their own signins" on public.user_signins;

drop policy if exists "Users can read their devices" on public.user_devices;
drop policy if exists "Users can insert their devices" on public.user_devices;
drop policy if exists "Users can update their devices" on public.user_devices;
drop policy if exists "Users can delete their devices" on public.user_devices;
drop policy if exists "Users can read their own devices" on public.user_devices;
drop policy if exists "Users can insert their own devices" on public.user_devices;
drop policy if exists "Users can update their own devices" on public.user_devices;
drop policy if exists "Users can delete their own devices" on public.user_devices;

drop policy if exists "Anyone can read follow counts" on public.user_follows;
drop policy if exists "Users can follow profiles" on public.user_follows;
drop policy if exists "Users can unfollow profiles" on public.user_follows;

drop policy if exists "Users can create profile reports" on public.user_reports;
drop policy if exists "Users can read their own reports" on public.user_reports;

drop policy if exists "Users can view avatars" on storage.objects;
drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;
drop policy if exists "Users can delete their own avatar" on storage.objects;

-- Public basketball data: readable by everyone, writable only by service role.
alter table if exists public.players enable row level security;
drop policy if exists "StatCourt public read players" on public.players;
create policy "StatCourt public read players"
on public.players
for select
to anon, authenticated
using (true);

alter table if exists public.player_stat_profiles enable row level security;
drop policy if exists "StatCourt public read player stat profiles" on public.player_stat_profiles;
create policy "StatCourt public read player stat profiles"
on public.player_stat_profiles
for select
to anon, authenticated
using (true);

alter table if exists public.player_directory enable row level security;
drop policy if exists "StatCourt public read player directory" on public.player_directory;
create policy "StatCourt public read player directory"
on public.player_directory
for select
to anon, authenticated
using (true);

alter table if exists public.player_awards enable row level security;
drop policy if exists "StatCourt public read player awards" on public.player_awards;
create policy "StatCourt public read player awards"
on public.player_awards
for select
to anon, authenticated
using (true);

alter table if exists public.player_season_stats enable row level security;
drop policy if exists "StatCourt public read player season stats" on public.player_season_stats;
create policy "StatCourt public read player season stats"
on public.player_season_stats
for select
to anon, authenticated
using (true);

-- User profiles: the table itself is owner-only. Public pages read the
-- restricted public.public_profiles view so private columns are not exposed.
alter table if exists public.user_profiles enable row level security;
drop policy if exists "StatCourt read public or own profiles" on public.user_profiles;
drop policy if exists "StatCourt read own profile" on public.user_profiles;
drop policy if exists "StatCourt insert own profile" on public.user_profiles;
drop policy if exists "StatCourt update own profile" on public.user_profiles;
drop policy if exists "StatCourt delete own profile" on public.user_profiles;

create policy "StatCourt read own profile"
on public.user_profiles
for select
to authenticated
using (auth.uid() = id);

create policy "StatCourt insert own profile"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "StatCourt update own profile"
on public.user_profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "StatCourt delete own profile"
on public.user_profiles
for delete
to authenticated
using (auth.uid() = id);

create or replace view public.public_profiles as
select
  id,
  display_name,
  username,
  avatar_url,
  created_at
from public.user_profiles
where public_profile_enabled = true
  and username is not null;

grant select on public.public_profiles to anon, authenticated;

-- Saved lineups: owners can manage their lineups. Public lineups are readable
-- by everyone for public profile pages.
alter table if exists public.saved_lineups enable row level security;
drop policy if exists "StatCourt read own saved lineups" on public.saved_lineups;
drop policy if exists "StatCourt read public saved lineups" on public.saved_lineups;
drop policy if exists "StatCourt insert own saved lineups" on public.saved_lineups;
drop policy if exists "StatCourt update own saved lineups" on public.saved_lineups;
drop policy if exists "StatCourt delete own saved lineups" on public.saved_lineups;

create policy "StatCourt read own saved lineups"
on public.saved_lineups
for select
to authenticated
using (auth.uid() = user_id);

create policy "StatCourt read public saved lineups"
on public.saved_lineups
for select
to anon, authenticated
using (
  is_public = true
  and exists (
    select 1
    from public.public_profiles profile
    where profile.id = saved_lineups.user_id
  )
);

create policy "StatCourt insert own saved lineups"
on public.saved_lineups
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "StatCourt update own saved lineups"
on public.saved_lineups
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "StatCourt delete own saved lineups"
on public.saved_lineups
for delete
to authenticated
using (auth.uid() = user_id);

-- Favorite players: owners can manage favorites. Favorites are readable for
-- public profiles so public profile pages can show favorite-player rows.
alter table if exists public.favorite_players enable row level security;
drop policy if exists "StatCourt read own favorite players" on public.favorite_players;
drop policy if exists "StatCourt read public profile favorite players" on public.favorite_players;
drop policy if exists "StatCourt insert own favorite players" on public.favorite_players;
drop policy if exists "StatCourt delete own favorite players" on public.favorite_players;

create policy "StatCourt read own favorite players"
on public.favorite_players
for select
to authenticated
using (auth.uid() = user_id);

create policy "StatCourt read public profile favorite players"
on public.favorite_players
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.public_profiles profile
    where profile.id = favorite_players.user_id
  )
);

create policy "StatCourt insert own favorite players"
on public.favorite_players
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "StatCourt delete own favorite players"
on public.favorite_players
for delete
to authenticated
using (auth.uid() = user_id);

-- Recent players: private account data.
alter table if exists public.recent_players enable row level security;
drop policy if exists "StatCourt read own recent players" on public.recent_players;
drop policy if exists "StatCourt insert own recent players" on public.recent_players;
drop policy if exists "StatCourt update own recent players" on public.recent_players;
drop policy if exists "StatCourt delete own recent players" on public.recent_players;

create policy "StatCourt read own recent players"
on public.recent_players
for select
to authenticated
using (auth.uid() = user_id);

create policy "StatCourt insert own recent players"
on public.recent_players
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "StatCourt update own recent players"
on public.recent_players
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "StatCourt delete own recent players"
on public.recent_players
for delete
to authenticated
using (auth.uid() = user_id);

-- Compare slots: private account data.
alter table if exists public.user_compare_slots enable row level security;
drop policy if exists "StatCourt read own compare slots" on public.user_compare_slots;
drop policy if exists "StatCourt insert own compare slots" on public.user_compare_slots;
drop policy if exists "StatCourt update own compare slots" on public.user_compare_slots;
drop policy if exists "StatCourt delete own compare slots" on public.user_compare_slots;

create policy "StatCourt read own compare slots"
on public.user_compare_slots
for select
to authenticated
using (auth.uid() = user_id);

create policy "StatCourt insert own compare slots"
on public.user_compare_slots
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "StatCourt update own compare slots"
on public.user_compare_slots
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "StatCourt delete own compare slots"
on public.user_compare_slots
for delete
to authenticated
using (auth.uid() = user_id);

-- Activity/settings/sign-in/device data: private account data. Sign-in and
-- device writes go through server routes with service role so client-side code
-- cannot fabricate security-history rows.
alter table if exists public.user_activity enable row level security;
drop policy if exists "StatCourt read own activity" on public.user_activity;
drop policy if exists "StatCourt insert own activity" on public.user_activity;
drop policy if exists "StatCourt delete own activity" on public.user_activity;

create policy "StatCourt read own activity"
on public.user_activity
for select
to authenticated
using (auth.uid() = user_id);

create policy "StatCourt insert own activity"
on public.user_activity
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "StatCourt delete own activity"
on public.user_activity
for delete
to authenticated
using (auth.uid() = user_id);

alter table if exists public.user_settings enable row level security;
drop policy if exists "StatCourt read own settings" on public.user_settings;
drop policy if exists "StatCourt insert own settings" on public.user_settings;
drop policy if exists "StatCourt update own settings" on public.user_settings;
drop policy if exists "StatCourt delete own settings" on public.user_settings;

create policy "StatCourt read own settings"
on public.user_settings
for select
to authenticated
using (auth.uid() = user_id);

create policy "StatCourt insert own settings"
on public.user_settings
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "StatCourt update own settings"
on public.user_settings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "StatCourt delete own settings"
on public.user_settings
for delete
to authenticated
using (auth.uid() = user_id);

alter table if exists public.user_signins enable row level security;
drop policy if exists "StatCourt read own signins" on public.user_signins;
drop policy if exists "StatCourt insert own signins" on public.user_signins;
drop policy if exists "StatCourt delete own signins" on public.user_signins;

create policy "StatCourt read own signins"
on public.user_signins
for select
to authenticated
using (auth.uid() = user_id);

create policy "StatCourt delete own signins"
on public.user_signins
for delete
to authenticated
using (auth.uid() = user_id);

alter table if exists public.user_devices enable row level security;
drop policy if exists "StatCourt read own devices" on public.user_devices;
drop policy if exists "StatCourt insert own devices" on public.user_devices;
drop policy if exists "StatCourt update own devices" on public.user_devices;
drop policy if exists "StatCourt delete own devices" on public.user_devices;

create policy "StatCourt read own devices"
on public.user_devices
for select
to authenticated
using (auth.uid() = user_id);

create policy "StatCourt delete own devices"
on public.user_devices
for delete
to authenticated
using (auth.uid() = user_id);

-- Follows: public social graph read only when both accounts have public
-- profiles; authenticated users can manage only their own outgoing follows.
alter table if exists public.user_follows enable row level security;
drop policy if exists "StatCourt public read follows" on public.user_follows;
drop policy if exists "StatCourt read own follows" on public.user_follows;
drop policy if exists "StatCourt insert own follows" on public.user_follows;
drop policy if exists "StatCourt delete own follows" on public.user_follows;

create policy "StatCourt public read follows"
on public.user_follows
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.public_profiles follower
    where follower.id = user_follows.follower_id
  )
  and exists (
    select 1
    from public.public_profiles followed
    where followed.id = user_follows.following_id
  )
);

create policy "StatCourt read own follows"
on public.user_follows
for select
to authenticated
using (
  auth.uid() = follower_id
  or auth.uid() = following_id
);

create policy "StatCourt insert own follows"
on public.user_follows
for insert
to authenticated
with check (
  auth.uid() = follower_id
  and auth.uid() <> following_id
);

create policy "StatCourt delete own follows"
on public.user_follows
for delete
to authenticated
using (auth.uid() = follower_id);

-- Reports: users can create reports, but normal users cannot read/update all
-- reports. Admin review should use service role.
alter table if exists public.user_reports enable row level security;
drop policy if exists "StatCourt insert own reports" on public.user_reports;
drop policy if exists "StatCourt read own reports" on public.user_reports;

create policy "StatCourt insert own reports"
on public.user_reports
for insert
to authenticated
with check (
  auth.uid() = reporter_id
  and auth.uid() <> reported_user_id
);

create policy "StatCourt read own reports"
on public.user_reports
for select
to authenticated
using (auth.uid() = reporter_id);

-- Avatar storage policies. Keep the avatars bucket public if you want public
-- profile pictures to load without signed URLs.
drop policy if exists "StatCourt public read avatars" on storage.objects;
drop policy if exists "StatCourt insert own avatar files" on storage.objects;
drop policy if exists "StatCourt update own avatar files" on storage.objects;
drop policy if exists "StatCourt delete own avatar files" on storage.objects;

create policy "StatCourt public read avatars"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'avatars');

create policy "StatCourt insert own avatar files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "StatCourt update own avatar files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "StatCourt delete own avatar files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

commit;
