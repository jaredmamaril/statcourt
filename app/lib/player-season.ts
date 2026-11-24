import type { Player } from "../components/court-data";

// A player's "current" stat profile is their latest season (see
// scripts/calculate-player-stat-profiles.py). Retired players keep their final
// season there, so "active" means the latest season is the newest one in the data.
// The rankings page and the share cards both use these helpers.

type SeasonSource = Pick<Player, "statProfiles">;

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

export function isPlayerInLatestSeason(
  player: SeasonSource,
  latestSeasonStartYear: number | null,
) {
  const current = player.statProfiles?.current;

  if (latestSeasonStartYear === null || !current) return false;

  const games = current.games;
  const hasPlayedGames = games == null || games > 0;

  return (
    hasPlayedGames &&
    getSeasonStartYear(current.seasonLabel) === latestSeasonStartYear
  );
}

// Players whose latest season is the newest season in the data. Without any season
// data (the built-in fallback players) there is nothing to filter on, so the list is
// returned unchanged instead of emptied.
export function filterCurrentSeasonPlayers<T extends SeasonSource>(
  players: readonly T[],
): T[] {
  const latestSeasonStartYear = getLatestSeasonStartYear(players);

  if (latestSeasonStartYear === null) return [...players];

  return players.filter((player) =>
    isPlayerInLatestSeason(player, latestSeasonStartYear),
  );
}
