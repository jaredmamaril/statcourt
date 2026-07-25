import {
  lineupCards,
  lineupDetails,
  lineupGroups,
  type LineupCategory,
  type LineupName,
} from "./featured-lineups";
import type { LineupDetail } from "../shared/lineup-types";

export function getLineupAchievements(selectedLineup: LineupDetail | null) {
  if (!selectedLineup) {
    return [];
  }

  return [
    selectedLineup.achievements.record
      ? `${selectedLineup.achievements.record} Record`
      : null,
    selectedLineup.achievements.result ?? null,
    selectedLineup.achievements.playoffs
      ? `${selectedLineup.achievements.playoffs} Playoffs`
      : null,
    selectedLineup.achievements.note ?? null,
  ].filter((achievement): achievement is string => Boolean(achievement));
}

export function getLineupNamesForCategory(
  selectedLineupCategory: LineupCategory | "",
) {
  if (!selectedLineupCategory) {
    return [];
  }

  return lineupGroups[selectedLineupCategory];
}

export function getBestFeaturedLineup(category: LineupCategory) {
  const categoryLineups = lineupGroups[category];

  return categoryLineups.reduce<LineupName | null>((bestLineup, lineupName) => {
    if (!bestLineup) return lineupName;

    const currentOverall = lineupDetails[lineupName].overall;
    const bestOverall = lineupDetails[bestLineup].overall;

    return currentOverall > bestOverall ? lineupName : bestLineup;
  }, null);
}

export function getLineupCategoryColor(
  selectedLineupCategory: LineupCategory | "",
) {
  return (
    lineupCards.find((card) => card.title === selectedLineupCategory)?.color ??
    "var(--court-accent)"
  );
}
