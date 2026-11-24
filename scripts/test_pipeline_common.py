"""Run from the repo root: python -m unittest discover -s scripts -p "test_*.py" """

import unittest
from datetime import date

from pipeline_common import current_nba_season, format_season, recent_seasons


class CurrentNbaSeasonTest(unittest.TestCase):
    def test_september_is_still_the_previous_season(self):
        self.assertEqual(current_nba_season(date(2026, 9, 30)), "2025-26")

    def test_october_starts_the_new_season(self):
        self.assertEqual(current_nba_season(date(2026, 10, 1)), "2026-27")
        self.assertEqual(current_nba_season(date(2026, 11, 24)), "2026-27")

    def test_calendar_year_boundary_stays_in_the_same_season(self):
        self.assertEqual(current_nba_season(date(2026, 12, 31)), "2026-27")
        self.assertEqual(current_nba_season(date(2027, 1, 1)), "2026-27")
        self.assertEqual(current_nba_season(date(2027, 6, 30)), "2026-27")

    def test_century_rollover_formatting(self):
        self.assertEqual(format_season(1999), "1999-00")
        self.assertEqual(current_nba_season(date(2099, 10, 15)), "2099-00")

    def test_recent_seasons_end_with_the_current_season(self):
        self.assertEqual(
            recent_seasons(3, date(2026, 11, 24)),
            ["2024-25", "2025-26", "2026-27"],
        )


if __name__ == "__main__":
    unittest.main()
