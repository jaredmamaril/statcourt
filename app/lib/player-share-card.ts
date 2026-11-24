import type {
  Player,
  PlayerStatProfile,
  PlayerStats,
} from "../components/court-data";
import {
  getPlayerRating,
  type PlayerStatProfileMode,
} from "../components/player-ratings";
import {
  getCurrentRankingMinGames,
  getCurrentSeasonStartYear,
  getLatestSeasonStartYear,
  isEligibleForCurrentRankings,
  isPlayerActive,
} from "./player-season";
import { findPlayerBySlug } from "./player-slug";

export type PlayerShareCardMode = PlayerStatProfileMode;

export type PlayerShareCardSource = {
  name: string;
  nbaId: number | null;
  team: string;
  position: string;
  hasProfile: boolean;
  seasonLabel: string | null;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
  fgPercent: number | null;
  overall: number;
  // Null in current mode unless the player's latest season is the newest one in the data.
  rank: number | null;
  // Current mode only: the player's latest season is older than the newest season in the data.
  isFinalSeason: boolean;
};

export type PlayerShareCard = {
  name: string;
  initials: string;
  // Only set on current-season cards; see the note in getPlayerShareCard.
  team: string | null;
  position: string;
  profileLabel: string;
  overall: string;
  rankLabel: string | null;
  stats: { label: string; value: string }[];
};

const modeLabels: Record<PlayerShareCardMode, string> = {
  peak: "3-Year Peak",
  career: "Career",
  current: "Current",
};

// Plain-language rank phrases, e.g. "#4 best peak ever".
const rankPhrases: Record<PlayerShareCardMode, string> = {
  peak: "best peak ever",
  career: "best career ever",
  current: "in the NBA this season",
};

const descriptionModeLabels: Record<PlayerShareCardMode, string> = {
  peak: "3-year peak",
  career: "career",
  current: "current season",
};

const maxDescriptionLength = 160;
// Ranks past this read as noise on a share card, so they're left out.
const maxShownRank = 100;
const descriptionCallToAction = "Compare players and build lineups on StatCourt.";

const overallCategories = {
  peak: "peakOverall",
  career: "careerOverall",
  current: "currentOverall",
} as const;

const nameSuffixes = new Set(["jr", "sr", "ii", "iii", "iv", "v"]);

