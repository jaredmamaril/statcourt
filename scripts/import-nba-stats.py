import os
import sys
import unicodedata
import time
import random
from pathlib import Path
from supabase import create_client
from curl_cffi import requests as cr
from nba_api.stats.library.http import NBAStatsHTTP
from nba_api.stats.static import players
from nba_api.stats.endpoints import (
    playercareerstats,
    commonplayerinfo,
    leaguedashplayerstats,
)

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

SKIP_COMMON_PLAYER_INFO = False
PLAYER_IMPORT_CONTEXT = {}

IMPORT_MODE = "directory"  # "pending", "all", "directory", or "selected"
SELECTED_PLAYERS = []
DIRECTORY_LIMIT = 1000
DIRECTORY_START_AFTER = "Scottie Pippen"
DEFENSE_SEASONS = ["2022-23", "2023-24", "2024-25"]
ONLY_IMPORT = set()

MANUAL_PLAYER_STATS = {
    "LeBron James": {
        "games": 1622,
        "ppg": 26.8,
        "rpg": 7.5,
        "apg": 7.4,
        "spg": 1.5,
        "bpg": 0.7,
        "fgPercent": 50.7,
        "threePercent": 34.8,
        "ftPercent": 73.7,
    },
}
PLAYER_NAME_OVERRIDES = {
    "Luka Don─ìi─ç": "Luka Doncic",
}


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

def get_players_to_import():
    global PLAYER_IMPORT_CONTEXT

    supabase = get_supabase_client()

    if IMPORT_MODE == "directory":
        existing_response = supabase.table("players").select("nba_id").execute()
        existing_nba_ids = {
            row["nba_id"] for row in existing_response.data if row["nba_id"] is not None
        }

        directory_response = (
            supabase.table("player_directory")
            .select("nba_id, name, team, from_year, to_year")
            .gt("name", DIRECTORY_START_AFTER)
            .order("name")
            .limit(DIRECTORY_LIMIT * 2)
            .execute()
        )

        rows = [
            row
            for row in directory_response.data
            if row["nba_id"] not in existing_nba_ids
        ][:DIRECTORY_LIMIT]

        PLAYER_IMPORT_CONTEXT = {
            row["name"]: {
                "team": row["team"],
                "stats_source": "directory_import",
            }
            for row in rows
        }

        return [row["name"] for row in rows]

    query = supabase.table("players").select(
        "name, team, position, jersey_number, fallback_image, stats_source"
    ).order("name")

    if IMPORT_MODE == "selected":
        query = query.in_("name", SELECTED_PLAYERS)
    elif IMPORT_MODE == "pending":
        query = query.eq("stats_source", "pending_import")

    response = query.execute()

    PLAYER_IMPORT_CONTEXT = {row["name"]: row for row in response.data}

    if IMPORT_MODE == "selected":
        return SELECTED_PLAYERS

    return [row["name"] for row in response.data]


def get_manual_stats(player, player_info):
    manual = MANUAL_PLAYER_STATS.get(player["full_name"])

    if not manual:
        raise ValueError(f"No career totals or manual stats found for {player['full_name']}")

    return {
        "nbaId": int(player["id"]),
        "name": player["full_name"],
        "team": player_info["team"],
        "jersey": player_info["jersey"],
        "apiPosition": player_info["apiPosition"],
        "heightInches": player_info["heightInches"],
        "weightPounds": player_info["weightPounds"],
        "fromYear": player_info["fromYear"],
        "toYear": player_info["toYear"],
        "source": "manual_career",
        **manual,
    }


def percent(made, attempted):
    if attempted == 0:
        return 0

    return round((made / attempted) * 100, 1)


def format_text_array(values):
    if not values:
        return "'{}'"

    items = ",".join(f'"{value}"' for value in values)
    return f"'{{{items}}}'"    

    
def estimate_star_power(stats):
    score = 60

    score += stats["ppg"] * 0.8
    score += stats["apg"] * 1.2
    score += stats["rpg"] * 0.5
    score += min(stats["games"] / 100, 10)

    return max(50, min(100, round(score)))


def convert_nba_def_rating(nba_def_rating):
    rating = 100 - ((nba_def_rating - 105) * 2.5)
    return max(50, min(99, round(rating)))


