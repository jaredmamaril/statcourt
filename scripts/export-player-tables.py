"""Back up players, player_season_stats and player_stat_profiles to local JSON before
the issue #37 migration and backfill. Read-only: it never writes to the database.

    $env:PYTHONIOENCODING="utf-8"
    python -u scripts/export-player-tables.py

Writes backups/<UTC timestamp>/<table>.json (every column, every row, ordered by id)
plus manifest.json with row counts. backups/ is gitignored; the files hold only public
basketball data, never keys.
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from pipeline_common import get_service_supabase_client

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

TABLES = ("players", "player_season_stats", "player_stat_profiles")


def fetch_table(supabase, table, page_size=1000):
    rows, start = [], 0

    while True:
        page = (
            supabase.table(table).select("*").order("id").range(start, start + page_size - 1).execute().data
            or []
        )
        rows.extend(page)
        print(f"-- {table}: {len(rows)} rows", end="\r", flush=True)

        if len(page) < page_size:
            print()
            return rows

        start += page_size


def main():
    supabase = get_service_supabase_client()
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    folder = Path("backups") / f"player-tables-{stamp}"
    folder.mkdir(parents=True, exist_ok=False)
    manifest = {"exported_at": stamp, "tables": {}}

    for table in TABLES:
        rows = fetch_table(supabase, table)
        path = folder / f"{table}.json"
        path.write_text(json.dumps(rows, ensure_ascii=False), encoding="utf-8")
        manifest["tables"][table] = {"rows": len(rows), "file": path.name, "bytes": path.stat().st_size}

    (folder / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"-- Backup written to {folder.resolve()}")
    print(json.dumps(manifest["tables"], indent=2))


if __name__ == "__main__":
    main()
