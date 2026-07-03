import sys
import time
import random
import os
from pathlib import Path
from supabase import create_client

from curl_cffi import requests as cr
from nba_api.stats.library.http import NBAStatsHTTP
from nba_api.stats.endpoints import playerawards

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

session = cr.Session(impersonate="chrome120")
session.get("https://www.nba.com/stats/", timeout=20)
NBAStatsHTTP.get_session = lambda self: session

NBA_HEADERS = {
    "Host": "stats.nba.com",
    "Connection": "keep-alive",
    "Accept": "application/json, text/plain, */*",
    "x-nba-stats-token": "true",
    "x-nba-stats-origin": "stats",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Origin": "https://www.nba.com",
    "Referer": "https://www.nba.com/",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
}

#$env:PYTHONIOENCODING="utf-8"
#python scripts/import-player-awards.py > scripts/player-awards-test-output.sql

IMPORT_LIMIT = 500
IMPORT_START_AFTER = "Vladimir Radmanovic"

TEST_PLAYER_NAMES = set()

AWARD_TYPE_BY_DESCRIPTION = {
    "NBA Most Valuable Player": "mvp",
    "NBA Finals Most Valuable Player": "finals_mvp",
    "NBA Champion": "championship",
    "NBA Defensive Player of the Year": "dpoy",
    "NBA All-Star": "all_star",
    "All-NBA": "all_nba",
    "All-Defensive Team": "all_defense",
}


def load_env_file():
    env_path = Path(".env.local")

    if not env_path.exists():
        return

    for line in env_path.read_text().splitlines():
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key, value.strip().strip('"'))


def get_supabase_client():
    load_env_file()

    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not url or not key:
        raise ValueError("Missing Supabase URL or anon key")

    return create_client(url, key)


def clean(value):
    return str(value).strip()


def sql_string(value):
    if value is None:
        return "null"

    escaped = str(value).replace("'", "''")
    return f"'{escaped}'"


def sql_number(value):
    if value is None:
        return "null"

    return str(value)


def normalize_season(value):
    season = clean(value)

    if season.lower() in {"", "nan", "none", "null"}:
        return None

    return season


def normalize_team_number(value):
    team_number = clean(value)

    if team_number.lower() in {"", "nan", "none", "null"}:
        return None

    try:
        return int(float(team_number))
    except ValueError:
        return None


def get_players_to_import():
    supabase = get_supabase_client()

    query = (
        supabase.table("players")
        .select("id, nba_id, name")
        .not_.is_("nba_id", "null")
        .order("name")
    )

    if TEST_PLAYER_NAMES:
        query = query.in_("name", list(TEST_PLAYER_NAMES))
    else:
        query = query.limit(IMPORT_LIMIT)

        if IMPORT_START_AFTER:
            query = query.gt("name", IMPORT_START_AFTER)

    response = query.execute()

    return response.data


def get_awards_frame(nba_id):
    result = playerawards.PlayerAwards(
        player_id=nba_id,
        headers=NBA_HEADERS,
        timeout=60,
    )

    return result.get_data_frames()[0]


def print_award_insert(player, award_type, season, team_number, description):
    print(
        "insert into public.player_awards "
        "(player_id, nba_id, award_type, season, team_number, description) "
        "values "
        f"({player['id']}, {player['nba_id']}, "
        f"{sql_string(award_type)}, "
        f"{sql_string(season)}, "
        f"{sql_number(team_number)}, "
        f"{sql_string(description)}) "
        "on conflict (nba_id, award_type, season, team_number) "
        "do update set "
        "player_id = excluded.player_id, "
        "description = excluded.description;"
    )


def print_player_awards(player):
    frame = get_awards_frame(player["nba_id"])

    print(f"-- {player['name']}")

    for _, row in frame.iterrows():
        description = clean(row.get("DESCRIPTION", ""))
        award_type = AWARD_TYPE_BY_DESCRIPTION.get(description)

        if not award_type:
            continue

        season = normalize_season(row.get("SEASON"))

        if season is None:
            continue

        team_number = normalize_team_number(
            row.get("ALL_NBA_TEAM_NUMBER")
        )

        print_award_insert(
            player=player,
            award_type=award_type,
            season=season,
            team_number=team_number,
            description=description,
        )

    print()


def main():
    for player in get_players_to_import():
        try:
            print_player_awards(player)
        except Exception as error:
            print(f"-- Skipped {player['name']}: {error}")

        time.sleep(random.uniform(4, 7))


if __name__ == "__main__":
    main()