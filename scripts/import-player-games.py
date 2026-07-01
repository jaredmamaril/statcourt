import os
import sys
import time
import random
from pathlib import Path

from supabase import create_client
from curl_cffi import requests as cr
from nba_api.stats.library.http import NBAStatsHTTP
from nba_api.stats.endpoints import playercareerstats

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

session = cr.Session(impersonate="chrome120")
session.get("https://www.nba.com/stats/", timeout=20)
NBAStatsHTTP.get_session = lambda self: session


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

LIMIT = 500


def get_players_missing_games():
    supabase = get_supabase_client()

    response = (
        supabase.table("players")
        .select("nba_id, name, games")
        .not_.is_("nba_id", "null")
        .is_("games", "null")
        .order("name")
        .limit(LIMIT)
        .execute()
    )

    return response.data


def get_career_games(nba_id):
    career = playercareerstats.PlayerCareerStats(
        player_id=nba_id,
        per_mode36="Totals",
        league_id_nullable="00",
        headers=NBA_HEADERS,
        timeout=15,
    )

    career_totals = career.career_totals_regular_season.get_data_frame()

    if career_totals.empty:
        return None

    return int(career_totals.iloc[0]["GP"])


def main():
    players = get_players_missing_games()

    for player in players:
        nba_id = player["nba_id"]
        name = player["name"]

        try:
            games = get_career_games(nba_id)

            if games is None:
                print(f"-- Skipped {name}: no career totals")
                continue

            print(f"update public.players set games = {games} where nba_id = {nba_id};")

        except Exception as error:
            print(f"-- Skipped {name}: {error}")

        time.sleep(random.uniform(6, 10))


if __name__ == "__main__":
    main()