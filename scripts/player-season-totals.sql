-- Issue #37: store season totals so every career stat comes from made/attempted totals.
--
-- What this does (and nothing else):
-- 1. Adds 13 nullable columns to public.player_season_stats: the season totals from
--    nba_api PlayerCareerStats (Totals) and the time the totals import wrote the row.
--    No defaults, so existing rows get null and current code keeps working.
-- 2. Lets the stat columns that can be untracked hold null (steals/blocks before
--    1973-74, threes before 1979-80, rebounds before 1950-51, minutes before 1951-52),
--    instead of a misleading 0. DROP NOT NULL is a no-op where a column already
--    allows null.
-- 3. Adds a partial index for the resumable backfill (rows still without totals).
--
-- No data is changed. No RLS policies, grants or table ownership change: new columns
-- are covered by the existing row-level policies ("StatCourt public read player season
-- stats": anon can read, only the service role writes; see supabase-rls-policies.sql).
--
-- All statements are metadata-only (no table rewrite) and take a brief lock.
-- Safe to run twice. Run in the Supabase SQL editor; rollback is at the bottom.

begin;

alter table public.player_season_stats
  add column if not exists minutes numeric,
  add column if not exists pts integer,
  add column if not exists reb integer,
  add column if not exists ast integer,
  add column if not exists stl integer,
  add column if not exists blk integer,
  add column if not exists fgm integer,
  add column if not exists fga integer,
  add column if not exists fg3m integer,
  add column if not exists fg3a integer,
  add column if not exists ftm integer,
  add column if not exists fta integer,
  add column if not exists totals_imported_at timestamptz;

comment on column public.player_season_stats.stl is
  'Season total; null when not tracked (before 1973-74). Same for blk; fg3m/fg3a before 1979-80.';
comment on column public.player_season_stats.totals_imported_at is
  'When import-player-season-stats.py last wrote this row with totals; null = not backfilled yet.';

alter table public.player_season_stats
  alter column minutes_per_game drop not null,
  alter column rpg drop not null,
  alter column spg drop not null,
  alter column bpg drop not null,
  alter column three_percent drop not null,
  alter column three_made_per_game drop not null,
  alter column three_attempts_per_game drop not null;

alter table public.player_stat_profiles
  alter column minutes_per_game drop not null,
  alter column rpg drop not null,
  alter column spg drop not null,
  alter column bpg drop not null,
  alter column three_percent drop not null,
  alter column three_made_per_game drop not null,
  alter column three_attempts_per_game drop not null;

alter table public.players
  alter column rpg drop not null,
  alter column spg drop not null,
  alter column bpg drop not null,
  alter column three_percent drop not null;

create index if not exists player_season_stats_totals_pending_idx
on public.player_season_stats (nba_id)
where totals_imported_at is null;

commit;

-- Check (read-only):
-- select column_name, data_type, is_nullable
-- from information_schema.columns
-- where table_schema = 'public' and table_name = 'player_season_stats'
-- order by ordinal_position;

-- Rollback (drops the new columns and their data; NOT NULL can only be restored once
-- no row holds null in those columns):
-- begin;
-- drop index if exists public.player_season_stats_totals_pending_idx;
-- alter table public.player_season_stats
--   drop column if exists minutes, drop column if exists pts, drop column if exists reb,
--   drop column if exists ast, drop column if exists stl, drop column if exists blk,
--   drop column if exists fgm, drop column if exists fga, drop column if exists fg3m,
--   drop column if exists fg3a, drop column if exists ftm, drop column if exists fta,
--   drop column if exists totals_imported_at;
-- commit;
