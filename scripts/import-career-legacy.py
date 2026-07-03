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
IMPORT_START_AFTER = "Xavier Henry"

TEST_PLAYER_NAMES = set()

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


def get_players_to_import(supabase):
    query = (
        supabase.table("players")
        .select(
            "nba_id, name, games, ppg, rpg, apg, from_year, to_year, "
            "playoff_games, playoff_seasons, playoff_points, playoff_rebounds, "
            "playoff_assists, playoff_ppg, playoff_rpg, playoff_apg, playoff_ts_percent"
        )
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


def normalize_season(value):
    season = clean(value)

    if season.lower() in {"", "nan", "none", "null"}:
        return None

    return season


def get_award_profile(frame):
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

    seasons = {
        "mvp": set(),
        "finalsMvp": set(),
        "championships": set(),
        "allNbaFirst": set(),
        "allNbaSecond": set(),
        "allNbaThird": set(),
        "allDefenseFirst": set(),
        "allDefenseSecond": set(),
        "allStar": set(),
        "dpoy": set(),
    }

    for _, row in frame.iterrows():
        description = clean(row.get("DESCRIPTION", ""))
        team_number = clean(row.get("ALL_NBA_TEAM_NUMBER", ""))
        season = normalize_season(row.get("SEASON"))

        if not season:
            continue

        if description == "NBA Most Valuable Player":
            counts["mvp"] += 1
            seasons["mvp"].add(season)

        elif description == "NBA Finals Most Valuable Player":
            counts["finalsMvp"] += 1
            seasons["finalsMvp"].add(season)

        elif description == "NBA Champion":
            counts["championships"] += 1
            seasons["championships"].add(season)

        elif description == "NBA Defensive Player of the Year":
            counts["dpoy"] += 1
            seasons["dpoy"].add(season)

        elif description == "NBA All-Star":
            counts["allStar"] += 1
            seasons["allStar"].add(season)

        elif description == "All-NBA":
            if team_number == "1":
                counts["allNbaFirst"] += 1
                seasons["allNbaFirst"].add(season)
            elif team_number == "2":
                counts["allNbaSecond"] += 1
                seasons["allNbaSecond"].add(season)
            elif team_number == "3":
                counts["allNbaThird"] += 1
                seasons["allNbaThird"].add(season)

        elif description == "All-Defensive Team":
            if team_number == "1":
                counts["allDefenseFirst"] += 1
                seasons["allDefenseFirst"].add(season)
            elif team_number == "2":
                counts["allDefenseSecond"] += 1
                seasons["allDefenseSecond"].add(season)

    return counts, seasons


def get_award_profile_from_supabase(supabase, nba_id):
    response = (
        supabase.table("player_awards")
        .select("award_type, season, team_number")
        .eq("nba_id", nba_id)
        .execute()
    )

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

    seasons = {
        "mvp": set(),
        "finalsMvp": set(),
        "championships": set(),
        "allNbaFirst": set(),
        "allNbaSecond": set(),
        "allNbaThird": set(),
        "allDefenseFirst": set(),
        "allDefenseSecond": set(),
        "allStar": set(),
        "dpoy": set(),
    }

    for row in response.data:
        award_type = row.get("award_type")
        season = normalize_season(row.get("season"))
        team_number = row.get("team_number")

        if season is None:
            continue

        if award_type == "mvp":
            counts["mvp"] += 1
            seasons["mvp"].add(season)
        elif award_type == "finals_mvp":
            counts["finalsMvp"] += 1
            seasons["finalsMvp"].add(season)
        elif award_type == "championship":
            counts["championships"] += 1
            seasons["championships"].add(season)
        elif award_type == "dpoy":
            counts["dpoy"] += 1
            seasons["dpoy"].add(season)
        elif award_type == "all_star":
            counts["allStar"] += 1
            seasons["allStar"].add(season)
        elif award_type == "all_nba":
            if team_number == 1:
                counts["allNbaFirst"] += 1
                seasons["allNbaFirst"].add(season)
            elif team_number == 2:
                counts["allNbaSecond"] += 1
                seasons["allNbaSecond"].add(season)
            elif team_number == 3:
                counts["allNbaThird"] += 1
                seasons["allNbaThird"].add(season)
        elif award_type == "all_defense":
            if team_number == 1:
                counts["allDefenseFirst"] += 1
                seasons["allDefenseFirst"].add(season)
            elif team_number == 2:
                counts["allDefenseSecond"] += 1
                seasons["allDefenseSecond"].add(season)

    return counts, seasons


def diminishing(count, values, repeat_value=0):
    score = 0

    for index in range(count):
        if index < len(values):
            score += values[index]
        else:
            score += repeat_value

    return score


def get_pre_award_exposure(from_year, to_year, award_start_year):
    if not from_year or not to_year or to_year < from_year:
        return 0

    total_seasons = to_year - from_year + 1
    pre_award_last_year = award_start_year - 1

    pre_award_seasons = max(
        0,
        min(to_year, pre_award_last_year) - from_year + 1,
    )

    return pre_award_seasons / total_seasons


def get_era_adjustment(counts, player):
    from_year = int(player.get("from_year") or 0)
    to_year = int(player.get("to_year") or 0)

    if not from_year or not to_year:
        return 0

    finals_mvp_exposure = get_pre_award_exposure(from_year, to_year, 1969)
    all_defense_exposure = get_pre_award_exposure(from_year, to_year, 1969)
    dpoy_exposure = get_pre_award_exposure(from_year, to_year, 1983)
    all_nba_third_exposure = get_pre_award_exposure(from_year, to_year, 1989)

    adjustment = 0

    adjustment += finals_mvp_exposure * min(counts["championships"] * 0.8, 5)
    adjustment += all_defense_exposure * min(counts["mvp"] * 0.8, 4)

    adjustment += dpoy_exposure * min(
        (counts["championships"] + counts["allDefenseFirst"] + counts["mvp"])
        * 0.45,
        5,
    )

    adjustment += all_nba_third_exposure * min(
        (counts["allNbaFirst"] + counts["allNbaSecond"]) * 0.25,
        3,
    )

    return adjustment


def get_championship_role_score(seasons, counts, player):
    lead_title_count = 0
    star_title_count = 0
    role_title_count = 0

    for season in seasons["championships"]:
        if season in seasons["finalsMvp"]:
            lead_title_count += 1
        elif season in seasons["mvp"]:
            lead_title_count += 1
        elif season in seasons["allNbaFirst"]:
            star_title_count += 1
        elif (
            season in seasons["allNbaSecond"]
            or season in seasons["allNbaThird"]
            or season in seasons["allStar"]
        ):
            star_title_count += 1
        else:
            role_title_count += 1

    from_year = int(player.get("from_year") or 0)

    if from_year and from_year < 1969 and counts["mvp"] >= 3:
        star_title_count += role_title_count
        role_title_count = 0

    return (
        diminishing(lead_title_count, [4.5, 3.8, 3.2, 2.6], 1.5)
        + diminishing(star_title_count, [2.2, 1.8, 1.4], 0.8)
        + min(role_title_count * 0.4, 2)
    )


def get_championship_role_breakdown(seasons, counts, player):
    lead = []
    star = []
    role = []

    for season in seasons["championships"]:
        if season in seasons["finalsMvp"]:
            lead.append(season)
        elif season in seasons["mvp"]:
            lead.append(season)
        elif season in seasons["allNbaFirst"]:
            star.append(season)
        elif (
            season in seasons["allNbaSecond"]
            or season in seasons["allNbaThird"]
            or season in seasons["allStar"]
        ):
            star.append(season)
        else:
            role.append(season)

    from_year = int(player.get("from_year") or 0)

    if from_year and from_year < 1969 and counts["mvp"] >= 3:
        star.extend(role)
        role = []

    return lead, star, role


def get_regular_season_legacy_score(player):
    games = int(player.get("games") or 0)
    ppg = float(player.get("ppg") or 0)
    rpg = float(player.get("rpg") or 0)
    apg = float(player.get("apg") or 0)

    score = 0

    score += min(ppg / 27, 1) * 7
    score += min(rpg / 12, 1) * 3
    score += min(apg / 9, 1) * 3

    career_sample = min(games / 700, 1)

    return score * career_sample * 0.75


def get_playoff_legacy_score(player):
    playoff_games = int(player.get("playoff_games") or 0)
    playoff_seasons = int(player.get("playoff_seasons") or 0)
    playoff_points = int(player.get("playoff_points") or 0)
    playoff_rebounds = int(player.get("playoff_rebounds") or 0)
    playoff_assists = int(player.get("playoff_assists") or 0)
    playoff_ts_percent = float(player.get("playoff_ts_percent") or 0)

    score = 0

    score += min(playoff_games / 250, 1) * 2.5
    score += min(playoff_seasons / 15, 1) * 1.5
    score += min(playoff_points / 7000, 1) * 2.5
    score += min(playoff_rebounds / 2500, 1) * 1.25
    score += min(playoff_assists / 1800, 1) * 1.25

    if playoff_games >= 20:
        if playoff_ts_percent >= 60:
            score += 1
        elif playoff_ts_percent >= 56:
            score += 0.6

    return min(score, 12)


def get_sustained_prime_score(counts):
    total_all_nba = (
        counts["allNbaFirst"]
        + counts["allNbaSecond"]
        + counts["allNbaThird"]
    )

    first_team_weight = counts["allNbaFirst"] * 1.0
    second_team_weight = counts["allNbaSecond"] * 0.65
    third_team_weight = counts["allNbaThird"] * 0.4

    weighted_elite_seasons = (
        first_team_weight
        + second_team_weight
        + third_team_weight
    )

    elite_prime_score = min(weighted_elite_seasons / 10, 1) * 5
    star_consistency_score = min(counts["allStar"] / 12, 1) * 1.5

    return elite_prime_score + star_consistency_score


def normalize_career_legacy(raw_score):
    if raw_score <= 80:
        return round(max(20, raw_score), 1)

    if raw_score <= 110:
        compressed = 80 + (raw_score - 80) * 0.45
        return round(compressed, 1)

    compressed = 93.5 + (raw_score - 110) * 0.18

    return round(min(compressed, 100), 1)


def get_longevity_score(counts, player):
    games = int(player.get("games") or 0)
    from_year = int(player.get("from_year") or 0)
    to_year = int(player.get("to_year") or 0)

    seasons = max(0, to_year - from_year + 1) if from_year and to_year else 0

    games_score = min(games / 1200, 1) * 8
    seasons_score = min(seasons / 18, 1) * 3

    return games_score + seasons_score


def calculate_career_legacy(counts, seasons, player):
    score = 22

    score += diminishing(counts["mvp"], [10, 8, 6, 4, 3], 1)
    if counts["mvp"] >= 3:
        score += 3
    elif counts["mvp"] >= 2:
        score += 1.5
    score += diminishing(counts["finalsMvp"], [8, 6, 4, 3], 1)
    score += get_championship_role_score(seasons, counts, player)
    score += get_playoff_legacy_score(player)
    score += get_regular_season_legacy_score(player)
    score += diminishing(counts["dpoy"], [7, 5, 3.5, 2.5], 1)

    score += diminishing(counts["allNbaFirst"], [4, 3.5, 3, 2.5, 2, 1.5], 0.75)
    score += diminishing(
        counts["allNbaSecond"],
        [2.7, 2.3, 1.9, 1.5, 1.1],
        0.6,
    )
    score += diminishing(counts["allNbaThird"], [1.4, 1.1, 0.8], 0.35)

    score += diminishing(counts["allDefenseFirst"], [2.2, 1.8, 1.4, 1], 0.5)
    score += diminishing(counts["allDefenseSecond"], [1.2, 1, 0.8], 0.35)

    score += diminishing(
        counts["allStar"],
        [0.8, 0.7, 0.6, 0.5, 0.5, 0.4, 0.4, 0.3],
        0.2,
    )

    score += get_longevity_score(counts, player)
    score += get_sustained_prime_score(counts)

    score += get_era_adjustment(counts, player)

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

    raw_score = score
    career_legacy = normalize_career_legacy(raw_score)

    return round(raw_score, 1), career_legacy


def main():
    supabase = get_supabase_client()
    players_to_import = get_players_to_import(supabase)

    for nba_id, player in players_to_import.items():
        name = player["name"]

        try:
            counts, seasons = get_award_profile_from_supabase(supabase, nba_id)
            raw_score, career_legacy = calculate_career_legacy(counts, seasons, player)
            lead_titles, star_titles, role_titles = get_championship_role_breakdown(seasons, counts, player,)

            print(
                f"-- {name}: raw={raw_score}, legacy={career_legacy}, "
                f"lead_titles={lead_titles}, "
                f"star_titles={star_titles}, "
                f"role_titles={role_titles}, "
                f"counts={counts}"
            )
            print(
                f"update public.players "
                f"set career_legacy = {career_legacy} "
                f"where nba_id = {nba_id};"
            )
            print()

        except Exception as error:
            print(f"-- Skipped {name}: {error}")



if __name__ == "__main__":
    main()