def get_defense_dataframe(season):
    advanced = run_nba_request(
    f"defense stats for {season}",
    lambda: leaguedashplayerstats.LeagueDashPlayerStats(
        season=season,
        season_type_all_star="Regular Season",
        measure_type_detailed_defense="Advanced",
        per_mode_detailed="PerGame",
        headers=NBA_HEADERS,
        timeout=60,
    ),
)

    return advanced.get_data_frames()[0]


def estimate_defense_from_box_score(stats):
    score = 62

    score += min(stats["spg"] * 7, 12)
    score += min(stats["bpg"] * 8, 14)
    score += min(stats["rpg"] * 0.9, 10)

    if stats["position"] in ["F", "C"]:
        score += 5

    if stats["position"] == "G" and stats["spg"] >= 1.5:
        score += 4

    return max(50, min(99, round(score)))


def get_multi_season_defense_rating(stats, seasons):
    ratings = []

    for season in seasons:
        try:
            defense_df = get_defense_dataframe(season)
        except Exception as error:
            print(f"-- Skipped defense season {season} for {stats['name']}: {error}")
            continue

        match = defense_df[defense_df["PLAYER_NAME"] == stats["name"]]

        if match.empty:
            continue

        ratings.append(float(match.iloc[0]["DEF_RATING"]))

    if not ratings:
        return estimate_defense_from_box_score(stats)

    average_def_rating = sum(ratings) / len(ratings)

    return convert_nba_def_rating(average_def_rating)


def height_to_inches(height):
    if not height or "-" not in height:
        return 0

    feet, inches = height.split("-")
    return int(feet) * 12 + int(inches)    


def infer_position(api_position):
    if "Guard" in api_position:
        return "G"

    if "Forward" in api_position:
        return "F"

    if "Center" in api_position:
        return "C"

    return "F"   


def get_player_info(nba_id):
    if SKIP_COMMON_PLAYER_INFO:
        return {
            "team": "FA",
            "jersey": 0,
            "apiPosition": "",
            "heightInches": 0,
            "weightPounds": 0,
            "fromYear": None,
            "toYear": None,
        }

    try:
        info = run_nba_request(
            f"common player info for {nba_id}",
            lambda: commonplayerinfo.CommonPlayerInfo(
            player_id=nba_id,
           headers=NBA_HEADERS,
            timeout=60,
    ),
        )
        frame = info.get_data_frames()[0]
    except Exception as error:
        print(f"-- Skipped common player info for {nba_id}: {error}")
        return {
            "team": "FA",
            "jersey": 0,
            "apiPosition": "",
            "heightInches": 0,
            "weightPounds": 0,
            "fromYear": None,
            "toYear": None,
        }

    if frame.empty:
        return {
            "team": "FA",
            "jersey": 0,
            "apiPosition": "",
            "heightInches": 0,
            "weightPounds": 0,
            "fromYear": None,
            "toYear": None,
        }

    row = frame.iloc[0]
    jersey = row["JERSEY"]

    return {
        "team": row["TEAM_ABBREVIATION"] or "FA",
        "jersey": int(jersey) if str(jersey).isdigit() else 0,
        "apiPosition": row["POSITION"] or "",
        "heightInches": height_to_inches(row["HEIGHT"]),
        "weightPounds": int(row["WEIGHT"]) if str(row["WEIGHT"]).isdigit() else 0,
        "fromYear": int(row["FROM_YEAR"]) if str(row["FROM_YEAR"]).isdigit() else None,
        "toYear": int(row["TO_YEAR"]) if str(row["TO_YEAR"]).isdigit() else None,
    }


