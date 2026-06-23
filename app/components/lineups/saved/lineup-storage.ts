import type { SavedLineup } from "../shared/lineup-types";

const SAVED_LINEUPS_KEY = "statcourt-saved-lineups";

export function getSavedLineups() {
  const saved = localStorage.getItem(SAVED_LINEUPS_KEY);

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved) as SavedLineup[];
  } catch {
    return [];
  }
}

export function saveSavedLineups(lineups: SavedLineup[]) {
  localStorage.setItem(SAVED_LINEUPS_KEY, JSON.stringify(lineups));
}
