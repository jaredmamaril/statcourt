import os
import sys
import time
import random
import math
from pathlib import Path

from supabase import create_client
from curl_cffi import requests as cr
from nba_api.stats.library.http import NBAStatsHTTP
from nba_api.stats.endpoints import playercareerstats, playerprofilev2

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

session = cr.Session(impersonate="chrome120")
session.get("https://www.nba.com/stats/", timeout=20)

NBAStatsHTTP.get_session = lambda self: session


ONLY_IMPORT = set()
IMPORT_LIMIT = 500
START_AFTER = ""
MISSING_VOLUME_ONLY = True
#$env:PYTHONIOENCODING="utf-8"
#python scripts/backfill-shooting-volume.py | Out-File scripts/shooting-volume-output.sql -Encoding utf8


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
        raise ValueError("Missing Supabase URL or anon key")

    return create_client(url, key)


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


def json_safe_number(value, fallback=None):
    if value is None:
        return fallback

    try:
        number = float(value)
    except (TypeError, ValueError):
        return fallback

    if not math.isfinite(number):
        return fallback

    return number


def json_safe_text(value, fallback=None):
    if value is None:
        return fallback

    try:
        if value != value:
            return fallback
    except TypeError:
        pass

    text = str(value).strip()

    if text.lower() in {"", "nan", "none", "null"}:
        return fallback

    return text


def json_safe_int(value, fallback=None):
    number = json_safe_number(value, fallback=None)

    if number is None:
        return fallback

    return int(number)


def safe_round(value, digits=1, fallback=None):
    number = json_safe_number(value, fallback=None)

    if number is None:
        return fallback

    return round(number, digits)


def safe_per_game(total, games, fallback=None):
    total_number = json_safe_number(total, fallback=None)
    games_number = json_safe_number(games, fallback=None)

    if total_number is None or games_number is None or games_number <= 0:
        return fallback

    return safe_round(total_number / games_number, 1, fallback)


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


def get_players_to_import(supabase):
    if MISSING_VOLUME_ONLY:
        season_rows = fetch_all_rows(
            supabase,
            "player_season_stats",
            (
                "nba_id, three_made_per_game, three_attempts_per_game, "
                "free_throw_attempts_per_game"
            ),
        )

        missing_nba_ids = {
            row["nba_id"]
            for row in season_rows
            if row.get("nba_id") is not None
            and (
                row.get("three_made_per_game") is None
                or row.get("three_attempts_per_game") is None
                or row.get("free_throw_attempts_per_game") is None
            )
        }

        players = fetch_all_rows(
            supabase,
            "players",
            "id, nba_id, name",
        )

        rows = [
            player
            for player in players
            if player.get("nba_id") in missing_nba_ids
            and (not ONLY_IMPORT or player.get("name") in ONLY_IMPORT)
            and (not START_AFTER or player.get("name", "") > START_AFTER)
        ]

        return sorted(rows, key=lambda player: player["name"])[:IMPORT_LIMIT]

    query = (
        supabase.table("players")
        .select("id, nba_id, name")
        .not_.is_("nba_id", "null")
        .order("name")
    )

    if ONLY_IMPORT:
        query = query.in_("name", list(ONLY_IMPORT))
    elif START_AFTER:
        query = query.gt("name", START_AFTER)

    response = query.limit(IMPORT_LIMIT).execute()

    return response.data or []


def get_season_dataframe(player):
    nba_id = player["nba_id"]
    name = player["name"]

    career = run_nba_request(
        f"career stats for {name}",
        lambda: playercareerstats.PlayerCareerStats(
            player_id=nba_id,
            timeout=30,
        ),
    )

    data_frames = career.get_data_frames()

    if data_frames:
        season_df = data_frames[0]

        if not season_df.empty:
            print(f"-- Using PlayerCareerStats for {name}")
            return season_df

    print(f"-- PlayerCareerStats empty for {name}, trying PlayerProfileV2")

    profile = run_nba_request(
        f"profile stats for {name}",
        lambda: playerprofilev2.PlayerProfileV2(
            player_id=nba_id,
            timeout=30,
        ),
    )

    profile_frames = profile.get_data_frames()

    for frame in profile_frames:
        required_columns = {
            "SEASON_ID",
            "TEAM_ABBREVIATION",
            "GP",
            "FG3M",
            "FG3A",
            "FTA",
        }

        if required_columns.issubset(set(frame.columns)) and not frame.empty:
            print(f"-- Using PlayerProfileV2 fallback for {name}")
            return frame

    return None


def get_existing_season_keys(supabase, nba_id):
    response = (
        supabase.table("player_season_stats")
        .select("season, team")
        .eq("nba_id", nba_id)
        .execute()
    )

    return {
        (row.get("season"), row.get("team"))
        for row in response.data or []
    }


def get_shooting_volume_rows(player, existing_season_keys):
    season_df = get_season_dataframe(player)

    if season_df is None or season_df.empty:
        return []

    rows = []

    for _, row in season_df.iterrows():
        games = json_safe_int(row.get("GP"), 0)

        if games <= 0:
            continue

        fg3m = json_safe_number(row.get("FG3M"), 0)
        fg3a = json_safe_number(row.get("FG3A"), 0)
        fta = json_safe_number(row.get("FTA"), 0)

        season = json_safe_text(row.get("SEASON_ID"))
        team = json_safe_text(row.get("TEAM_ABBREVIATION"), "TOT")

        if (season, team) not in existing_season_keys:
            continue

        rows.append({
            "nba_id": player["nba_id"],
            "season": season,
            "team": team,
            "three_made_per_game": safe_per_game(fg3m, games),
            "three_attempts_per_game": safe_per_game(fg3a, games),
            "free_throw_attempts_per_game": safe_per_game(fta, games),
        })

    return rows


def sql_string(value):
    if value is None:
        return "null"

    return "'" + str(value).replace("'", "''") + "'"


def sql_number(value):
    if value is None:
        return "null"

    return str(value)


def print_volume_update(row):
    print(
        "update public.player_season_stats set "
        f"three_made_per_game = {sql_number(row['three_made_per_game'])}, "
        f"three_attempts_per_game = {sql_number(row['three_attempts_per_game'])}, "
        f"free_throw_attempts_per_game = {sql_number(row['free_throw_attempts_per_game'])}, "
        "updated_at = now() "
        f"where nba_id = {row['nba_id']} "
        f"and season = {sql_string(row['season'])} "
        f"and team = {sql_string(row['team'])};"
    )


def backfill_shooting_volume():
    supabase = get_supabase_client()
    players = get_players_to_import(supabase)

    print(f"-- Found {len(players)} players to backfill shooting volume for")

    total_rows = 0

    for index, player in enumerate(players, start=1):
        name = player["name"]

        try:
            print(f"-- [{index}/{len(players)}] Backfilling {name}")

            existing_season_keys = get_existing_season_keys(
                supabase,
                player["nba_id"],
            )
            volume_rows = get_shooting_volume_rows(player, existing_season_keys)

            if not volume_rows:
                print(f"-- Skipped {name}: no shooting volume rows found")
                continue

            print(f"-- {name}")

            for row in volume_rows:
                print_volume_update(row)

            total_rows += len(volume_rows)

            print(f"-- Backfilled {len(volume_rows)} rows for {name}")

        except Exception as error:
            print(f"-- Skipped {name}: {error}")

    print(f"-- Done. Backfilled {total_rows} total season rows.")


if __name__ == "__main__":
    backfill_shooting_volume()
