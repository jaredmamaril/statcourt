import os
import sys
import math
from pathlib import Path
from collections import defaultdict

from supabase import create_client

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def load_env_file():
    env_path = Path(".env.local")

    if not env_path.exists():
        return

    for line in env_path.read_text().splitlines():
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key, value)


def get_supabase_client():
    load_env_file()

    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not url or not key:
        raise ValueError("Missing Supabase URL or service role key")

    return create_client(url, key)


ONLY_PLAYERS = set()
#$env:PYTHONIOENCODING="utf-8"
#python -u scripts/calculate-player-stat-profiles.py *> scripts/player-stat-profiles-output.txt

def safe_number(value, fallback=None):
    if value is None:
        return fallback

    try:
        number = float(value)
    except (TypeError, ValueError):
        return fallback

    if not math.isfinite(number):
        return fallback

    return number


def safe_int(value, fallback=0):
    if value is None:
        return fallback

    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def safe_round(value, digits=1, fallback=None):
    number = safe_number(value, fallback=None)

    if number is None:
        return fallback

    return round(number, digits)


def season_start_year(season):
    if not season:
        return 0

    try:
        return int(str(season).split("-")[0])
    except ValueError:
        return 0


def fetch_all_rows(supabase, table, select_columns, page_size=1000):
    rows = []
    start = 0

    while True:
        response = (
            supabase.table(table)
            .select(select_columns)
            .range(start, start + page_size - 1)
            .execute()
        )

        data = response.data or []

        if not data:
            break

        rows.extend(data)

        if len(data) < page_size:
            break

        start += page_size

    return rows


def weighted_average(rows, field):
    total_games = 0
    total_value = 0

    for row in rows:
        games = safe_int(row.get("games"), 0)
        value = safe_number(row.get(field), None)

        if games <= 0 or value is None:
            continue

        total_games += games
        total_value += value * games

    if total_games <= 0:
        return None

    return safe_round(total_value / total_games)


def build_career_profile_from_player(player):
    return {
        "player_id": player["id"],
        "nba_id": player["nba_id"],
        "profile_type": "career",
        "season_label": "Career",
        "games": safe_int(player.get("games"), None),

        "ppg": safe_round(player.get("ppg")),
        "rpg": safe_round(player.get("rpg")),
        "apg": safe_round(player.get("apg")),
        "spg": safe_round(player.get("spg")),
        "bpg": safe_round(player.get("bpg")),

        "fg_percent": safe_round(player.get("fg_percent")),
        "three_percent": safe_round(player.get("three_percent")),
        "ft_percent": safe_round(player.get("ft_percent")),
    }


def build_profile_from_rows(player, rows, profile_type, season_label):
    total_games = sum(safe_int(row.get("games"), 0) for row in rows)

    return {
        "player_id": player["id"],
        "nba_id": player["nba_id"],
        "profile_type": profile_type,
        "season_label": season_label,
        "games": total_games,

        "ppg": weighted_average(rows, "ppg"),
        "rpg": weighted_average(rows, "rpg"),
        "apg": weighted_average(rows, "apg"),
        "spg": weighted_average(rows, "spg"),
        "bpg": weighted_average(rows, "bpg"),

        "fg_percent": weighted_average(rows, "fg_percent"),
        "three_percent": weighted_average(rows, "three_percent"),
        "ft_percent": weighted_average(rows, "ft_percent"),
    }


def consolidate_seasons(raw_rows):
    grouped = defaultdict(list)

    for row in raw_rows:
        season = row.get("season")

        if not season:
            continue

        grouped[season].append(row)

    season_rows = []

    for season, rows in grouped.items():
        total_rows = [row for row in rows if row.get("team") == "TOT"]

        chosen_rows = total_rows if total_rows else rows

        total_games = sum(safe_int(row.get("games"), 0) for row in chosen_rows)

        if total_games <= 0:
            continue

        consolidated = {
            "season": season,
            "season_year": season_start_year(season),
            "games": total_games,

            "ppg": weighted_average(chosen_rows, "ppg"),
            "rpg": weighted_average(chosen_rows, "rpg"),
            "apg": weighted_average(chosen_rows, "apg"),
            "spg": weighted_average(chosen_rows, "spg"),
            "bpg": weighted_average(chosen_rows, "bpg"),

            "fg_percent": weighted_average(chosen_rows, "fg_percent"),
            "three_percent": weighted_average(chosen_rows, "three_percent"),
            "ft_percent": weighted_average(chosen_rows, "ft_percent"),
        }

        season_rows.append(consolidated)

    return sorted(season_rows, key=lambda row: row["season_year"])


