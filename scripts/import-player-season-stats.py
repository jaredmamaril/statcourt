import sys
import time
import random
import math

from nba_api.stats.endpoints import playercareerstats, playerprofilev2

from pipeline_common import (
    configure_nba_session,
    current_nba_season,
    format_season,
    get_service_supabase_client,
    season_start_year,
)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

configure_nba_session()


ONLY_IMPORT = set()
IMPORT_LIMIT = 1000
START_AFTER = ""
REFRESH_EXISTING = False
# --active refreshes every player on an active roster (player_directory.roster_status
# = "1") or with a season row in the current or previous season, even if they
# already have rows. Use it for in-season updates; run import-player-directory.py first.
REFRESH_ACTIVE = "--active" in sys.argv
#$env:PYTHONIOENCODING="utf-8"
#python -u scripts/import-player-season-stats.py --active > scripts/player-season-stats-output.txt


def get_supabase_client():
    return get_service_supabase_client()


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


def json_safe_number(value, fallback=None):
    if value is None:
        return fallback

    try:
        number = float(value)
    except (TypeError, ValueError):
        return fallback

    if not math.isfinite(number):
        return fallback

    return number


def json_safe_text(value, fallback=None):
    if value is None:
        return fallback

    try:
        if value != value:
            return fallback
    except TypeError:
        pass

    text = str(value).strip()

    if text.lower() in {"", "nan", "none", "null"}:
        return fallback

    return text


def json_safe_int(value, fallback=None):
    number = json_safe_number(value, fallback=None)

    if number is None:
        return fallback

    return int(number)


def safe_round(value, digits=1, fallback=None):
    number = json_safe_number(value, fallback=None)

    if number is None:
        return fallback

    return round(number, digits)


def safe_per_game(total, games, fallback=None):
    total_number = json_safe_number(total, fallback=None)
    games_number = json_safe_number(games, fallback=None)

    if total_number is None or games_number is None or games_number <= 0:
        return fallback

    return safe_round(total_number / games_number, 1, fallback)


def safe_percent(made, attempted, fallback=None):
    made_number = json_safe_number(made, fallback=None)
    attempted_number = json_safe_number(attempted, fallback=None)

    if made_number is None or attempted_number is None or attempted_number <= 0:
        return fallback

    return safe_round((made_number / attempted_number) * 100, 1, fallback)


def safe_number(value, fallback=None):
    if value is None:
        return fallback

    try:
        number = float(value)
    except (TypeError, ValueError):
        return fallback

    if not math.isfinite(number):
        return fallback

    return number


def safe_int(value, fallback=None):
    if value is None:
        return fallback

    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def get_existing_nba_ids(supabase):
    existing_nba_ids = set()
    page_size = 1000
    start = 0

    while True:
        response = (
            supabase.table("player_season_stats")
            .select("nba_id")
            .range(start, start + page_size - 1)
            .execute()
        )

        rows = response.data or []

        if not rows:
            break

        for row in rows:
            nba_id = row.get("nba_id")
            if nba_id is not None:
                existing_nba_ids.add(nba_id)

        if len(rows) < page_size:
            break

        start += page_size

    return existing_nba_ids


def fetch_all(query_fn, page_size=1000):
    rows = []
    start = 0

    while True:
        page = query_fn().range(start, start + page_size - 1).execute().data or []
        rows.extend(page)

        if len(page) < page_size:
            return rows

        start += page_size


def get_active_players_to_import(supabase):
    current = current_nba_season()
    previous = format_season(season_start_year(current) - 1)

    roster_ids = {
        row["nba_id"]
        for row in fetch_all(
            lambda: supabase.table("player_directory")
            .select("nba_id")
            .eq("roster_status", "1")
        )
    }
    recent_ids = {
        row["nba_id"]
        for row in fetch_all(
            lambda: supabase.table("player_season_stats")
            .select("nba_id")
            .in_("season", [previous, current])
        )
    }
    wanted_ids = roster_ids | recent_ids
    players = fetch_all(
        lambda: supabase.table("players")
        .select("id, nba_id, name")
        .not_.is_("nba_id", "null")
        .order("name")
    )

    print(
        f"-- Active refresh for {current}: {len(roster_ids)} on active rosters, "
        f"{len(recent_ids)} with {previous} or {current} rows"
    )

    return [player for player in players if player["nba_id"] in wanted_ids]


