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


IMPORT_LIMIT = 500
IMPORT_START_AFTER = ""

#$env:PYTHONIOENCODING="utf-8"
#python scripts/import-career-legacy.py > scripts/career-legacy-output.sql


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


def get_players_to_import():
    supabase = get_supabase_client()

    query = (
        supabase.table("players")
        .select("nba_id, name, games, ppg, rpg, apg")
        .not_.is_("nba_id", "null")
        .order("name")
        .limit(IMPORT_LIMIT)
    )

    if IMPORT_START_AFTER:
        query = query.gt("name", IMPORT_START_AFTER)

    response = query.execute()

    return {
        int(row["nba_id"]): row
        for row in response.data
        if row.get("nba_id")
    }


def get_awards_frame(nba_id):
    result = playerawards.PlayerAwards(
        player_id=nba_id,
        headers=NBA_HEADERS,
        timeout=60,
    )

    return result.get_data_frames()[0]


def clean(value):
    return str(value).strip()


def count_awards(frame):
    counts = {
        "mvp": 0,
        "finalsMvp": 0,
        "championships": 0,
        "allNbaFirst": 0,
        "allNbaSecond": 0,
        "allNbaThird": 0,
        "allDefenseFirst": 0,
        "allDefenseSecond": 0,
        "allStar": 0,
        "dpoy": 0,
    }

    for _, row in frame.iterrows():
        description = clean(row.get("DESCRIPTION", ""))
        team_number = clean(row.get("ALL_NBA_TEAM_NUMBER", ""))

        if description == "NBA Most Valuable Player":
            counts["mvp"] += 1

        elif description == "NBA Finals Most Valuable Player":
            counts["finalsMvp"] += 1

        elif description == "NBA Champion":
            counts["championships"] += 1

        elif description == "NBA Defensive Player of the Year":
            counts["dpoy"] += 1

        elif description == "NBA All-Star":
            counts["allStar"] += 1

        elif description == "All-NBA":
            if team_number == "1":
                counts["allNbaFirst"] += 1
            elif team_number == "2":
                counts["allNbaSecond"] += 1
            elif team_number == "3":
                counts["allNbaThird"] += 1

        elif description == "All-Defensive Team":
            if team_number == "1":
                counts["allDefenseFirst"] += 1
            elif team_number == "2":
                counts["allDefenseSecond"] += 1

    return counts


def diminishing(count, values, repeat_value=0):
    score = 0

    for index in range(count):
        if index < len(values):
            score += values[index]
        else:
            score += repeat_value

    return score


def calculate_career_legacy(counts, player):
    games = int(player.get("games") or 0)
    ppg = float(player.get("ppg") or 0)
    rpg = float(player.get("rpg") or 0)
    apg = float(player.get("apg") or 0)

    score = 22

    score += diminishing(counts["mvp"], [10, 8, 6, 4, 3], 1)
    score += diminishing(counts["finalsMvp"], [8, 6, 4, 3], 1)
    score += diminishing(counts["championships"], [3, 2.5, 2, 1.5, 1], 0.5)
    score += diminishing(counts["dpoy"], [7, 5, 3.5, 2.5], 1)

    score += diminishing(counts["allNbaFirst"], [4, 3.5, 3, 2.5, 2, 1.5], 0.75)
    score += diminishing(counts["allNbaSecond"], [2.2, 1.8, 1.4, 1], 0.5)
    score += diminishing(counts["allNbaThird"], [1.4, 1.1, 0.8], 0.35)

    score += diminishing(counts["allDefenseFirst"], [2.2, 1.8, 1.4, 1], 0.5)
    score += diminishing(counts["allDefenseSecond"], [1.2, 1, 0.8], 0.35)

    score += min(counts["allStar"] * 0.45, 7)

    if games >= 1200:
        score += 14
    elif games >= 1000:
        score += 11
    elif games >= 750:
        score += 8
    elif games >= 500:
        score += 5
    elif games >= 250:
        score += 3
    elif games >= 100:
        score += 1

    if ppg >= 25:
        score += 2
    elif ppg >= 20:
        score += 1

    if apg >= 7:
        score += 1

    if rpg >= 10:
        score += 1

    total_all_nba = (
        counts["allNbaFirst"]
        + counts["allNbaSecond"]
        + counts["allNbaThird"]
    )

    if (
        counts["championships"] >= 4
        and counts["allStar"] >= 4
        and total_all_nba >= 2
    ):
        score += 4
    elif (
        counts["championships"] >= 3
        and counts["allStar"] >= 3
        and total_all_nba >= 2
    ):
        score += 2

    capped_score = round(min(score, 100), 1)

    return capped_score


def main():
    players_to_import = get_players_to_import()

    for nba_id, player in players_to_import.items():
        name = player["name"]

        try:
            frame = get_awards_frame(nba_id)
            counts = count_awards(frame)
            career_legacy = calculate_career_legacy(counts, player)

            print(f"-- {name}: {counts}")
            print(
                f"update public.players "
                f"set career_legacy = {career_legacy} "
                f"where nba_id = {nba_id};"
            )
            print()

        except Exception as error:
            print(f"-- Skipped {name}: {error}")

        time.sleep(random.uniform(4, 7))


if __name__ == "__main__":
    main()