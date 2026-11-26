"""Run from the repo root: python -m unittest discover -s scripts -p "test_*.py"

The --totals-only write path of import-player-season-stats.py, against an in-memory
stand-in for Supabase (nba_api is stubbed: CI doesn't install it).
"""

import importlib.util
import json
import sys
import types
import unittest
from pathlib import Path
from unittest import mock

from career_totals import TOTAL_COLUMNS, season_row_from_api

SCRIPTS = Path(__file__).parent

endpoints = types.ModuleType("nba_api.stats.endpoints")
endpoints.playercareerstats = types.SimpleNamespace()
endpoints.playerprofilev2 = types.SimpleNamespace()

with mock.patch.dict(
    sys.modules,
    {"nba_api": types.ModuleType("nba_api"), "nba_api.stats": types.ModuleType("nba_api.stats"), "nba_api.stats.endpoints": endpoints},
):
    spec = importlib.util.spec_from_file_location("import_player_season_stats", SCRIPTS / "import-player-season-stats.py")
    importer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(importer)

FIXTURE = json.loads((SCRIPTS / "fixtures" / "career_totals_fixtures.json").read_text(encoding="utf-8"))["players"]["Carmelo Anthony"]


class FakeQuery:
    def __init__(self, db, table):
        self.db, self.table, self.action, self.payload, self.filters = db, table, "select", None, {}

    def select(self, _columns):
        return self

    def eq(self, column, value):
        self.filters[column] = value
        return self

    def update(self, values):
        self.action, self.payload = "update", values
        return self

    def upsert(self, *_args, **_kwargs):
        raise AssertionError("totals-only must never upsert (that could insert rows)")

    def insert(self, *_args, **_kwargs):
        raise AssertionError("totals-only must never insert rows")

    def execute(self):
        if self.action == "update":
            self.db["updates"].append((self.filters, self.payload))
            return mock.Mock(data=[])

        rows = [row for row in self.db[self.table] if all(row.get(k) == v for k, v in self.filters.items())]
        return mock.Mock(data=rows)


class FakeSupabase:
    def __init__(self, db):
        self.db = db

    def table(self, name):
        return FakeQuery(self.db, name)


def api_rows():
    rows = (season_row_from_api(row, 7, FIXTURE["nba_id"], "2026-11-26T00:00:00+00:00") for row in FIXTURE["rows"])
    return [row for row in rows if row]


def existing_db(skip_season=None):
    # Existing rows (no totals yet), except one season the API has but the DB doesn't.
    rows = [
        {"id": index + 1, "nba_id": FIXTURE["nba_id"], "season": row["season"], "team": row["team"]}
        for index, row in enumerate(api_rows())
        if row["season"] != skip_season
    ]
    return {"player_season_stats": rows, "updates": []}


class TotalsOnlyTest(unittest.TestCase):
    def test_updates_only_the_total_columns_of_existing_rows_by_id(self):
        db = existing_db()
        rows = api_rows()

        updated, skipped_new = importer.write_totals_only(
            FakeSupabase(db), {"id": 7, "nba_id": FIXTURE["nba_id"]}, rows, dry_run=False
        )

        self.assertEqual((updated, skipped_new), (len(rows), 0))
        allowed = set(TOTAL_COLUMNS) | {"totals_imported_at"}

        for filters, payload in db["updates"]:
            self.assertEqual(list(filters), ["id"])
            self.assertEqual(set(payload), allowed)

        # Per-game and percentage columns are never sent.
        for column in ("ppg", "spg", "fg_percent", "three_percent", "games", "team"):
            self.assertTrue(all(column not in payload for _, payload in db["updates"]), column)

    def test_new_api_rows_are_skipped_not_inserted(self):
        db = existing_db(skip_season="2021-22")
        rows = api_rows()
        missing = sum(row["season"] == "2021-22" for row in rows)

        updated, skipped_new = importer.write_totals_only(
            FakeSupabase(db), {"id": 7, "nba_id": FIXTURE["nba_id"]}, rows, dry_run=False
        )

        self.assertEqual(skipped_new, missing)
        self.assertEqual(updated, len(rows) - missing)

    def test_dry_run_writes_nothing(self):
        db = existing_db()

        updated, _ = importer.write_totals_only(
            FakeSupabase(db), {"id": 7, "nba_id": FIXTURE["nba_id"]}, api_rows(), dry_run=True
        )

        self.assertGreater(updated, 0)
        self.assertEqual(db["updates"], [])


if __name__ == "__main__":
    unittest.main()
