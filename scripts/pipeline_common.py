"""Shared helpers for the StatCourt nba_api data pipelines.

Run the scripts from the repo root (they read .env.local there), e.g.
    python -u scripts/import-player-directory.py
"""

import os
from datetime import date
from pathlib import Path

# The NBA regular season starts in October, so October rolls the season over:
# 2026-09-30 is still 2025-26 and 2026-10-01 is 2026-27.
SEASON_ROLLOVER_MONTH = 10


def current_nba_season(today=None):
    """Season string like "2026-27" for the given date (default: today)."""
    today = today or date.today()
    start_year = today.year if today.month >= SEASON_ROLLOVER_MONTH else today.year - 1

    return format_season(start_year)


def format_season(start_year):
    return f"{start_year}-{str(start_year + 1)[-2:]}"


def season_start_year(season):
    return int(str(season).split("-")[0])


def recent_seasons(count, today=None):
    """The `count` most recent seasons, oldest first, ending with the current one."""
    current_start = season_start_year(current_nba_season(today))

    return [format_season(year) for year in range(current_start - count + 1, current_start + 1)]


def load_env_file(path=".env.local"):
    env_path = Path(path)

    if not env_path.exists():
        return

    for line in env_path.read_text().splitlines():
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key, value.strip().strip('"').strip("'"))


def get_service_supabase_client():
    """Supabase client for pipeline writes.

    The player tables are read-only for the anon key (scripts/supabase-rls-policies.sql),
    so writes need the server-only service role key. Never expose it to the browser.
    """
    from supabase import create_client

    load_env_file()

    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        raise ValueError(
            "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
        )

    return create_client(url, key)


def get_public_supabase_client():
    """Read-only Supabase client (the public anon key, like the app). RLS blocks anon
    writes to the player tables, so dry runs that use it can't change anything."""
    from supabase import create_client

    load_env_file()

    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not url or not key:
        raise ValueError("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")

    return create_client(url, key)


def configure_nba_session():
    """Route nba_api requests through a browser-like session (same as the other scripts)."""
    from curl_cffi import requests as cr
    from nba_api.stats.library.http import NBAStatsHTTP

    session = cr.Session(impersonate="chrome120")
    session.get("https://www.nba.com/stats/", timeout=20)
    NBAStatsHTTP.get_session = lambda self: session

    return session
