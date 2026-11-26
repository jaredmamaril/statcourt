"""Import per-season regular-season stats (one row per team stint, plus "TOT" for
traded seasons) into player_season_stats, from nba_api PlayerCareerStats (Totals).

Each row stores the season totals (points, rebounds, made/attempted shots, ...) and the
per-game stats and percentages computed from them (scripts/career_totals.py). Stats that
weren't tracked yet (steals/blocks before 1973-74, threes before 1979-80) are null.

Run from the repo root with the service role key in .env.local:

    $env:PYTHONIOENCODING="utf-8"
    # Players with no season rows yet (the default):
    python -u scripts/import-player-season-stats.py
    # In-season refresh of active players (run import-player-directory.py first):
    python -u scripts/import-player-season-stats.py --active
    # Issue #37 backfill: every player whose rows don't have totals yet. Resumable and
    # idempotent: stop any time (Ctrl+C) and run it again to continue.
    python -u scripts/import-player-season-stats.py --backfill-totals *> scripts/season-totals-backfill.txt
    # Try without writing anything:
    python -u scripts/import-player-season-stats.py --backfill-totals --dry-run --limit 5

Needs scripts/player-season-totals.sql to have been run for the totals columns; before
that, the default and --active modes still write the per-game columns.
"""

import argparse
import random
import sys
import time
from datetime import datetime, timedelta, timezone

from nba_api.stats.endpoints import playercareerstats, playerprofilev2

from career_totals import TOTAL_COLUMNS, season_row_from_api
from pipeline_common import (
    configure_nba_session,
    current_nba_season,
    format_season,
    get_service_supabase_client,
    season_start_year,
)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

TOTALS_EXTRA_COLUMNS = (*TOTAL_COLUMNS, "totals_imported_at")


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument(
        "--active",
        action="store_true",
        help="refresh every player on an active roster or with a current/previous-season row",
    )
    mode.add_argument(
        "--backfill-totals",
        action="store_true",
        help="re-import every player whose season rows don't have totals yet (resumable)",
    )
    parser.add_argument("--only", action="append", default=[], metavar="NAME", help="only this player (repeatable)")
    parser.add_argument("--limit", type=int, default=None, help="at most this many players")
    parser.add_argument("--start-after", default="", metavar="NAME", help="skip players up to this name")
    parser.add_argument("--dry-run", action="store_true", help="fetch and build rows, but write nothing")

    return parser.parse_args(argv)


def pause_between_nba_calls():
    time.sleep(random.uniform(5, 9))


def run_nba_request(label, request_fn, max_retries=5):
    delay = 5

    for attempt in range(1, max_retries + 1):
        try:
            pause_between_nba_calls()
            return request_fn()
        except Exception as error:
            if attempt == max_retries:
                raise error

            print(f"-- Retrying {label} after error: {error}")
            time.sleep(delay + random.uniform(2, 5))
            delay *= 2


def fetch_all(query_fn, page_size=1000):
    rows = []
    start = 0

    while True:
        page = query_fn().range(start, start + page_size - 1).execute().data or []
        rows.extend(page)

        if len(page) < page_size:
            return rows

        start += page_size


def has_totals_columns(supabase):
    """Whether scripts/player-season-totals.sql has been run."""
    try:
        supabase.table("player_season_stats").select("totals_imported_at").limit(1).execute()
        return True
    except Exception:
        return False


def get_all_players(supabase):
    return fetch_all(
        lambda: supabase.table("players")
        .select("id, nba_id, name")
        .not_.is_("nba_id", "null")
        .order("name")
        .order("id")
    )


def get_nba_ids(supabase, query_fn):
    return {row["nba_id"] for row in fetch_all(query_fn) if row.get("nba_id") is not None}


def get_active_players(supabase):
    current = current_nba_season()
    previous = format_season(season_start_year(current) - 1)

    roster_ids = get_nba_ids(
        supabase,
        lambda: supabase.table("player_directory").select("nba_id").eq("roster_status", "1"),
    )
    recent_ids = get_nba_ids(
        supabase,
        lambda: supabase.table("player_season_stats")
        .select("nba_id")
        .in_("season", [previous, current])
        .order("id"),
    )

    print(
        f"-- Active refresh for {current}: {len(roster_ids)} on active rosters, "
        f"{len(recent_ids)} with {previous} or {current} rows"
    )

    wanted = roster_ids | recent_ids

    return [player for player in get_all_players(supabase) if player["nba_id"] in wanted]


def get_backfill_players(supabase):
    """Players with season rows still missing totals (uses the partial index). Players
    finished by an earlier run drop out, which is what makes the backfill resumable."""
    pending_ids = get_nba_ids(
        supabase,
        lambda: supabase.table("player_season_stats")
        .select("nba_id")
        .is_("totals_imported_at", "null")
        .order("id"),
    )

    print(f"-- Backfill: {len(pending_ids)} players have season rows without totals")

    return [player for player in get_all_players(supabase) if player["nba_id"] in pending_ids]


def get_new_players(supabase):
    existing_ids = get_nba_ids(
        supabase, lambda: supabase.table("player_season_stats").select("nba_id").order("id")
    )

    return [player for player in get_all_players(supabase) if player["nba_id"] not in existing_ids]


