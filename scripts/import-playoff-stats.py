import sys
import time
import random
import os
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

IMPORT_LIMIT = 1000
IMPORT_START_AFTER = ""

#$env:PYTHONIOENCODING="utf-8"
#python scripts/import-playoff-stats.py > scripts/playoff-stats-output.sql

PLAYOFF_TEST_PLAYERS = set()
PLAYOFF_TEST_PLAYERS = {
    "LeBron James",
    "Moses Malone",
    "Terry Porter",
    "Tobias Harris",
    "Mychal Thompson",
    "Muggsy Bogues",
    "Mookie Blaylock",
    "Nate Archibald",
    "Monta Ellis",
    "Myles Turner",
    "Morris Peterson",
    "Terry Mills",
    "Michael Beasley",
    "Caris LeVert",
    "Eddy Curry",
    "Kevin Huerter",
    "Montrezl Harrell",
    "Miles Bridges",
    "Luke Kennard",
    "Monty Williams",
    "Brandon Knight",
    "Maxi Kleber",
    "Monte Morris",
    "Deandre Ayton",
    "Jaxson Hayes",
    "Moritz Wagner",
    "Naji Marshall",
    "Duncan Robinson",
    "Christian Wood",
    "Jarred Vanderbilt",
    "Moses Moody",
    "Austin Reaves",
    "Paul Reed",
    "Nassir Little",
    "Chris Duarte",
}
PLAYOFF_TEST_PLAYERS = {
    "Doug Overton",
    "Milt Palacio",
    "Geoff Petrie",
    "Darius Miles",
    "Moochie Norris",
    "Ledell Eackles",
    "Chase Budinger",
    "Bob Rule",
    "Scott Lloyd",
    "Butch Carter",
    "Steve Patterson",
    "Jahidi White",
    "Brian Taylor",
    "Harold Pressley",
    "DeAndre' Bembry",
    "Ryan Arcidiacono",
    "Javonte Green",
    "Jake LaRavia",
    "Sidney Lowe",
    "Eric Riley",
    "Moses Moody",
    "KJ Martin",
    "Paul Reed",
    "Nassir Little",
    "Chris Duarte",
    "Brandon Miller",

    # verify individually
    "Popeye Jones",
    "Lee Mayberry",
    "Geoff Huston",
    "Ryan Gomes",
    "Terry Davis",
    "Marko Jarić",
    "Craig Smith",
    "E.C. Coleman",
    "Dave Budd",
    "Quincy Acy",
    "Fred Boyd",
    "Eddie Griffin",
    "Dan Dickau",
    "Dion Glover",
    "David Nwaba",
    "Sonny Weems",
    "Mateen Cleaves",
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


def get_players_to_import():
    supabase = get_supabase_client()

    query = (
        supabase.table("players")
        .select("nba_id, name")
        .not_.is_("nba_id", "null")
        .order("name")
        .limit(IMPORT_LIMIT)
    )
    
    if PLAYOFF_TEST_PLAYERS:
        query = query.in_("name", list(PLAYOFF_TEST_PLAYERS))
    else:
        query = query.limit(IMPORT_LIMIT)

        if IMPORT_START_AFTER:
            query = query.gt("name", IMPORT_START_AFTER)

    response = query.execute()

    return response.data


def calculate_ts_percent(points, fga, fta):
    denominator = 2 * (fga + 0.44 * fta)

    if denominator <= 0:
        return None

    return round((points / denominator) * 100, 1)


def get_playoff_stats(player):
    career = playercareerstats.PlayerCareerStats(
        player_id=player["nba_id"],
        per_mode36="Totals",
        league_id_nullable="00",
        headers=NBA_HEADERS,
        timeout=60,
    )

    playoff_totals = career.career_totals_post_season.get_data_frame()
    playoff_seasons = career.season_totals_post_season.get_data_frame()

    if playoff_totals.empty:
        return {
            "playoffGames": 0,
            "playoffSeasons": 0,
            "playoffPoints": 0,
            "playoffRebounds": 0,
            "playoffAssists": 0,
            "playoffSteals": 0,
            "playoffBlocks": 0,
            "playoffPpg": None,
            "playoffRpg": None,
            "playoffApg": None,
            "playoffSpg": None,
            "playoffBpg": None,
            "playoffFgPercent": None,
            "playoffThreePercent": None,
            "playoffFtPercent": None,
            "playoffTsPercent": None,
        }

    row = playoff_totals.iloc[0]

    games = int(row["GP"] or 0)
    points = int(row["PTS"] or 0)
    rebounds = int(row["REB"] or 0)
    assists = int(row["AST"] or 0)
    fga = float(row["FGA"] or 0)
    fta = float(row["FTA"] or 0)
    steals = int(row["STL"] or 0)
    blocks = int(row["BLK"] or 0)
    fg_percent = round(float(row["FG_PCT"] or 0) * 100, 1)
    three_percent = round(float(row["FG3_PCT"] or 0) * 100, 1)
    ft_percent = round(float(row["FT_PCT"] or 0) * 100, 1)

    return {
        "playoffGames": games,
        "playoffSeasons": len(playoff_seasons),
        "playoffPoints": points,
        "playoffRebounds": rebounds,
        "playoffAssists": assists,
        "playoffPpg": round(points / games, 1) if games else 0,
        "playoffRpg": round(rebounds / games, 1) if games else 0,
        "playoffApg": round(assists / games, 1) if games else 0,
        "playoffSteals": steals,
        "playoffBlocks": blocks,
        "playoffSpg": round(steals / games, 1) if games else 0,
        "playoffBpg": round(blocks / games, 1) if games else 0,
        "playoffFgPercent": fg_percent,
        "playoffThreePercent": three_percent,
        "playoffFtPercent": ft_percent,
        "playoffTsPercent": calculate_ts_percent(points, fga, fta),
    }


def sql_value(value):
    if value is None:
        return "null"

    return str(value)


def print_update_sql(player, stats):
    print(f"-- {player['name']}")
    print(
        "update public.players set "
        f"playoff_games = {stats['playoffGames']}, "
        f"playoff_seasons = {stats['playoffSeasons']}, "
        f"playoff_points = {stats['playoffPoints']}, "
        f"playoff_rebounds = {stats['playoffRebounds']}, "
        f"playoff_assists = {stats['playoffAssists']}, "
        f"playoff_ppg = {sql_value(stats['playoffPpg'])}, "
        f"playoff_rpg = {sql_value(stats['playoffRpg'])}, "
        f"playoff_apg = {sql_value(stats['playoffApg'])}, "
        f"playoff_steals = {stats['playoffSteals']}, "
        f"playoff_blocks = {stats['playoffBlocks']}, "
        f"playoff_spg = {sql_value(stats['playoffSpg'])}, "
        f"playoff_bpg = {sql_value(stats['playoffBpg'])}, "
        f"playoff_fg_percent = {sql_value(stats['playoffFgPercent'])}, "
        f"playoff_three_percent = {sql_value(stats['playoffThreePercent'])}, "
        f"playoff_ft_percent = {sql_value(stats['playoffFtPercent'])}, "
        f"playoff_ts_percent = {sql_value(stats['playoffTsPercent'])} "
        f"where nba_id = {player['nba_id']};"
    )
    print()


def main():
    for player in get_players_to_import():
        try:
            stats = get_playoff_stats(player)
            print_update_sql(player, stats)
        except Exception as error:
            print(f"-- Skipped {player['name']}: {error}")

        time.sleep(random.uniform(4, 7))


if __name__ == "__main__":
    main()