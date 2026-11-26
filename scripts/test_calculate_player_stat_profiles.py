"""Run from the repo root: python -m unittest discover -s scripts -p "test_*.py"

calculate-player-stat-profiles.py against an in-memory stand-in for Supabase.
"""

import importlib.util
import io
import json
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest import mock

from career_totals import season_row_from_api

SCRIPTS = Path(__file__).parent
spec = importlib.util.spec_from_file_location(
    "calculate_player_stat_profiles", SCRIPTS / "calculate-player-stat-profiles.py"
)
calculate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(calculate)

FIXTURES = json.loads((SCRIPTS / "fixtures" / "career_totals_fixtures.json").read_text(encoding="utf-8"))["players"]


class FakeQuery:
    def __init__(self, db, table):
        self.db, self.table, self.action, self.payload, self.filters = db, table, "select", None, []

    def select(self, _columns):
        return self

    def order(self, _column):
        return self

    def range(self, start, end):
        self.slice = (start, end + 1)
        return self

    def upsert(self, rows, on_conflict):
        self.action, self.payload = "upsert", rows
        return self

    def update(self, values):
        self.action, self.payload = "update", values
        return self

    def eq(self, column, value):
        self.filters.append((column, value))
        return self

    def execute(self):
        if self.action == "select":
            start, end = getattr(self, "slice", (0, None))
            return mock.Mock(data=self.db[self.table][start:end])

        self.db["writes"].append((self.table, self.action, self.payload, self.filters))
        return mock.Mock(data=[])


class FakeSupabase:
    def __init__(self, db):
        self.db = db

    def table(self, name):
        return FakeQuery(self.db, name)


def make_db():
    green = FIXTURES["A.C. Green"]
    green_rows = [
        row
        for row in (season_row_from_api(api, 1, green["nba_id"], "2026-11-26T00:00:00+00:00") for api in green["rows"])
        if row
    ]
    for index, row in enumerate(green_rows):
        row["id"] = index + 1

    return {
        "players": [
            # Old players row: averaged / stale values that must be replaced.
            {"id": 1, "nba_id": green["nba_id"], "name": "A.C. Green", "games": 1278, "ppg": 9.6, "rpg": 7.4,
             "apg": 1.1, "spg": 0.8, "bpg": 0.4, "fg_percent": 49.0, "three_percent": 16.6, "ft_percent": 71.9},
            # Not backfilled yet: keeps everything.
            {"id": 2, "nba_id": 999, "name": "Old Rows", "games": 10, "ppg": 5.0, "rpg": 1.0, "apg": 1.0,
             "spg": 0.0, "bpg": 0.0, "fg_percent": 40.0, "three_percent": 30.0, "ft_percent": 70.0},
        ],
        "player_season_stats": green_rows
        + [{"id": 100, "player_id": 2, "nba_id": 999, "season": "2001-02", "team": "BOS", "games": 10,
            "totals_imported_at": None}],
        "writes": [],
    }


def run(db, *argv):
    with mock.patch.object(calculate, "get_service_supabase_client", return_value=FakeSupabase(db)):
        with redirect_stdout(io.StringIO()) as output:
            calculate.calculate_profiles(calculate.parse_args(list(argv)))

    return output.getvalue()


class CalculateProfilesTest(unittest.TestCase):
    def test_writes_the_same_career_line_to_profiles_and_players(self):
        db = make_db()
        run(db)

        profiles = [payload for table, action, payload, _ in db["writes"] if table == "player_stat_profiles"]
        career = next(row for batch in profiles for row in batch if row["profile_type"] == "career")
        updates = [(payload, filters) for table, action, payload, filters in db["writes"] if table == "players"]

        self.assertEqual(
            (career["fg_percent"], career["three_percent"], career["ft_percent"]), (49.4, 25.4, 73.4)
        )
        self.assertEqual(updates, [({"fg_percent": 49.4, "three_percent": 25.4, "ft_percent": 73.4}, [("id", 1)])])
        self.assertEqual(
            sorted(row["profile_type"] for batch in profiles for row in batch), ["career", "current", "peak"]
        )

    def test_players_without_totals_are_left_unchanged(self):
        db = make_db()
        output = run(db)

        written_ids = {row["nba_id"] for _, _, payload, _ in db["writes"] if isinstance(payload, list) for row in payload}
        self.assertNotIn(999, written_ids)
        self.assertIn("1 not backfilled yet", output)

    def test_dry_run_writes_nothing(self):
        db = make_db()
        output = run(db, "--dry-run")

        self.assertEqual(db["writes"], [])
        self.assertIn("1 players' career columns change", output)


if __name__ == "__main__":
    unittest.main()