def get_players_to_import(supabase, args):
    if args.active:
        players = get_active_players(supabase)
    elif args.backfill_totals:
        players = get_backfill_players(supabase)
    else:
        players = get_new_players(supabase)

    if args.only:
        wanted = set(args.only)
        # --only also finds players that aren't pending (e.g. to re-check one player).
        players = [player for player in get_all_players(supabase) if player["name"] in wanted]

    if args.start_after:
        players = [player for player in players if player["name"] > args.start_after]

    if args.limit is not None:
        players = players[: args.limit]
    elif not (args.active or args.backfill_totals or args.only):
        players = players[:1000]

    return players


def get_season_dataframe(player):
    nba_id = player["nba_id"]
    name = player["name"]

    career = run_nba_request(
        f"career stats for {name}",
        lambda: playercareerstats.PlayerCareerStats(
            player_id=nba_id,
            per_mode36="Totals",
            timeout=30,
        ),
    )

    data_frames = career.get_data_frames()

    if data_frames and not data_frames[0].empty:
        return data_frames[0]

    print(f"-- PlayerCareerStats empty for {name}, trying PlayerProfileV2")

    profile = run_nba_request(
        f"profile stats for {name}",
        lambda: playerprofilev2.PlayerProfileV2(
            player_id=nba_id,
            per_mode36="Totals",
            timeout=30,
        ),
    )

    required_columns = {"SEASON_ID", "TEAM_ABBREVIATION", "GP", "PTS", "REB", "AST"}

    for frame in profile.get_data_frames():
        if required_columns.issubset(set(frame.columns)) and not frame.empty:
            print(f"-- Using PlayerProfileV2 fallback for {name}")
            return frame

    return None


def get_player_season_rows(player, imported_at, include_totals):
    season_df = get_season_dataframe(player)

    if season_df is None or season_df.empty:
        return []

    rows = []

    for _, api_row in season_df.iterrows():
        row = season_row_from_api(api_row, player["id"], player["nba_id"], imported_at)

        if row is None:
            continue

        if not include_totals:
            for column in TOTALS_EXTRA_COLUMNS:
                row.pop(column, None)

        rows.append(row)

    return rows


def find_orphan_rows(supabase, player, written_rows):
    """Rows in the database the NBA API no longer returns for this player (e.g. an
    old team code). They keep the player pending; listed for review, never deleted."""
    written = {(row["season"], row["team"]) for row in written_rows}
    pending = (
        supabase.table("player_season_stats")
        .select("season, team")
        .eq("nba_id", player["nba_id"])
        .is_("totals_imported_at", "null")
        .execute()
        .data
        or []
    )

    return [f"{row['season']} {row['team']}" for row in pending if (row["season"], row["team"]) not in written]


def format_duration(seconds):
    return str(timedelta(seconds=int(seconds)))


def import_player_season_stats(args):
    configure_nba_session()
    supabase = get_service_supabase_client()
    include_totals = has_totals_columns(supabase)

    if not include_totals:
        if args.backfill_totals:
            raise SystemExit("-- Run scripts/player-season-totals.sql first (totals columns are missing).")

        print("-- Totals columns are missing; writing per-game columns only.")

    players = get_players_to_import(supabase, args)
    total = len(players)

    print(f"-- {total} players to import{' (dry run: nothing is written)' if args.dry_run else ''}")

    started = time.monotonic()
    imported_rows = 0
    done = skipped = failed = 0
    orphans = {}

    try:
        for index, player in enumerate(players, start=1):
            name = player["name"]
            imported_at = datetime.now(timezone.utc).isoformat()

            try:
                rows = get_player_season_rows(player, imported_at, include_totals)

                if not rows:
                    skipped += 1
                    status = "no season rows from the NBA API"
                elif args.dry_run:
                    done += 1
                    status = f"{len(rows)} rows (dry run)"
                else:
                    supabase.table("player_season_stats").upsert(
                        rows, on_conflict="nba_id,season,team"
                    ).execute()
                    imported_rows += len(rows)
                    done += 1
                    status = f"{len(rows)} rows"

                    if args.backfill_totals:
                        player_orphans = find_orphan_rows(supabase, player, rows)

                        if player_orphans:
                            orphans[name] = player_orphans
                            status += f", {len(player_orphans)} orphan rows: {', '.join(player_orphans)}"
            except Exception as error:
                failed += 1
                status = f"FAILED: {error}"

            elapsed = time.monotonic() - started
            average = elapsed / index
            eta = average * (total - index)
            print(
                f"-- [{index}/{total}] {name}: {status} | elapsed {format_duration(elapsed)}"
                f" | {average:.1f}s/player | ETA {format_duration(eta)}",
                flush=True,
            )
    except KeyboardInterrupt:
        print("-- Stopped. Run the same command again to continue where it left off.")

    print(
        f"-- Done: {done} players, {imported_rows} rows written, {skipped} without rows, "
        f"{failed} failed (failed players stay pending and are retried next run)."
    )

    if orphans:
        print(f"-- {len(orphans)} players have rows the NBA API no longer returns (not changed):")
        for name, rows in orphans.items():
            print(f"--   {name}: {', '.join(rows)}")


if __name__ == "__main__":
    import_player_season_stats(parse_args())