def get_career_averages(player_name):
    lookup_name = PLAYER_NAME_OVERRIDES.get(player_name, player_name)
    matches = players.find_players_by_full_name(lookup_name)

    if not matches:
        raise ValueError(f"No NBA player found for {player_name}")

    player = matches[0]
    player_info = get_player_info(player["id"])
    existing = PLAYER_IMPORT_CONTEXT.get(player_name, {})
    if player_info["team"] == "FA" and existing.get("team"):
        player_info["team"] = existing["team"]

    if player_info["jersey"] == 0 and existing.get("jersey_number"):
        player_info["jersey"] = existing["jersey_number"]

    career = run_nba_request(
    f"career stats for {player_name}",
    lambda: playercareerstats.PlayerCareerStats(
        player_id=player["id"],
        per_mode36="Totals",
        league_id_nullable="00",
        headers=NBA_HEADERS,
        timeout=60,
    ),
)

    career_totals = career.career_totals_regular_season.get_data_frame()

    if career_totals.empty:
        return get_manual_stats(player, player_info)

    row = career_totals.iloc[0]
    games = row["GP"]

    return {
        "nbaId": int(player["id"]),
        "name": player["full_name"],
        "team": player_info["team"],
        "jersey": player_info["jersey"],
        "apiPosition": player_info["apiPosition"],
        "heightInches": player_info["heightInches"],
        "weightPounds": player_info["weightPounds"],
        "fromYear": player_info["fromYear"],
        "toYear": player_info["toYear"],
        "source": "career_totals",
        "games": int(games),
        "ppg": float(round(row["PTS"] / games, 1)),
        "rpg": float(round(row["REB"] / games, 1)),
        "apg": float(round(row["AST"] / games, 1)),
        "spg": float(round(safe_float(row["STL"]) / games, 1)),
        "bpg": float(round(safe_float(row["BLK"]) / games, 1)),
        "fgPercent": float(round(safe_float(row["FG_PCT"]) * 100, 1)),
        "threePercent": float(round(safe_float(row["FG3_PCT"]) * 100, 1)),
        "ftPercent": float(round(safe_float(row["FT_PCT"]) * 100, 1)),
    }


def sql_string(value):
    if value is None:
        return "null"

    return "'" + str(value).replace("'", "''") + "'"


def safe_float(value, fallback=0):
    if value is None:
        return fallback

    return float(value)


def slugify_name(name):
    normalized = unicodedata.normalize("NFKD", name)
    ascii_name = normalized.encode("ascii", "ignore").decode("ascii")

    return ascii_name.lower().replace("'", "").replace(" ", "-")


def print_upsert_sql(stats):
    print(f"""
insert into public.players (
  nba_id,
  name,
  team,
  fallback_image,
  position,
  jersey_number,

  ppg,
  rpg,
  apg,
  spg,
  bpg,
  fg_percent,
  three_percent,
  ft_percent,

  defense_rating,
  star_power,

  height_inches,
  weight_pounds,
  from_year,
  to_year,
  api_position,

  stats_source,
  updated_at
)
values (
  {stats["nbaId"]},
  {sql_string(stats["name"])},
  {sql_string(stats["team"])},
  {sql_string(f'/players/headshots/{slugify_name(stats["name"])}.png')},
  {sql_string(stats["position"])},
  {stats["jersey"]},

  {stats["ppg"]},
  {stats["rpg"]},
  {stats["apg"]},
  {stats["spg"]},
  {stats["bpg"]},
  {stats["fgPercent"]},
  {stats["threePercent"]},
  {stats["ftPercent"]},

  {stats["defense"]},
  {stats["starPower"]},

  {stats["heightInches"]},
  {stats["weightPounds"]},
  {stats["fromYear"] if stats["fromYear"] is not None else "null"},
  {stats["toYear"] if stats["toYear"] is not None else "null"},
  {sql_string(stats["apiPosition"])},

  {sql_string(stats["source"])},
  now()
)
on conflict (nba_id)
do update set
  name = excluded.name,
  team = excluded.team,
  fallback_image = excluded.fallback_image,
  position = excluded.position,
  jersey_number = excluded.jersey_number,

  ppg = excluded.ppg,
  rpg = excluded.rpg,
  apg = excluded.apg,
  spg = excluded.spg,
  bpg = excluded.bpg,
  fg_percent = excluded.fg_percent,
  three_percent = excluded.three_percent,
  ft_percent = excluded.ft_percent,

  defense_rating = excluded.defense_rating,
  star_power = excluded.star_power,

  height_inches = excluded.height_inches,
  weight_pounds = excluded.weight_pounds,
  from_year = excluded.from_year,
  to_year = excluded.to_year,
  api_position = excluded.api_position,

  stats_source = excluded.stats_source,
  updated_at = now();
""")


def main():
    for player_name in get_players_to_import():
        if ONLY_IMPORT and player_name not in ONLY_IMPORT:
            continue

        try:
            stats = get_career_averages(player_name)

            stats["position"] = infer_position(stats["apiPosition"])
            stats["starPower"] = estimate_star_power(stats)
            # Defense API import will be handled separately so this main import stays stable.
            stats["defense"] = estimate_defense_from_box_score(stats)

            print_upsert_sql(stats)
        except Exception as error:
            print(f"-- Skipped {player_name}: {error}")

        time.sleep(random.uniform(3, 6))


if __name__ == "__main__":
    main()