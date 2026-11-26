"""Read-only check for issue #37: compares career stats with Basketball Reference and
counts players whose two career sources (players columns vs. career profile) disagree.

Uses the public anon key (reads only, like the app) and fetches 6 Basketball Reference
pages, 8 seconds apart (it blocks clients that go faster than ~20 requests a minute; a
403 means try again later).

    $env:PYTHONIOENCODING="utf-8"
    python -u scripts/check-career-stats.py
"""

import os
import re
import sys
import time

from curl_cffi import requests as cr

from pipeline_common import load_env_file

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# (name in StatCourt, Basketball Reference page id, why it's in the sample)
SAMPLE = [
    ("A.C. Green", "g/greenac01", "issue example"),
    ("Carmelo Anthony", "a/anthoca01", "traded mid-season"),
    ("Wilt Chamberlain", "c/chambwi01", "pre-1980, untracked stats"),
    ("Nikola Jokić", "j/jokicni01", "current star"),
    ("Luka Doncic", "d/doncilu01", "current star, traded mid-season"),
    ("Alexander Volkov", "v/volkoal01", "short career"),
]

# Basketball Reference data-stat -> StatCourt column (percentages are 0-1 on BBR).
BBR_STATS = {
    "games": "games",
    "pts_per_g": "ppg",
    "trb_per_g": "rpg",
    "ast_per_g": "apg",
    "stl_per_g": "spg",
    "blk_per_g": "bpg",
    "fg_pct": "fg_percent",
    "fg3_pct": "three_percent",
    "ft_pct": "ft_percent",
}
PERCENTS = {"fg_percent", "three_percent", "ft_percent"}
# Basketball Reference shows blocks for Wilt Chamberlain (5.4), but the NBA's official
# data has none before 1973-74, so StatCourt (built from NBA data) shows "—".
KNOWN_SOURCE_DIFFERENCES = {("Wilt Chamberlain", "bpg")}
PER_GAME = {"ppg", "rpg", "apg", "spg", "bpg"}
CAREER_COLUMNS = ["games", *sorted(PER_GAME), *sorted(PERCENTS)]


def read_client():
    from supabase import create_client

    load_env_file()

    return create_client(os.environ["NEXT_PUBLIC_SUPABASE_URL"], os.environ["NEXT_PUBLIC_SUPABASE_ANON_KEY"])


def fetch_all(query_fn, page_size=1000):
    rows, start = [], 0

    while True:
        page = query_fn().range(start, start + page_size - 1).execute().data or []
        rows.extend(page)

        if len(page) < page_size:
            return rows

        start += page_size


class BlockedError(Exception):
    pass


def bbr_career(page_id):
    url = f"https://www.basketball-reference.com/players/{page_id}.html"
    response = cr.get(url, impersonate="chrome120", timeout=30)

    if response.status_code in (403, 429):
        time.sleep(60)
        response = cr.get(url, impersonate="chrome120", timeout=30)

    if response.status_code in (403, 429):
        raise BlockedError(f"HTTP {response.status_code}")

    row = re.search(r'<tr id="per_game_stats\.Yrs".*?</tr>', response.text, re.S)

    if not row:
        return None

    cells = dict(re.findall(r'data-stat="([a-z0-9_]+)"[^>]*>([^<]*)<', row.group(0)))
    career = {}

    for stat, column in BBR_STATS.items():
        text = cells.get(stat, "").strip()

        if not text:
            career[column] = None
        elif column in PERCENTS:
            career[column] = round(float(text) * 100, 1)
        else:
            career[column] = float(text) if "." in text else int(text)

    return career


def as_number(value):
    return None if value is None else float(value)


def differs(column, a, b):
    if a is None or b is None:
        return (a is None) != (b is None)

    limit = 0.5 if column in PERCENTS else 0.2 if column in PER_GAME else 0

    return abs(float(a) - float(b)) > limit


def main():
    supabase = read_client()
    players = fetch_all(
        lambda: supabase.table("players")
        .select("id, nba_id, name, " + ", ".join(CAREER_COLUMNS))
        .neq("stats_source", "pending_import")
        .gt("ppg", 0)
        .not_.is_("fallback_image", "null")
        .order("id")
    )
    careers = {
        row["player_id"]: row
        for row in fetch_all(
            lambda: supabase.table("player_stat_profiles")
            .select("player_id, " + ", ".join(CAREER_COLUMNS))
            .eq("profile_type", "career")
            .order("id")
        )
    }
    by_name = {player["name"]: player for player in players}

    print("== Basketball Reference comparison (BBR / players columns / career profile)")

    for name, page_id, why in SAMPLE:
        time.sleep(8)

        try:
            bbr = bbr_career(page_id)
        except BlockedError as error:
            print(f"-- {name}: Basketball Reference blocked the request ({error}); run again later")
            continue

        player = by_name.get(name)

        if not bbr or not player:
            print(f"-- {name}: {'no Basketball Reference row' if not bbr else 'not in StatCourt'}")
            continue

        career = careers.get(player["id"], {})
        off = []

        for column in CAREER_COLUMNS:
            if (name, column) in KNOWN_SOURCE_DIFFERENCES:
                continue

            expected = bbr[column]

            for source, value in (("players", player.get(column)), ("career", career.get(column))):
                value = as_number(value)

                if (expected is None) != (value is None) or (
                    expected is not None and abs(float(expected) - value) > 0.05
                ):
                    off.append(f"{source}.{column} {value} (BBR {expected})")

        status = "OK" if not off else "; ".join(off)
        print(f"-- {name} ({why}): {status}")

    print("\n== Players whose players columns and career profile disagree (>0.5 pp, >0.2 per game)")
    counts = {column: 0 for column in CAREER_COLUMNS}
    any_mismatch = 0

    for player in players:
        career = careers.get(player["id"])

        if not career:
            continue

        bad = [column for column in CAREER_COLUMNS if differs(column, player.get(column), career.get(column))]

        for column in bad:
            counts[column] += 1

        any_mismatch += bool(bad)

    print(f"-- {any_mismatch} of {len(players)} players; by stat: {counts}")


if __name__ == "__main__":
    main()
