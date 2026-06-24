import type { CompareSlots } from "../court-data";

const RECENT_PLAYERS_KEY = "statcourt-recent-players";
const COMPARE_SLOTS_KEY = "statcourt-compare-slots";

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
export function saveRecentPlayers(playerNames: string[]): void {
  localStorage.setItem(RECENT_PLAYERS_KEY, JSON.stringify(playerNames));
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
