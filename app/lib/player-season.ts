import type { Player } from "../components/court-data";

// One "active player" rule for Current-mode rankings and the share cards.
//
// 1. Roster first: player_directory.roster_status ("1" = on an active NBA roster),
//    refreshed by scripts/import-player-directory.py. This keeps injured players who
//    haven't played yet this season, and drops players who were waived or retired.
// 2. Games fallback: when a player's roster status is missing or stale, they count
//    as active if they played games in the newest season in the data. A player's
//    "current" stat profile is their latest season (see
//    scripts/calculate-player-stat-profiles.py), so retired players keep their final
//    season there and drop out.

type SeasonSource = Pick<
  Player,
  "statProfiles" | "rosterStatus" | "rosterStatusImportedAt"
>;

// The NBA season rolls over in October (2026-10-01 starts 2026-27). Keep in sync
// with scripts/pipeline_common.py.
const SEASON_ROLLOVER_MONTH_INDEX = 9;
// A roster snapshot older than this is treated as stale.
const MAX_ROSTER_STATUS_AGE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export function getNbaSeasonStartYear(date: Date) {
  const year = date.getUTCFullYear();

  return date.getUTCMonth() >= SEASON_ROLLOVER_MONTH_INDEX ? year : year - 1;
}

export function formatSeason(startYear: number) {
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

export function getCurrentNbaSeason(date: Date = new Date()) {
  return formatSeason(getNbaSeasonStartYear(date));
}

export function getSeasonStartYear(seasonLabel: string | null | undefined) {
  const match = seasonLabel?.match(/^(\d{4})/);

  return match ? Number(match[1]) : null;
}

export function getCurrentSeasonStartYear(player: SeasonSource) {
  return getSeasonStartYear(player.statProfiles?.current?.seasonLabel);
}

// Start year of the newest season any player has, or null when no player has one.
export function getLatestSeasonStartYear(players: readonly SeasonSource[]) {
  let latest: number | null = null;

  for (const player of players) {
    const start = getCurrentSeasonStartYear(player);

    if (start !== null && (latest === null || start > latest)) {
      latest = start;
    }
  }

  return latest;
}

// Newest season in the data, e.g. "2026-27", for labels. Null without season data.
export function getLatestSeasonLabel(players: readonly SeasonSource[]) {
  const latest = getLatestSeasonStartYear(players);

  return latest === null ? null : formatSeason(latest);
}

// Roster status counts only if it was imported during the current NBA season and
// recently enough; otherwise it's stale and the games rule decides.
export function hasFreshRosterStatus(player: SeasonSource, now: Date = new Date()) {
  if (!player.rosterStatus || !player.rosterStatusImportedAt) return false;

  const importedAt = new Date(player.rosterStatusImportedAt);

  if (Number.isNaN(importedAt.getTime())) return false;

  const seasonStart = Date.UTC(
    getNbaSeasonStartYear(now),
    SEASON_ROLLOVER_MONTH_INDEX,
    1,
  );

  return (
    importedAt.getTime() >= seasonStart &&
    now.getTime() - importedAt.getTime() <= MAX_ROSTER_STATUS_AGE_DAYS * DAY_MS
  );
}

function playedInSeason(player: SeasonSource, seasonStartYear: number | null) {
  const current = player.statProfiles?.current;

  if (seasonStartYear === null || !current) return false;

  const games = current.games;
  const hasPlayedGames = games == null || games > 0;

  return (
    hasPlayedGames && getSeasonStartYear(current.seasonLabel) === seasonStartYear
  );
}

export function isPlayerActive(
  player: SeasonSource,
  latestSeasonStartYear: number | null,
  now: Date = new Date(),
) {
  if (hasFreshRosterStatus(player, now)) {
    return player.rosterStatus === "active";
  }

  return playedInSeason(player, latestSeasonStartYear);
}

// Active players for Current mode. Without any roster or season data (the built-in
// fallback players) there is nothing to go on, so the list is returned unchanged.
export function filterCurrentSeasonPlayers<T extends SeasonSource>(
  players: readonly T[],
  now: Date = new Date(),
): T[] {
  const latestSeasonStartYear = getLatestSeasonStartYear(players);
  const hasRosterData = players.some((player) =>
    hasFreshRosterStatus(player, now),
  );

  if (latestSeasonStartYear === null && !hasRosterData) return [...players];

  return players.filter((player) =>
    isPlayerActive(player, latestSeasonStartYear, now),
  );
}
