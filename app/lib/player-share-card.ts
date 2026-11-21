import type {
  Player,
  PlayerStatProfile,
  PlayerStats,
} from "../components/court-data";
import {
  getPlayerRating,
  type PlayerStatProfileMode,
} from "../components/player-ratings";
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
  rank: number;
};

export type PlayerShareCard = {
  name: string;
  initials: string;
  // Only set on current-season cards; see the note in getPlayerShareCard.
  team: string | null;
  position: string;
  profileLabel: string;
  overall: string;
  rankLabel: string;
  stats: { label: string; value: string }[];
};

const modeLabels: Record<PlayerShareCardMode, string> = {
  peak: "3-Year Peak",
  career: "Career",
  current: "Current",
};

const rankLabels: Record<PlayerShareCardMode, string> = {
  peak: "3-Year Peak All-Time",
  career: "Career All-Time",
  current: "Current Season",
};

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

// Ranks match the rankings page: every player sorted by the mode's overall rating.
export function buildPlayerShareCardSources(
  players: readonly Player[],
  mode: PlayerShareCardMode = "peak",
): PlayerShareCardSource[] {
  const overalls = players.map((player) =>
    getPlayerRating(player, overallCategories[mode], mode),
  );
  const rankByIndex = new Map(
    overalls
      .map((overall, index) => ({ overall, index }))
      .sort((a, b) => b.overall - a.overall)
      .map(({ index }, position) => [index, position + 1]),
  );

  return players.map((player, index) => {
    const stats = getModeStats(player, mode);

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
      rank: rankByIndex.get(index) ?? players.length,
    };
  });
}

// Returns null when the slug doesn't match a player, so the image can render the fallback card.
export function getPlayerShareCard(
  players: readonly PlayerShareCardSource[],
  slug: string,
  mode: PlayerShareCardMode = "peak",
): PlayerShareCard | null {
  let player: PlayerShareCardSource | undefined;

  try {
    player = findPlayerBySlug(players, slug);
  } catch {
    return null;
  }

  if (!player) return null;

  // Without the mode's own profile the stats come from career, so label them that way.
  const label = player.hasProfile ? modeLabels[mode] : modeLabels.career;
  const seasonLabel =
    player.seasonLabel?.toLowerCase() === label.toLowerCase()
      ? null
      : player.seasonLabel;

  return {
    name: player.name,
    initials: getPlayerInitials(player.name),
    // Stat profiles don't store the teams from their window yet, and the current team
    // would be wrong for peak/career windows, so only current-season cards show it.
    team: mode === "current" ? player.team : null,
    position: player.position,
    profileLabel: seasonLabel ? `${label} · ${seasonLabel}` : label,
    overall: player.overall.toFixed(1),
    rankLabel: `#${player.rank} ${rankLabels[mode]}`,
    stats: [
      { label: "PPG", value: formatStat(player.ppg) },
      { label: "RPG", value: formatStat(player.rpg) },
      { label: "APG", value: formatStat(player.apg) },
      { label: "FG PCT", value: formatStat(player.fgPercent) },
    ],
  };
}
