import type { Player, PlayerStatProfile } from "../components/court-data";
import { getPlayerRating } from "../components/player-ratings";
import { getSeasonStartYear } from "./player-season";

// Peak = the player's best two consecutive qualifying seasons (method credited to
// Nick Restifo). Rankings, player pages, share cards, OG images and meta descriptions
// all read the peak profile this module builds, so they always show the same numbers.
//
// - Seasons come from player_season_stats. A traded player's season uses the combined
//   "TOT" row, not each team's partial stats.
// - A season qualifies with at least 50% of that season's most team games (41 of 82).
//   The newest season is still in progress, so it uses the Current Season rule instead:
//   25% of the most team games so far, rounded up, at least 1.
// - At most one season may sit between the two (missed, or below the minimum): the pair
//   is two qualifying seasons next to each other among the player's qualifying seasons,
//   at most two years apart. Bigger gaps don't pair.
// - The two seasons are combined with games-weighted averages.
// - The best pair is the one with the highest Peak overall rating, the same rating the
//   rankings use. Players with fewer than two qualifying seasons have no peak.

export const PEAK_SEASON_COUNT = 2;
// Back-to-back seasons are 1 year apart; one skipped season makes it 2.
const MAX_PEAK_SEASON_GAP_YEARS = 2;

export const PEAK_RULE_TEXT =
  "Peak = best 2 consecutive qualifying seasons (one missed season allowed).";
const COMPLETED_SEASON_MIN_GAMES_SHARE = 0.5;
const CURRENT_SEASON_MIN_GAMES_SHARE = 0.25;

export type SeasonStatRow = {
  season: string;
  team: string | null;
  games: number | null;
  minutesPerGame?: number | null;
  ppg?: number | null;
  rpg?: number | null;
  apg?: number | null;
  spg?: number | null;
  bpg?: number | null;
  fgPercent?: number | null;
  threePercent?: number | null;
  ftPercent?: number | null;
  threeMadePerGame?: number | null;
  threeAttemptsPerGame?: number | null;
  freeThrowAttemptsPerGame?: number | null;
};

type StatKey = Exclude<keyof SeasonStatRow, "season" | "team" | "games">;

const STAT_KEYS: StatKey[] = [
  "minutesPerGame",
  "ppg",
  "rpg",
  "apg",
  "spg",
  "bpg",
  "fgPercent",
  "threePercent",
  "ftPercent",
  "threeMadePerGame",
  "threeAttemptsPerGame",
  "freeThrowAttemptsPerGame",
];

export type PlayerSeason = Omit<SeasonStatRow, "team"> & {
  startYear: number;
  games: number;
};

export type PeakContext = {
  // Most games any team played in each season (longest single-team stint).
  maxTeamGamesBySeason: ReadonlyMap<string, number>;
  // The newest season in the data, which is still in progress.
  currentSeason: string | null;
};

function toNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

type StatRow = Partial<Record<StatKey, number | null>> & { games: number | null };

// Games-weighted average of one stat across rows; null when no row has it.
function weightedAverage(rows: readonly StatRow[], key: StatKey) {
  let totalGames = 0;
  let total = 0;

  for (const row of rows) {
    const games = toNumber(row.games) ?? 0;
    const value = toNumber(row[key]);

    if (games <= 0 || value === null) continue;

    totalGames += games;
    total += value * games;
  }

  return totalGames > 0 ? round1(total / totalGames) : null;
}

function combineRows(rows: readonly StatRow[]) {
  const stats: Partial<Record<StatKey, number | null>> = {};

  for (const key of STAT_KEYS) {
    stats[key] = weightedAverage(rows, key);
  }

  return stats;
}

// One entry per season played, oldest first. Traded seasons use the "TOT" row; without
// one, a season's team rows are combined (games summed, stats games-weighted).
export function consolidateSeasons(rows: readonly SeasonStatRow[]): PlayerSeason[] {
  const bySeason = new Map<string, SeasonStatRow[]>();

  for (const row of rows) {
    if (!row.season) continue;

    bySeason.set(row.season, [...(bySeason.get(row.season) ?? []), row]);
  }

  const seasons: PlayerSeason[] = [];

  for (const [season, seasonRows] of bySeason) {
    const startYear = getSeasonStartYear(season);
    const totalRows = seasonRows.filter((row) => row.team === "TOT");
    const chosen = totalRows.length > 0 ? totalRows : seasonRows;
    const games = chosen.reduce((sum, row) => sum + (toNumber(row.games) ?? 0), 0);

    if (startYear === null || games <= 0) continue;

    seasons.push({ season, startYear, games, ...combineRows(chosen) });
  }

  return seasons.sort((a, b) => a.startYear - b.startYear);
}

export function getSeasonMinGames(
  season: string,
  { maxTeamGamesBySeason, currentSeason }: PeakContext,
) {
  const maxTeamGames = maxTeamGamesBySeason.get(season) ?? 0;
  const share =
    season === currentSeason
      ? CURRENT_SEASON_MIN_GAMES_SHARE
      : COMPLETED_SEASON_MIN_GAMES_SHARE;

  return Math.max(1, Math.ceil(maxTeamGames * share));
}

