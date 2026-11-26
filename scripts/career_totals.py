"""Season and career stats from made/attempted totals (issue #37).

One calculation for every stat profile (career, peak, current) and for the players
table's career columns:

- Percentages are total made / total attempted (never an average of season
  percentages), e.g. A.C. Green 3P% = 124 / 489 = 25.4.
- Per-game stats are the total / games, counting only the seasons where that stat was
  tracked, like Basketball Reference (steals and blocks start in 1973-74, threes in
  1979-80): Kareem's 1,160 steals over his 1,240 tracked games are 0.9 per game.
- A stat that was never tracked is None (shown as "—"), not 0.
- A traded season uses its "TOT" row (the season total across teams), never the team
  rows on top of it, so nothing is counted twice.

No network or database imports here, so the CI unit tests can run it.
"""

import math
from collections import defaultdict
from decimal import ROUND_HALF_UP, Decimal

# player_season_stats total column -> nba_api PlayerCareerStats (Totals) column.
TOTAL_COLUMNS = {
    "minutes": "MIN",
    "pts": "PTS",
    "reb": "REB",
    "ast": "AST",
    "stl": "STL",
    "blk": "BLK",
    "fgm": "FGM",
    "fga": "FGA",
    "fg3m": "FG3M",
    "fg3a": "FG3A",
    "ftm": "FTM",
    "fta": "FTA",
}

# Per-game column -> total column it comes from.
PER_GAME_COLUMNS = {
    "minutes_per_game": "minutes",
    "ppg": "pts",
    "rpg": "reb",
    "apg": "ast",
    "spg": "stl",
    "bpg": "blk",
    "three_made_per_game": "fg3m",
    "three_attempts_per_game": "fg3a",
    "free_throw_attempts_per_game": "fta",
}

# Percentage column -> (made, attempted) total columns.
PERCENT_COLUMNS = {
    "fg_percent": ("fgm", "fga"),
    "three_percent": ("fg3m", "fg3a"),
    "ft_percent": ("ftm", "fta"),
}

# The players table's career columns (written from the career profile).
PLAYER_CAREER_COLUMNS = (
    "games",
    "ppg",
    "rpg",
    "apg",
    "spg",
    "bpg",
    "fg_percent",
    "three_percent",
    "ft_percent",
)


def api_number(value):
    """A finite number from the NBA API, or None for missing / NaN (untracked)."""
    if value is None:
        return None

    try:
        number = float(value)
    except (TypeError, ValueError):
        return None

    return number if math.isfinite(number) else None


def round_stat(value):
    """One decimal, rounding halves up (25.35 -> 25.4) like box scores do."""
    if value is None:
        return None

    return float(Decimal(str(value)).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))


def season_start_year(season):
    try:
        return int(str(season).split("-")[0])
    except (TypeError, ValueError):
        return 0


def _text(value, fallback=None):
    if value is None or (isinstance(value, float) and not math.isfinite(value)):
        return fallback

    text = str(value).strip()

    return fallback if text.lower() in {"", "nan", "none", "null"} else text


def _int(value):
    number = api_number(value)

    return None if number is None else int(number)


def combine_stats(rows):
    """Per-game and percentage stats for a set of season rows with totals.

    Each total only counts rows where it was tracked, and its per-game value divides
    by the games of those rows.
    """
    games = sum(row.get("games") or 0 for row in rows)
    totals = {}
    tracked_games = {}

    for column in TOTAL_COLUMNS:
        tracked = [row for row in rows if row.get(column) is not None]
        totals[column] = sum(row[column] for row in tracked) if tracked else None
        tracked_games[column] = sum(row.get("games") or 0 for row in tracked)

    stats = {"games": games}

    for column, total_column in PER_GAME_COLUMNS.items():
        total = totals[total_column]
        denominator = tracked_games[total_column]
        stats[column] = round_stat(total / denominator) if total is not None and denominator > 0 else None

    for column, (made_column, attempted_column) in PERCENT_COLUMNS.items():
        tracked = [
            row
            for row in rows
            if row.get(made_column) is not None and row.get(attempted_column) is not None
        ]
        made = sum(row[made_column] for row in tracked)
        attempted = sum(row[attempted_column] for row in tracked)
        stats[column] = round_stat(made / attempted * 100) if attempted > 0 else None

    return stats


