"""Add players who are on an active roster but missing from public.players
(e.g. a new rookie class), so they show up in the app.

Looks players up by NBA ID (the bundled nba_api static list used by
import-nba-stats.py doesn't include new rookies) and reuses that script's
helpers so new rows are built the same way. Run import-player-directory.py first.

    python -u scripts/import-missing-roster-players.py
"""

import importlib.util
import sys
from datetime import datetime, timezone
from pathlib import Path

from nba_api.stats.endpoints import playercareerstats

from pipeline_common import get_service_supabase_client

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def load_nba_stats_helpers():
    path = Path(__file__).with_name("import-nba-stats.py")
    spec = importlib.util.spec_from_file_location("import_nba_stats", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    return module


helpers = load_nba_stats_helpers()


def fetch_all(query_fn, page_size=1000):
    rows = []
    start = 0

    while True:
        page = query_fn().range(start, start + page_size - 1).execute().data or []
        rows.extend(page)

        if len(page) < page_size:
            return rows

        start += page_size


def get_missing_roster_players(supabase):
    roster = fetch_all(
        lambda: supabase.table("player_directory")
        .select("nba_id, name, team")
        .eq("roster_status", "1")
        .order("nba_id")
    )
    existing_ids = {
        row["nba_id"]
        for row in fetch_all(
            lambda: supabase.table("players").select("nba_id").order("id")
        )
    }

    return [row for row in roster if row["nba_id"] not in existing_ids]


def per_game(total, games):
    return float(round(helpers.safe_float(total) / games, 1)) if games else 0.0


def percent(value):
    return float(round(helpers.safe_float(value) * 100, 1))


def build_player_row(directory_row):
    nba_id = directory_row["nba_id"]
    name = directory_row["name"]
    info = helpers.get_player_info(nba_id)

    if info["team"] == "FA" and directory_row.get("team"):
        info["team"] = directory_row["team"]

    try:
        career = helpers.run_nba_request(
            f"career stats for {name}",
            lambda: playercareerstats.PlayerCareerStats(
                player_id=nba_id,
                per_mode36="Totals",
                league_id_nullable="00",
                headers=helpers.NBA_HEADERS,
                timeout=60,
            ),
        )
        totals = career.career_totals_regular_season.get_data_frame()
    except KeyError:
        # nba_api raises KeyError('resultSet') for players with no NBA stats yet
        # (e.g. two-way players who haven't played): add them with zero games.
        totals = None

    row = totals.iloc[0] if totals is not None and not totals.empty else None
    games = int(row["GP"]) if row is not None else 0

    stats = {
        "games": games,
        "ppg": per_game(row["PTS"], games) if row is not None else 0.0,
        "rpg": per_game(row["REB"], games) if row is not None else 0.0,
        "apg": per_game(row["AST"], games) if row is not None else 0.0,
        "spg": per_game(row["STL"], games) if row is not None else 0.0,
        "bpg": per_game(row["BLK"], games) if row is not None else 0.0,
        "position": helpers.infer_position(info["apiPosition"]),
    }

    return {
        "nba_id": nba_id,
        "name": name,
        "team": info["team"],
        "fallback_image": f"/players/headshots/{helpers.slugify_name(name)}.png",
        "position": stats["position"],
        "jersey_number": info["jersey"],
        "games": games,
        "ppg": stats["ppg"],
        "rpg": stats["rpg"],
        "apg": stats["apg"],
        "spg": stats["spg"],
        "bpg": stats["bpg"],
        "fg_percent": percent(row["FG_PCT"]) if row is not None else 0.0,
        "three_percent": percent(row["FG3_PCT"]) if row is not None else 0.0,
        "ft_percent": percent(row["FT_PCT"]) if row is not None else 0.0,
        "defense_rating": helpers.estimate_defense_from_box_score(stats),
        "star_power": helpers.estimate_star_power(stats),
        "height_inches": info["heightInches"],
        "weight_pounds": info["weightPounds"],
        "from_year": info["fromYear"],
        "to_year": info["toYear"],
        "api_position": info["apiPosition"],
        "stats_source": "career_totals" if games else "roster_import",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


def main():
    supabase = get_service_supabase_client()
    missing = get_missing_roster_players(supabase)

    print(f"-- Found {len(missing)} active-roster players missing from players")

    added = 0

    for index, directory_row in enumerate(missing, start=1):
        name = directory_row["name"]

        try:
            player_row = build_player_row(directory_row)
            supabase.table("players").upsert(player_row, on_conflict="nba_id").execute()
            added += 1
            print(f"-- [{index}/{len(missing)}] Added {name} ({player_row['team']}, {player_row['games']} games)")
        except Exception as error:
            print(f"-- [{index}/{len(missing)}] Skipped {name}: {error}")

    print(f"-- Done. Added {added} players.")


if __name__ == "__main__":
    main()