function toNumberOrNull(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatStat(value: number | null) {
  return value === null ? "--" : value.toFixed(1);
}

export function getPlayerInitials(name: string) {
  const words = name
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((word) => word && !nameSuffixes.has(word.toLowerCase()));

  if (words.length === 0) return "?";

  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : "";

  return `${first}${last}`.toUpperCase();
}

// Same fallback as the profile page and getPlayerRating: mode profile, then career, then base stats.
function getModeStats(
  player: Player,
  mode: PlayerShareCardMode,
): PlayerStatProfile | PlayerStats {
  const profiles = player.statProfiles;

  if (mode === "peak") return profiles?.peak ?? profiles?.career ?? player.stats;
  if (mode === "current") {
    return profiles?.current ?? profiles?.career ?? player.stats;
  }

  return profiles?.career ?? player.stats;
}

// Peak and career ranks match the rankings page: every player sorted by the mode's
// overall rating. Current-mode ranks only compare players eligible for Current Season
// rankings (isEligibleForCurrentRankings). Inactive players get no rank: their current
// profile is just their final season, so there is no fair group to rank in.
export function buildPlayerShareCardSources(
  players: readonly Player[],
  mode: PlayerShareCardMode = "peak",
): PlayerShareCardSource[] {
  const overalls = players.map((player) =>
    getPlayerRating(player, overallCategories[mode], mode),
  );
  const now = new Date();
  const latestSeasonStart =
    mode === "current" ? getLatestSeasonStartYear(players) : null;
  const minGames =
    mode === "current"
      ? getCurrentRankingMinGames(players, latestSeasonStart)
      : 0;
  // Active decides the Final Season label; ranking eligibility (active plus enough
  // newest-season games) is the same rule Current Season rankings use, so the ranks
  // match. Injured active players are active but unranked.
  const isActive = players.map(
    (player) =>
      mode === "current" && isPlayerActive(player, latestSeasonStart, now),
  );
  const rankedIndexes = players
    .map((_, index) => index)
    .filter(
      (index) =>
        mode !== "current" ||
        isEligibleForCurrentRankings(
          players[index],
          latestSeasonStart,
          minGames,
          now,
        ),
    );
  const rankByIndex = new Map(
    rankedIndexes
      .sort((a, b) => overalls[b] - overalls[a])
      .map((index, position) => [index, position + 1]),
  );

  return players.map((player, index) => {
    const stats = getModeStats(player, mode);
    const seasonStart =
      mode === "current" ? getCurrentSeasonStartYear(player) : null;

    return {
      name: player.name,
      nbaId: player.nbaId ?? null,
      team: player.team,
      position: player.position,
      hasProfile: Boolean(player.statProfiles?.[mode]),
      seasonLabel: ("seasonLabel" in stats ? stats.seasonLabel : null) ?? null,
      ppg: toNumberOrNull(stats.ppg),
      rpg: toNumberOrNull(stats.rpg),
      apg: toNumberOrNull(stats.apg),
      fgPercent: toNumberOrNull(stats.fgPercent),
      overall: overalls[index],
      rank: rankByIndex.get(index) ?? null,
      // Not on an active roster (or, without roster data, didn't play this season):
      // their current profile is their final season.
      isFinalSeason: mode === "current" && seasonStart !== null && !isActive[index],
    };
  });
}

function findShareCardSource(
  players: readonly PlayerShareCardSource[],
  slug: string,
) {
  try {
    return findPlayerBySlug(players, slug) ?? null;
  } catch {
    return null;
  }
}

function getRankText(player: PlayerShareCardSource, mode: PlayerShareCardMode) {
  if (player.rank === null || player.rank > maxShownRank) return null;

  return `#${player.rank} ${rankPhrases[mode]}`;
}

function getProfileLabel(player: PlayerShareCardSource, mode: PlayerShareCardMode) {
  if (player.isFinalSeason && player.seasonLabel) {
    return `Final Season · ${formatSeasonWindow(player.seasonLabel)}`;
  }

  // Without the mode's own profile the stats come from career, so label them that way.
  const label = player.hasProfile ? modeLabels[mode] : modeLabels.career;
  const seasonLabel =
    player.seasonLabel?.toLowerCase() === label.toLowerCase()
      ? null
      : player.seasonLabel;

  return seasonLabel ? `${label} · ${seasonLabel}` : label;
}

// "2007-08 to 2009-10" -> "2007–10", "2017-18" -> "2017–18"; other labels are left as-is.
export function formatSeasonWindow(seasonLabel: string) {
  const match = seasonLabel.match(
    /^(\d{4})-(\d{2})(?: to \d{4}-(\d{2}))?$/,
  );

  if (!match) return seasonLabel;

  return `${match[1]}–${match[3] ?? match[2]}`;
}

// Returns null when the slug doesn't match a player, so the image can render the fallback card.
export function getPlayerShareCard(
  players: readonly PlayerShareCardSource[],
  slug: string,
  mode: PlayerShareCardMode = "peak",
): PlayerShareCard | null {
  const player = findShareCardSource(players, slug);

  if (!player) return null;

  return {
    name: player.name,
    initials: getPlayerInitials(player.name),
    // Stat profiles don't store the teams from their window yet, and the current team
    // would be wrong for peak/career windows, so only current-season cards show it.
    team: mode === "current" ? player.team : null,
    position: player.position,
    profileLabel: getProfileLabel(player, mode),
    // Whole number on the card; the rankings page keeps its one-decimal ratings.
    overall: Math.round(player.overall).toString(),
    rankLabel: getRankText(player, mode)?.toUpperCase() ?? null,
    stats: [
      { label: "PPG", value: formatStat(player.ppg) },
      { label: "RPG", value: formatStat(player.rpg) },
      { label: "APG", value: formatStat(player.apg) },
      { label: "FG PCT", value: formatStat(player.fgPercent) },
    ],
  };
}

// Meta description for the player page, e.g. "LeBron James's 3-year peak (2007–10):
// 29.3 PPG, 7.6 RPG, 7.7 APG, and the #4 best peak ever. Compare players ...".
// Returns null when the player isn't found so the page can use its generic copy.
export function getPlayerShareDescription(
  players: readonly PlayerShareCardSource[],
  slug: string,
  mode: PlayerShareCardMode = "peak",
) {
  const player = findShareCardSource(players, slug);

  if (!player) return null;

  // Matches the card: without the mode's own profile the stats come from career.
  const modeLabel = player.isFinalSeason
    ? "final season"
    : player.hasProfile
      ? descriptionModeLabels[mode]
      : descriptionModeLabels.career;
  const seasonWindow =
    player.hasProfile && player.seasonLabel
      ? formatSeasonWindow(player.seasonLabel)
      : null;
  const subject = seasonWindow
    ? `${player.name}'s ${modeLabel} (${seasonWindow})`
    : `${player.name}'s ${modeLabel}`;
  const stats = [
    [player.ppg, "PPG"],
    [player.rpg, "RPG"],
    [player.apg, "APG"],
  ]
    .filter((stat): stat is [number, string] => stat[0] !== null)
    .map(([value, label]) => `${value.toFixed(1)} ${label}`);
  const rank = getRankText(player, mode);
  const rankText = rank
    ? mode === "current"
      ? `ranked ${rank}`
      : `the ${rank}`
    : null;
  const details = rankText
    ? stats.length > 0
      ? `${stats.join(", ")}, and ${rankText}`
      : rankText
    : stats.join(", ");
  const summary = details ? `${subject}: ${details}.` : `${subject}.`;
  const description = `${summary} ${descriptionCallToAction}`;

  return description.length <= maxDescriptionLength ? description : summary;
}