export function getQualifyingSeasons(
  seasons: readonly PlayerSeason[],
  context: PeakContext,
) {
  return seasons.filter(
    (season) => season.games >= getSeasonMinGames(season.season, context),
  );
}

// "2017-18 to 2018-19" for back-to-back seasons, "2013-14 & 2015-16" across a gap, so a
// pair never reads like three seasons.
export function formatPeakSeasonLabel(first: PlayerSeason, second: PlayerSeason) {
  const separator = second.startYear - first.startYear > 1 ? "&" : "to";

  return `${first.season} ${separator} ${second.season}`;
}

export function canPairPeakSeasons(first: PlayerSeason, second: PlayerSeason) {
  const gap = second.startYear - first.startYear;

  return gap >= 1 && gap <= MAX_PEAK_SEASON_GAP_YEARS;
}

// Two seasons combined into a peak profile with games-weighted averages.
export function combinePeakSeasons(
  first: PlayerSeason,
  second: PlayerSeason,
): PlayerStatProfile {
  const stats = combineRows([first, second]);

  return {
    profileType: "peak",
    seasonLabel: formatPeakSeasonLabel(first, second),
    games: first.games + second.games,
    minutesPerGame: stats.minutesPerGame ?? null,
    ppg: stats.ppg ?? null,
    rpg: stats.rpg ?? null,
    apg: stats.apg ?? null,
    spg: stats.spg ?? null,
    bpg: stats.bpg ?? null,
    fgPercent: stats.fgPercent ?? null,
    threePercent: stats.threePercent ?? null,
    ftPercent: stats.ftPercent ?? null,
    threeMadePerGame: stats.threeMadePerGame ?? null,
    threeAttemptsPerGame: stats.threeAttemptsPerGame ?? null,
    freeThrowAttemptsPerGame: stats.freeThrowAttemptsPerGame ?? null,
  };
}

function ratePeak(player: Player, peak: PlayerStatProfile) {
  return getPlayerRating(
    { ...player, statProfiles: { ...player.statProfiles, peak } },
    "peakOverall",
    "peak",
  );
}

// The player's best two consecutive qualifying seasons, or null with fewer than two.
export function findTwoSeasonPeak(
  player: Player,
  rows: readonly SeasonStatRow[],
  context: PeakContext,
): PlayerStatProfile | null {
  const qualifying = getQualifyingSeasons(consolidateSeasons(rows), context);
  let best: PlayerStatProfile | null = null;
  let bestRating = -Infinity;

  for (let index = 0; index + 1 < qualifying.length; index += 1) {
    if (!canPairPeakSeasons(qualifying[index], qualifying[index + 1])) continue;

    const candidate = combinePeakSeasons(qualifying[index], qualifying[index + 1]);
    const rating = ratePeak(player, candidate);

    if (rating > bestRating) {
      best = candidate;
      bestRating = rating;
    }
  }

  return best;
}

export function createPeakContext(
  maxTeamGamesBySeason: Iterable<readonly [string, number]>,
): PeakContext {
  const maxGames = new Map(maxTeamGamesBySeason);

  return {
    maxTeamGamesBySeason: maxGames,
    currentSeason: getNewestSeason(maxGames.keys()),
  };
}

// Replaces the player's stored peak profile with the two-season peak, or removes it
// when they have fewer than two qualifying seasons.
export function withTwoSeasonPeak<T extends Player>(
  player: T,
  rows: readonly SeasonStatRow[],
  context: PeakContext,
): T {
  const peak = findTwoSeasonPeak(player, rows, context);
  const statProfiles = { ...player.statProfiles };

  if (peak) {
    statProfiles.peak = peak;
  } else {
    delete statProfiles.peak;
  }

  return { ...player, statProfiles };
}

export function hasTwoSeasonPeak(player: Pick<Player, "statProfiles">) {
  return Boolean(player.statProfiles?.peak);
}

// Players ranked in Peak mode: those with a two-season peak. Without any peak data
// (the built-in fallback players) the list is returned unchanged instead of emptied.
export function filterPeakPlayers<T extends Pick<Player, "statProfiles">>(
  players: readonly T[],
): T[] {
  return players.some(hasTwoSeasonPeak)
    ? players.filter(hasTwoSeasonPeak)
    : [...players];
}

// Most games any team played in each season, from single-team stints ("TOT" rows are
// traded players' totals across teams and can exceed any one team's schedule).
export function getMaxTeamGamesBySeason(rows: readonly SeasonStatRow[]) {
  const maxGames = new Map<string, number>();

  for (const row of rows) {
    const games = toNumber(row.games) ?? 0;

    if (!row.season || row.team === "TOT" || games <= 0) continue;

    maxGames.set(row.season, Math.max(maxGames.get(row.season) ?? 0, games));
  }

  return maxGames;
}

export function getNewestSeason(seasons: Iterable<string>) {
  let newest: string | null = null;
  let newestYear = -Infinity;

  for (const season of seasons) {
    const year = getSeasonStartYear(season);

    if (year !== null && year > newestYear) {
      newest = season;
      newestYear = year;
    }
  }

  return newest;
}