def peak_score(profile):
    return (
        safe_number(profile.get("ppg"), 0) * 1.0 +
        safe_number(profile.get("rpg"), 0) * 0.45 +
        safe_number(profile.get("apg"), 0) * 0.65 +
        safe_number(profile.get("spg"), 0) * 1.25 +
        safe_number(profile.get("bpg"), 0) * 1.15 +
        safe_number(profile.get("fg_percent"), 0) * 0.08 +
        safe_number(profile.get("three_percent"), 0) * 0.04 +
        safe_number(profile.get("ft_percent"), 0) * 0.03
    )


def find_peak_profile(player, season_rows):
    if not season_rows:
        return None

    best_profile = None
    best_score = -1

    for index in range(len(season_rows)):
        window = season_rows[index:index + 3]

        if not window:
            continue

        years = [row["season_year"] for row in window]

        is_consecutive = all(
            years[i + 1] - years[i] == 1
            for i in range(len(years) - 1)
        )

        if len(window) == 3 and not is_consecutive:
            continue

        total_games = sum(safe_int(row.get("games"), 0) for row in window)

        if len(window) == 3 and total_games < 120:
            continue

        if len(window) == 2 and total_games < 90:
            continue

        if len(window) == 1 and total_games < 50:
            continue

        start_season = window[0]["season"]
        end_season = window[-1]["season"]

        season_label = (
            start_season
            if start_season == end_season
            else f"{start_season} to {end_season}"
        )

        profile = build_profile_from_rows(
            player=player,
            rows=window,
            profile_type="peak",
            season_label=season_label,
        )

        score = peak_score(profile)

        if score > best_score:
            best_score = score
            best_profile = profile

    if best_profile:
        return best_profile

    best_single = max(season_rows, key=lambda row: peak_score(row))

    return build_profile_from_rows(
        player=player,
        rows=[best_single],
        profile_type="peak",
        season_label=best_single["season"],
    )


def get_latest_season(season_rows):
    if not season_rows:
        return None

    return max(
        season_rows,
        key=lambda row: season_start_year(row.get("season")),
    )


def calculate_profiles():
    supabase = get_supabase_client()

    players = fetch_all_rows(
    supabase,
    "players",
    (
        "id, nba_id, name, games, ppg, rpg, apg, spg, bpg, "
        "fg_percent, three_percent, ft_percent"
    ),
    )

    if ONLY_PLAYERS:
        players = [
            player for player in players
            if player["name"] in ONLY_PLAYERS
        ]

    season_stats = fetch_all_rows(
        supabase,
        "player_season_stats",
        (
            "player_id, nba_id, season, team, games, ppg, rpg, apg, spg, bpg, "
            "fg_percent, three_percent, ft_percent"
        ),
    )

    season_rows_by_nba_id = defaultdict(list)

    for row in season_stats:
        nba_id = row.get("nba_id")

        if nba_id is not None:
            season_rows_by_nba_id[nba_id].append(row)

    profiles_to_upsert = []

    for player in players:
        nba_id = player.get("nba_id")

        if nba_id is None:
            continue

        raw_rows = season_rows_by_nba_id.get(nba_id, [])

        if not raw_rows:
            print(f"-- Skipped {player['name']}: no season stats")
            continue

        season_rows = consolidate_seasons(raw_rows)

        if not season_rows:
            print(f"-- Skipped {player['name']}: no consolidated seasons")
            continue

        career_profile = build_career_profile_from_player(player)
        peak_profile = find_peak_profile(player, season_rows)

        latest_season = get_latest_season(season_rows)

        profiles_to_upsert.append(career_profile)

        if peak_profile:
            profiles_to_upsert.append(peak_profile)

        if latest_season:
            current_profile = build_profile_from_rows(
                player=player,
                rows=[latest_season],
                profile_type="current",
                season_label=latest_season["season"],
            )

            profiles_to_upsert.append(current_profile)

        print(f"-- Built profiles for {player['name']}")

    if not profiles_to_upsert:
        print("-- No profiles to upsert")
        return

    batch_size = 500

    for start in range(0, len(profiles_to_upsert), batch_size):
        batch = profiles_to_upsert[start:start + batch_size]

        response = (
            supabase.table("player_stat_profiles")
            .upsert(
                batch,
                on_conflict="nba_id,profile_type",
            )
            .execute()
        )

        if not response.data:
            print("-- Warning: no returned profile data")

        print(f"-- Upserted {len(batch)} profiles")

    print(f"-- Done. Upserted {len(profiles_to_upsert)} total profiles.")


if __name__ == "__main__":
    calculate_profiles()