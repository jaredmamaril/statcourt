"""Run from the repo root: python -m unittest discover -s scripts -p "test_*.py"

Fixtures are real nba_api PlayerCareerStats (Totals) rows; expected careers are
Basketball Reference's regular-season career lines.
"""

import json
import unittest
from pathlib import Path

from career_totals import (
    build_player_profiles,
    combine_stats,
    consolidate_seasons,
    find_peak_profile,
    has_totals,
    player_career_columns,
    season_row_from_api,
)

FIXTURES = json.loads(
    (Path(__file__).parent / "fixtures" / "career_totals_fixtures.json").read_text(encoding="utf-8")
)["players"]
IMPORTED_AT = "2026-11-26T00:00:00+00:00"


def season_rows(name):
    fixture = FIXTURES[name]
    rows = (
        season_row_from_api(api_row, 1, fixture["nba_id"], IMPORTED_AT)
        for api_row in fixture["rows"]
    )

    return [row for row in rows if row]


def career(name):
    fixture = FIXTURES[name]

    return build_player_profiles({"id": 1, "nba_id": fixture["nba_id"]}, season_rows(name))["career"]


def line(profile):
    keys = ("games", "ppg", "rpg", "apg", "spg", "bpg", "fg_percent", "three_percent", "ft_percent")

    return tuple(profile[key] for key in keys)


class BasketballReferenceCareerTest(unittest.TestCase):
    def test_ac_green_percentages_come_from_career_totals(self):
        # 4544/9202 FG, 124/489 3P, 3119/4250 FT. Averaging season percentages by games
        # gave 49.0 / 16.6 / 71.9.
        self.assertEqual(line(career("A.C. Green")), (1278, 9.6, 7.4, 1.1, 0.8, 0.4, 49.4, 25.4, 73.4))

    def test_carmelo_anthony_traded_seasons(self):
        self.assertEqual(
            line(career("Carmelo Anthony")), (1260, 22.5, 6.2, 2.7, 1.0, 0.5, 44.7, 35.5, 81.4)
        )

    def test_alexander_volkov_short_career(self):
        self.assertEqual(
            line(career("Alexander Volkov")), (149, 6.8, 2.6, 2.2, 0.7, 0.3, 45.5, 33.3, 61.3)
        )


class UntrackedStatsTest(unittest.TestCase):
    def test_untracked_season_stats_are_none_not_zero(self):
        rows = {row["season"]: row for row in season_rows("Kareem Abdul-Jabbar")}
        rookie = rows["1969-70"]

        # Steals/blocks start in 1973-74 and threes in 1979-80.
        for column in ("stl", "blk", "fg3m", "fg3a", "spg", "bpg", "three_percent", "three_made_per_game"):
            self.assertIsNone(rookie[column], column)

        self.assertEqual((rookie["pts"], rookie["fgm"], rookie["fga"]), (2361, 938, 1810))
        self.assertEqual(rows["1973-74"]["stl"], 112)
        # 0 for 1 is a tracked 0%, not untracked.
        self.assertEqual((rows["1987-88"]["fg3m"], rows["1987-88"]["fg3a"]), (0, 1))
        self.assertEqual(rows["1987-88"]["three_percent"], 0.0)

    def test_kareem_per_game_counts_only_tracked_seasons(self):
        # Basketball Reference: 0.9 spg and 2.6 bpg (1,160 steals / 1,240 tracked games),
        # 1/18 threes. Counting the untracked seasons as zeros gave 0.7 / 2.0.
        self.assertEqual(
            line(career("Kareem Abdul-Jabbar")), (1560, 24.6, 11.2, 3.6, 0.9, 2.6, 55.9, 5.6, 72.1)
        )

    def test_wilt_chamberlain_never_tracked_steals_blocks_or_threes(self):
        profile = career("Wilt Chamberlain")

        self.assertEqual((profile["fg_percent"], profile["ft_percent"], profile["ppg"]), (54.0, 51.1, 30.1))
        self.assertIsNone(profile["spg"])
        self.assertIsNone(profile["bpg"])
        self.assertIsNone(profile["three_percent"])


class TradedSeasonTest(unittest.TestCase):
    def test_tot_row_replaces_the_team_rows(self):
        rows = season_rows("Carmelo Anthony")
        traded = [row for row in rows if row["season"] == "2010-11"]

        self.assertEqual(sorted(row["team"] for row in traded), ["DEN", "NYK", "TOT"])

        season = next(entry for entry in consolidate_seasons(rows) if entry["season"] == "2010-11")
        tot = next(row for row in traded if row["team"] == "TOT")

        self.assertEqual([row["team"] for row in season["rows"]], ["TOT"])
        self.assertEqual(season["games"], tot["games"])
        self.assertEqual(
            season["games"], sum(row["games"] for row in traded if row["team"] != "TOT")
        )

    def test_career_games_never_double_count_traded_seasons(self):
        rows = season_rows("Carmelo Anthony")
        team_and_tot_games = sum(row["games"] for row in rows)

        self.assertEqual(career("Carmelo Anthony")["games"], 1260)
        self.assertGreater(team_and_tot_games, 1260)


class CombineStatsTest(unittest.TestCase):
    def test_percentages_weight_by_attempts_not_games(self):
        rows = [
            {"games": 82, "fg3m": 0, "fg3a": 4},
            {"games": 82, "fg3m": 40, "fg3a": 100},
        ]

        # 40/104, not the games-weighted (0 + 40) / 2 = 20.
        self.assertEqual(combine_stats(rows)["three_percent"], 38.5)

    def test_no_attempts_is_none(self):
        self.assertIsNone(combine_stats([{"games": 10, "fg3m": 0, "fg3a": 0}])["three_percent"])

    def test_rounds_halves_up(self):
        # 1 steal in 4 games = 0.25 -> 0.3 (Python's round() would give 0.2).
        self.assertEqual(combine_stats([{"games": 4, "stl": 1}])["spg"], 0.3)


class ProfilesTest(unittest.TestCase):
    def test_current_profile_is_the_latest_season(self):
        fixture = FIXTURES["Kareem Abdul-Jabbar"]
        profiles = build_player_profiles({"id": 1, "nba_id": fixture["nba_id"]}, season_rows("Kareem Abdul-Jabbar"))

        self.assertEqual(profiles["current"]["season_label"], "1988-89")
        self.assertEqual(profiles["current"]["games"], 74)

    def test_peak_keeps_the_three_consecutive_season_rule(self):
        seasons = consolidate_seasons(season_rows("Kareem Abdul-Jabbar"))
        peak = find_peak_profile({"id": 1, "nba_id": 76003}, seasons)

        start, end = peak["season_label"].split(" to ")
        self.assertEqual(int(end[:4]) - int(start[:4]), 2)
        self.assertGreaterEqual(peak["games"], 120)

    def test_players_career_columns_match_the_career_profile(self):
        profile = career("A.C. Green")
        columns = player_career_columns(profile)

        self.assertEqual(set(columns), {"games", "ppg", "rpg", "apg", "spg", "bpg", "fg_percent", "three_percent", "ft_percent"})
        self.assertTrue(all(columns[key] == profile[key] for key in columns))

    def test_rows_without_games_are_skipped_and_marked_imported(self):
        self.assertIsNone(season_row_from_api({"GP": 0, "SEASON_ID": "2020-21"}, 1, 1, IMPORTED_AT))
        self.assertTrue(has_totals(season_rows("A.C. Green")[0]))
        self.assertFalse(has_totals({"season": "2020-21"}))


if __name__ == "__main__":
    unittest.main()
