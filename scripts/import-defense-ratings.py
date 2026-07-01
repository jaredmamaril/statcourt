import os
import sys
import time
import random
from pathlib import Path
from collections import defaultdict

from supabase import create_client
from curl_cffi import requests as cr
from nba_api.stats.library.http import NBAStatsHTTP
from nba_api.stats.endpoints import leaguedashplayerstats

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

SEASONS = [
    "1996-97", "1997-98", "1998-99", "1999-00",
    "2000-01", "2001-02", "2002-03", "2003-04", "2004-05",
    "2005-06", "2006-07", "2007-08", "2008-09", "2009-10",
    "2010-11", "2011-12", "2012-13", "2013-14", "2014-15",
    "2015-16", "2016-17", "2017-18", "2018-19", "2019-20",
    "2020-21", "2021-22", "2022-23", "2023-24", "2024-25",
]

MIN_SEASON_GAMES = 15

DEFENSE_OVERRIDES = {
    893: 94,      # Michael Jordan
    2544: 85,     # LeBron James
    201939: 70,   # Stephen Curry
    203999: 78,   # Nikola Jokic
    78049: 100,   # Bill Russell
    76375: 95,    # Wilt Chamberlain
    76003: 96,    # Kareem Abdul-Jabbar

    23: 96,       # Dennis Rodman
    937: 94,      # Scottie Pippen
    56: 94,       # Gary Payton
    202695: 94,   # Kawhi Leonard
    203110: 92,   # Draymond Green
    1628369: 91,  # Jayson Tatum? only add if ID is correct
    977: 88,      # Kobe Bryant
    2548: 87,     # Dwyane Wade
    203507: 90,   # Giannis Antetokounmpo
    708: 92,      # Kevin Garnett
    87: 97,       # Dikembe Mutombo
    165: 97,      # Hakeem Olajuwon
    1112: 98,     # Ben Wallace
    1495: 95,     # Tim Duncan

    1449: 80,     # Larry Bird
    76681: 84,    # Julius Erving
    305: 86,      # Robert Parish
}


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


def get_existing_players():
    supabase = get_supabase_client()
    rows = []
    page_size = 1000
    start = 0

    while True:
        response = (
            supabase.table("players")
            .select("nba_id, name, position, rpg, spg, bpg, games")
            .not_.is_("nba_id", "null")
            .range(start, start + page_size - 1)
            .execute()
        )

        rows.extend(response.data)

        if len(response.data) < page_size:
            break

        start += page_size

    print(f"-- Loaded {len(rows)} players from Supabase")

    return {
        int(row["nba_id"]): row
        for row in rows
        if row.get("nba_id")
    }


def get_defense_frame(season):
    result = leaguedashplayerstats.LeagueDashPlayerStats(
        season=season,
        season_type_all_star="Regular Season",
        measure_type_detailed_defense="Advanced",
        per_mode_detailed="PerGame",
        headers=NBA_HEADERS,
        timeout=60,
    )

    return result.get_data_frames()[0]


def season_defense_score(rank_index, player_count):
    if player_count <= 1:
        return 70

    # Lower DEF_RATING is better, so earlier rank means better score.
    percentile = 1 - (rank_index / (player_count - 1))
    return round(55 + percentile * 44)


def statcourt_box_score_defense(player):
    score = 58

    spg = float(player.get("spg") or 0)
    bpg = float(player.get("bpg") or 0)
    rpg = float(player.get("rpg") or 0)
    position = player.get("position") or ""

    score += min(spg * 8, 15)
    score += min(bpg * 9, 16)
    score += min(rpg * 0.75, 9)

    if position == "C":
        score += 5
    elif position == "F":
        score += 3

    if position == "G" and spg >= 1.4:
        score += 4

    games = player.get("games")
    if games is not None and int(games) < 100:
        score -= 3

    return max(50, min(97, round(score)))


def blend_defense_score(player, api_scores):
    box_score = statcourt_box_score_defense(player)

    if not api_scores:
        return box_score

    total_games = sum(games for _, games in api_scores)

    if total_games == 0:
        return box_score

    api_score = sum(score * games for score, games in api_scores) / total_games

    # API defensive rating is team/context-heavy, so use it as support only.
    return round(box_score * 0.7 + api_score * 0.3)


def main():
    existing_players = get_existing_players()
    existing_ids = set(existing_players.keys())
    player_api_scores = defaultdict(list)

    for season in SEASONS:
        try:
            frame = get_defense_frame(season)
        except Exception as error:
            print(f"-- Skipped season {season}: {error}")
            continue

        frame = frame[
            (frame["PLAYER_ID"].isin(existing_ids)) &
            (frame["GP"] >= MIN_SEASON_GAMES)
        ].copy()

        if frame.empty:
            print(f"-- No matching players for {season}")
            continue

        frame = frame.sort_values("DEF_RATING", ascending=True).reset_index(drop=True)
        player_count = len(frame)

        for index, row in frame.iterrows():
            nba_id = int(row["PLAYER_ID"])
            games = int(row["GP"])
            score = season_defense_score(index, player_count)
            player_api_scores[nba_id].append((score, games))

        print(f"-- Processed {season}: {player_count} players")
        time.sleep(random.uniform(6, 10))

    for nba_id, player in existing_players.items():
        defense_rating = DEFENSE_OVERRIDES.get(
            nba_id,
            blend_defense_score(player, player_api_scores.get(nba_id, [])),
        )

        print(
            f"update public.players "
            f"set defense_rating = {defense_rating} "
            f"where nba_id = {nba_id};"
        )


if __name__ == "__main__":
    main()
