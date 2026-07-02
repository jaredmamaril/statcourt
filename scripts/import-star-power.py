import os
import sys
from pathlib import Path

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
        os.environ.setdefault(key, value.strip().strip('"'))


def get_supabase_client():
    load_env_file()

    url = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
    key = os.environ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]

    return create_client(url, key)


def get_players():
    supabase = get_supabase_client()

    rows = []
    page_size = 1000
    start = 0

    while True:
        response = (
            supabase.table("players")
            .select("nba_id, name, ppg, rpg, apg, games")
            .not_.is_("nba_id", "null")
            .range(start, start + page_size - 1)
            .execute()
        )

        rows.extend(response.data)

        if len(response.data) < page_size:
            break

        start += page_size

    return rows


def estimate_star_power(player):
    ppg = float(player.get("ppg") or 0)
    apg = float(player.get("apg") or 0)
    three_percent = float(player.get("three_percent") or 0)
    ft_percent = float(player.get("ft_percent") or 0)
    games = int(player.get("games") or 0)
    career_legacy = float(player.get("career_legacy") or 70)

    score = 45

    # Scoring presence
    score += min(ppg * 0.9, 27)

    # Creation / offensive control
    score += min(apg * 1.25, 12)

    # Shooting gravity
    if three_percent >= 40 and ft_percent >= 85:
        score += 8
    elif three_percent >= 37 and ft_percent >= 80:
        score += 5
    elif three_percent >= 34:
        score += 2

    # Superstar scoring thresholds
    if ppg >= 30:
        score += 7
    elif ppg >= 27:
        score += 5
    elif ppg >= 24:
        score += 3
    elif ppg >= 20:
        score += 1

    # Longevity
    if games >= 1000:
        score += 5
    elif games >= 750:
        score += 3
    elif games >= 500:
        score += 1
    elif games < 200:
        score -= 5

    # Resume helps, but does not fully control star power
    score += max(0, career_legacy - 70) * 0.18

    return round(max(45, min(score, 100)))


def main():
    players = get_players()

    for player in players:
        nba_id = player["nba_id"]
        name = player["name"]
        star_power = estimate_star_power(player)

        print(f"-- {name}")
        print(
            f"update public.players "
            f"set star_power = {star_power} "
            f"where nba_id = {nba_id};"
        )
        print()


if __name__ == "__main__":
    main()