def season_row_from_api(api_row, player_id, nba_id, totals_imported_at):
    """A player_season_stats row (per-game, percentages and totals) from one
    PlayerCareerStats Totals row. Returns None for rows without games."""
    games = _int(api_row.get("GP")) or 0

    if games <= 0:
        return None

    row = {
        "player_id": player_id,
        "nba_id": nba_id,
        "season": _text(api_row.get("SEASON_ID")),
        "team_id": _int(api_row.get("TEAM_ID")),
        "team": _text(api_row.get("TEAM_ABBREVIATION"), "TOT"),
        "games": games,
    }

    for column, api_column in TOTAL_COLUMNS.items():
        value = api_number(api_row.get(api_column))
        # Counting stats are whole numbers; keep minutes as given.
        row[column] = value if column == "minutes" or value is None else int(value)

    stats = combine_stats([row])
    stats.pop("games")
    row.update(stats)
    row["totals_imported_at"] = totals_imported_at

    return row


def has_totals(row):
    """Season rows written by the totals import (older rows only have per-game stats)."""
    return row.get("totals_imported_at") is not None


def consolidate_seasons(rows):
    """One entry per season, oldest first: the TOT row for a traded season (never the
    team rows as well), otherwise that season's team row(s)."""
    by_season = defaultdict(list)

    for row in rows:
        if row.get("season"):
            by_season[row["season"]].append(row)

    seasons = []

    for season, season_rows in by_season.items():
        total_rows = [row for row in season_rows if row.get("team") == "TOT"]
        chosen = total_rows[:1] if total_rows else season_rows
        games = sum(row.get("games") or 0 for row in chosen)

        if games > 0:
            seasons.append(
                {
                    "season": season,
                    "season_year": season_start_year(season),
                    "games": games,
                    "rows": chosen,
                }
            )

    return sorted(seasons, key=lambda entry: entry["season_year"])


def build_profile(player, seasons, profile_type, season_label):
    """A player_stat_profiles row for a list of consolidated seasons."""
    rows = [row for season in seasons for row in season["rows"]]
    stats = combine_stats(rows)

    return {
        "player_id": player["id"],
        "nba_id": player["nba_id"],
        "profile_type": profile_type,
        "season_label": season_label,
        **stats,
    }


def player_career_columns(career_profile):
    """The players table's career columns, from the career profile (one source)."""
    return {column: career_profile.get(column) for column in PLAYER_CAREER_COLUMNS}


# Stored peak: unchanged rules (best 3 consecutive seasons with 120+ games, else 2
# with 90+, else 1 with 50+, by peak_score); only the stats now come from totals.
def peak_score(profile):
    def value(column):
        return profile.get(column) or 0

    return (
        value("ppg") * 1.0
        + value("rpg") * 0.45
        + value("apg") * 0.65
        + value("spg") * 1.25
        + value("bpg") * 1.15
        + value("fg_percent") * 0.08
        + value("three_percent") * 0.04
        + value("ft_percent") * 0.03
    )


def find_peak_profile(player, seasons):
    if not seasons:
        return None

    best_profile = None
    best_score = -1

    for index in range(len(seasons)):
        window = seasons[index:index + 3]
        years = [season["season_year"] for season in window]
        is_consecutive = all(years[i + 1] - years[i] == 1 for i in range(len(years) - 1))
        total_games = sum(season["games"] for season in window)

        if len(window) == 3 and (not is_consecutive or total_games < 120):
            continue
        if len(window) == 2 and total_games < 90:
            continue
        if len(window) == 1 and total_games < 50:
            continue

        start, end = window[0]["season"], window[-1]["season"]
        profile = build_profile(
            player, window, "peak", start if start == end else f"{start} to {end}"
        )
        score = peak_score(profile)

        if score > best_score:
            best_score = score
            best_profile = profile

    if best_profile:
        return best_profile

    best_single = max(
        seasons, key=lambda season: peak_score(combine_stats(season["rows"]))
    )

    return build_profile(player, [best_single], "peak", best_single["season"])


def build_player_profiles(player, season_rows):
    """Career, peak and current profiles for one player, or None without seasons."""
    seasons = consolidate_seasons(season_rows)

    if not seasons:
        return None

    latest = seasons[-1]

    return {
        "career": build_profile(player, seasons, "career", "Career"),
        "peak": find_peak_profile(player, seasons),
        "current": build_profile(player, [latest], "current", latest["season"]),
    }
