"""Build every player's career, peak and current stat profiles from season totals
(scripts/career_totals.py), and write the career line to both player_stat_profiles
and the players table's career columns, so the two can't disagree (issue #37).

Only players whose season rows all have totals (import-player-season-stats.py
--backfill-totals) are rebuilt; anyone else keeps their current profiles and is listed.

Run from the repo root with the service role key in .env.local:

    $env:PYTHONIOENCODING="utf-8"
    python -u scripts/calculate-player-stat-profiles.py *> scripts/player-stat-profiles-output.txt
    # Compute everything and write the before/after to a local file; never touches
    # the database (reads with the anon key, which can't write player tables):
    python -u scripts/calculate-player-stat-profiles.py --dry-run
"""

import argparse
import json
import sys
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

from career_totals import (
    PLAYER_CAREER_COLUMNS,
    TOTAL_COLUMNS,
    build_player_profiles,
    has_totals,
    player_career_columns,
)
from pipeline_common import get_public_supabase_client, get_service_supabase_client

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

SEASON_COLUMNS = (
    "id, player_id, nba_id, season, team, games, totals_imported_at, "
    + ", ".join(TOTAL_COLUMNS)
)


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--only", action="append", default=[], metavar="NAME", help="only this player (repeatable)")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="compute the new profiles and write before/after to a local JSON file; no database writes",
    )
    parser.add_argument(
        "--output",
        default=None,
        metavar="PATH",
        help="dry-run file (default: backups/profile-dry-run-<UTC time>.json)",
    )

    return parser.parse_args(argv)


def fetch_all_rows(supabase, table, select_columns, page_size=1000):
    rows = []
    start = 0

    while True:
        data = (
            supabase.table(table)
            .select(select_columns)
            # Stable order so pages don't skip or repeat rows.
            .order("id")
            .range(start, start + page_size - 1)
            .execute()
            .data
            or []
        )
        rows.extend(data)

        if len(data) < page_size:
            return rows

        start += page_size


def changed_columns(current, new):
    def same(a, b):
        if a is None or b is None:
            return a is None and b is None

        return abs(float(a) - float(b)) < 1e-9

    return {column: new[column] for column in new if not same(current.get(column), new[column])}


PROFILE_COLUMNS = (
    "player_id, nba_id, profile_type, season_label, games, minutes_per_game, ppg, rpg, apg, "
    "spg, bpg, fg_percent, three_percent, ft_percent, three_made_per_game, "
    "three_attempts_per_game, free_throw_attempts_per_game"
)


def write_dry_run_file(path, supabase, players_by_id, rebuilt_profiles, summary):
    """Before/after for every rebuilt player: the players career columns and the
    career, peak and current profiles."""
    before_profiles = defaultdict(dict)

    for row in fetch_all_rows(supabase, "player_stat_profiles", "id, " + PROFILE_COLUMNS):
        before_profiles[row["player_id"]][row["profile_type"]] = row

    players = []

    for player_id, profiles in rebuilt_profiles.items():
        player = players_by_id[player_id]
        players.append(
            {
                "id": player_id,
                "nba_id": player["nba_id"],
                "name": player["name"],
                "before": {
                    "players": {column: player.get(column) for column in PLAYER_CAREER_COLUMNS},
                    **{kind: before_profiles[player_id].get(kind) for kind in ("career", "peak", "current")},
                },
                "after": {
                    "players": player_career_columns(profiles["career"]),
                    **{kind: profiles[kind] for kind in ("career", "peak", "current")},
                },
            }
        )

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps({"generated_at": datetime.now(timezone.utc).isoformat(), "summary": summary, "players": players}, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"-- Dry run: before/after for {len(players)} players written to {path.resolve()}")


def calculate_profiles(args):
    # Dry runs read with the anon key, which RLS doesn't allow to write player tables.
    supabase = get_public_supabase_client() if args.dry_run else get_service_supabase_client()
    started = time.monotonic()

    players = fetch_all_rows(supabase, "players", "id, nba_id, name, " + ", ".join(PLAYER_CAREER_COLUMNS))

    if args.only:
        players = [player for player in players if player["name"] in set(args.only)]

    season_rows_by_nba_id = defaultdict(list)

    try:
        season_rows = fetch_all_rows(supabase, "player_season_stats", SEASON_COLUMNS)
    except Exception as error:
        raise SystemExit(f"-- Can't read season totals; run scripts/player-season-totals.sql first ({error}).")

    for row in season_rows:
        if row.get("nba_id") is not None:
            season_rows_by_nba_id[row["nba_id"]].append(row)

    profiles_to_upsert = []
    rebuilt = 0
    rebuilt_profiles = {}
    player_updates = []
    no_rows = []
    not_backfilled = []

    for player in players:
        if player.get("nba_id") is None:
            continue

        rows = season_rows_by_nba_id.get(player["nba_id"], [])

        if not rows:
            no_rows.append(player["name"])
            continue

        if not all(has_totals(row) for row in rows):
            not_backfilled.append(player["name"])
            continue

        profiles = build_player_profiles(player, rows)

        if not profiles:
            no_rows.append(player["name"])
            continue

        profiles_to_upsert.extend(profile for profile in profiles.values() if profile)
        rebuilt_profiles[player["id"]] = profiles
        rebuilt += 1

        changes = changed_columns(player, player_career_columns(profiles["career"]))

        if changes:
            player_updates.append((player, changes))

    print(
        f"-- {rebuilt} players rebuilt from totals, "
        f"{len(player_updates)} players' career columns change, "
        f"{len(not_backfilled)} not backfilled yet (unchanged), {len(no_rows)} without season rows"
    )

    for player, changes in player_updates[:10]:
        before = {column: player.get(column) for column in changes}
        print(f"--   {player['name']}: {before} -> {changes}")

    if not_backfilled:
        print(f"-- Not backfilled yet: {', '.join(not_backfilled[:20])}{' ...' if len(not_backfilled) > 20 else ''}")

    if args.dry_run:
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        path = Path(args.output) if args.output else Path("backups") / f"profile-dry-run-{stamp}.json"
        summary = {
            "rebuilt": rebuilt,
            "players_career_columns_change": len(player_updates),
            "not_backfilled": not_backfilled,
            "without_season_rows": no_rows,
        }
        write_dry_run_file(path, supabase, {player["id"]: player for player in players}, rebuilt_profiles, summary)
        print("-- Dry run: nothing written to the database.")
        return

    batch_size = 500

    for start in range(0, len(profiles_to_upsert), batch_size):
        batch = profiles_to_upsert[start:start + batch_size]
        supabase.table("player_stat_profiles").upsert(batch, on_conflict="nba_id,profile_type").execute()
        print(f"-- Upserted profiles {start + len(batch)}/{len(profiles_to_upsert)}", flush=True)

    for index, (player, changes) in enumerate(player_updates, start=1):
        supabase.table("players").update(changes).eq("id", player["id"]).execute()

        if index % 250 == 0 or index == len(player_updates):
            print(f"-- Updated players career columns {index}/{len(player_updates)}", flush=True)

    print(f"-- Done in {time.monotonic() - started:.0f}s.")


if __name__ == "__main__":
    calculate_profiles(parse_args())