def get_players_to_import():
    supabase = get_supabase_client()

    if REFRESH_ACTIVE:
        return get_active_players_to_import(supabase)

    if ONLY_IMPORT:
        response = (
            supabase.table("players")
            .select("id, nba_id, name")
            .not_.is_("nba_id", "null")
            .in_("name", list(ONLY_IMPORT))
            .order("name")
            .execute()
        )

        return response.data

    existing_nba_ids = set() if REFRESH_EXISTING else get_existing_nba_ids(supabase)

    rows_to_import = []
    page_size = 1000
    start = 0

    while len(rows_to_import) < IMPORT_LIMIT:
        query = (
            supabase.table("players")
            .select("id, nba_id, name")
            .not_.is_("nba_id", "null")
            .order("name")
            .range(start, start + page_size - 1)
        )

        if START_AFTER:
            query = query.gt("name", START_AFTER)

        response = query.execute()
        rows = response.data or []

        if not rows:
            break

        for row in rows:
            if row["nba_id"] not in existing_nba_ids:
                rows_to_import.append(row)

                if len(rows_to_import) >= IMPORT_LIMIT:
                    break

        if len(rows) < page_size:
            break

        start += page_size

    return rows_to_import


def get_season_dataframe(player):
    nba_id = player["nba_id"]
    name = player["name"]

    career = run_nba_request(
        f"career stats for {name}",
        lambda: playercareerstats.PlayerCareerStats(
            player_id=nba_id,
            timeout=30,
        ),
    )

    data_frames = career.get_data_frames()

    if data_frames:
        season_df = data_frames[0]

        if not season_df.empty:
            print(f"-- Using PlayerCareerStats for {name}")
            return season_df

    print(f"-- PlayerCareerStats empty for {name}, trying PlayerProfileV2")

    profile = run_nba_request(
        f"profile stats for {name}",
        lambda: playerprofilev2.PlayerProfileV2(
            player_id=nba_id,
            timeout=30,
        ),
    )

    profile_frames = profile.get_data_frames()

    for frame in profile_frames:
        required_columns = {
            "SEASON_ID",
            "TEAM_ABBREVIATION",
            "GP",
            "PTS",
            "REB",
            "AST",
        }

        if required_columns.issubset(set(frame.columns)) and not frame.empty:
            print(f"-- Using PlayerProfileV2 fallback for {name}")
            return frame

    return None


def get_player_season_rows(player):
    nba_id = player["nba_id"]
    print(f"-- NBA ID for {player['name']}: {nba_id}")

    season_df = get_season_dataframe(player)

    if season_df is None or season_df.empty:
        return []

    rows = []

    for _, row in season_df.iterrows():
        games = json_safe_int(row.get("GP"), 0)

        if games <= 0:
            continue

        minutes = safe_number(row.get("MIN"), 0)
        points = safe_number(row.get("PTS"), 0)
        rebounds = safe_number(row.get("REB"), 0)
        assists = safe_number(row.get("AST"), 0)
        steals = safe_number(row.get("STL"), 0)
        blocks = safe_number(row.get("BLK"), 0)

        fgm = safe_number(row.get("FGM"), 0)
        fga = safe_number(row.get("FGA"), 0)
        fg3m = safe_number(row.get("FG3M"), 0)
        fg3a = safe_number(row.get("FG3A"), 0)
        ftm = safe_number(row.get("FTM"), 0)
        fta = safe_number(row.get("FTA"), 0)

        rows.append(
            {
                "player_id": player["id"],
                "nba_id": nba_id,
                "season": json_safe_text(row.get("SEASON_ID")),
                "team_id": json_safe_int(row.get("TEAM_ID")),
                "team": json_safe_text(row.get("TEAM_ABBREVIATION"), "TOT"),
                "games": games,
                "minutes_per_game": safe_per_game(minutes, games),
                "ppg": safe_per_game(points, games),
                "rpg": safe_per_game(rebounds, games),
                "apg": safe_per_game(assists, games),
                "spg": safe_per_game(steals, games),
                "bpg": safe_per_game(blocks, games),
                "fg_percent": safe_percent(fgm, fga),
                "three_percent": safe_percent(fg3m, fg3a),
                "ft_percent": safe_percent(ftm, fta),
                "three_made_per_game": safe_per_game(fg3m, games),
                "three_attempts_per_game": safe_per_game(fg3a, games),
                "free_throw_attempts_per_game": safe_per_game(fta, games),
            }
        )

    return rows


def import_player_season_stats():
    supabase = get_supabase_client()
    players = get_players_to_import()

    print(f"-- Found {len(players)} players to import season stats for")

    total_rows = 0

    for index, player in enumerate(players, start=1):
        name = player["name"]

        try:
            print(f"-- [{index}/{len(players)}] Importing season stats for {name}")

            season_rows = get_player_season_rows(player)

            if not season_rows:
                print(f"-- Skipped {name}: no season rows found")
                continue

            response = (
                supabase.table("player_season_stats")
                .upsert(
                    season_rows,
                    on_conflict="nba_id,season,team",
                )
                .execute()
            )

            if not response.data:
                print(f"-- Warning: no returned data for {name}")

            total_rows += len(season_rows)

            print(f"-- Imported {len(season_rows)} season rows for {name}")

        except Exception as error:
            print(f"-- Skipped {name}: {error}")

    print(f"-- Done. Imported/updated {total_rows} total season rows.")


if __name__ == "__main__":
    import_player_season_stats()
