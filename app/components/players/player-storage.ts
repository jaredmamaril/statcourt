import type { CompareSlots, LineupSlot } from "../court-data";

const RECENT_PLAYERS_KEY = "statcourt-recent-players";
const COMPARE_SLOTS_KEY = "statcourt-compare-slots";
const FAVORITE_PLAYERS_KEY = "statcourt-favorite-players";
const BUILDER_DRAFT_KEY = "statcourt-builder-draft";

export const EMPTY_BUILDER_DRAFT: Record<LineupSlot, string> = {
  PG: "",
  SG: "",
  SF: "",
  PF: "",
  C: "",
};

export function getSavedCompareSlots(): CompareSlots {
  if (typeof window === "undefined") return { left: "", right: "" };

  const savedSlots = localStorage.getItem(COMPARE_SLOTS_KEY);

  if (!savedSlots) return { left: "", right: "" };

  return JSON.parse(savedSlots) as CompareSlots;
}

export function getSavedRecentPlayers(): string[] {
  if (typeof window === "undefined") return [];

  const savedRecentPlayers = localStorage.getItem(RECENT_PLAYERS_KEY);

  if (!savedRecentPlayers) return [];

  return JSON.parse(savedRecentPlayers) as string[];
}

export function getSavedFavoritePlayers(): string[] {
  if (typeof window === "undefined") return [];

  const savedFavoritePlayers = localStorage.getItem(FAVORITE_PLAYERS_KEY);

  if (!savedFavoritePlayers) return [];

  return JSON.parse(savedFavoritePlayers) as string[];
}

export function getSavedBuilderDraft(): Record<LineupSlot, string> {
  if (typeof window === "undefined") return EMPTY_BUILDER_DRAFT;

  const savedBuilderDraft = localStorage.getItem(BUILDER_DRAFT_KEY);

  if (!savedBuilderDraft) return EMPTY_BUILDER_DRAFT;

  return {
    ...EMPTY_BUILDER_DRAFT,
    ...(JSON.parse(savedBuilderDraft) as Partial<Record<LineupSlot, string>>),
  };
}

export function saveRecentPlayers(playerNames: string[]): void {
  localStorage.setItem(RECENT_PLAYERS_KEY, JSON.stringify(playerNames));
}

export function saveFavoritePlayers(playerNames: string[]): void {
  localStorage.setItem(FAVORITE_PLAYERS_KEY, JSON.stringify(playerNames));
}

export function saveBuilderDraft(
  builderDraft: Record<LineupSlot, string>,
): void {
  localStorage.setItem(BUILDER_DRAFT_KEY, JSON.stringify(builderDraft));
}

export function clearSavedBuilderDraft(): void {
  localStorage.removeItem(BUILDER_DRAFT_KEY);
}

export function saveCompareSlots(compareSlots: CompareSlots): void {
  localStorage.setItem(COMPARE_SLOTS_KEY, JSON.stringify(compareSlots));
}

export function addRecentPlayer(
  currentRecentPlayers: string[],
  playerName: string,
): string[] {
  return [
    playerName,
    ...currentRecentPlayers.filter((name) => name !== playerName),
  ].slice(0, 6);
}
