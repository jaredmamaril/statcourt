"""Refresh public.player_directory from nba_api CommonAllPlayers.

ROSTERSTATUS is relative to the season requested, so this always asks for the
current season (derived from today's date). Writes directly to Supabase with the
service role key from .env.local.

    python -u scripts/import-player-directory.py
"""

import math
import sys
from datetime import datetime, timezone

from nba_api.stats.endpoints import commonallplayers

from pipeline_common import (
    configure_nba_session,
    current_nba_season,
    get_service_supabase_client,
)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BATCH_SIZE = 500


def clean_text(value):
    if value is None:
        return None

    if isinstance(value, float) and math.isnan(value):
        return None

    text = str(value).strip()

    return None if text == "" or text.lower() == "nan" else text


def clean_int(value):
    text = clean_text(value)

    if text is None:
        return None

    try:
        return int(float(text))
    except ValueError:
        return None


def fetch_directory_rows(season):
    all_players = commonallplayers.CommonAllPlayers(
        is_only_current_season=0,
        league_id="00",
        season=season,
        timeout=60,
    )
    frame = all_players.common_all_players.get_data_frame()
    imported_at = datetime.now(timezone.utc).isoformat()

    rows = []

    for _, row in frame.iterrows():
        nba_id = clean_int(row["PERSON_ID"])

        if nba_id is None:
            continue

        rows.append(
            {
                "nba_id": nba_id,
                "name": clean_text(row["DISPLAY_FIRST_LAST"]),
                "from_year": clean_int(row["FROM_YEAR"]),
                "to_year": clean_int(row["TO_YEAR"]),
                # Stored as text "1" (on an active roster) or "0", as before.
                "roster_status": clean_text(clean_int(row["ROSTERSTATUS"])),
                "team": clean_text(row["TEAM_ABBREVIATION"]),
                "player_code": clean_text(row["PLAYERCODE"]),
                "imported_at": imported_at,
            }
        )

    return rows


def main():
    season = current_nba_season()
    configure_nba_session()
    rows = fetch_directory_rows(season)
    active = sum(1 for row in rows if row["roster_status"] == "1")

    print(f"-- Fetched {len(rows)} players for {season} ({active} on active rosters)")

    supabase = get_service_supabase_client()

    for start in range(0, len(rows), BATCH_SIZE):
        batch = rows[start:start + BATCH_SIZE]
        supabase.table("player_directory").upsert(batch, on_conflict="nba_id").execute()
        print(f"-- Upserted {start + len(batch)}/{len(rows)}")

    print("-- Done.")


if __name__ == "__main__":
    main()
