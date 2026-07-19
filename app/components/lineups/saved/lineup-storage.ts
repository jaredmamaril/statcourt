import type { SavedLineup } from "../shared/lineup-types";

const SAVED_LINEUPS_KEY = "statcourt-saved-lineups";

export function getSavedLineups() {
  const saved = localStorage.getItem(SAVED_LINEUPS_KEY);

  if (!saved) {
    return [];
  }

  try {
    const lineups = JSON.parse(saved) as SavedLineup[];

    return lineups.map((lineup) => ({
      ...lineup,
      statProfile: lineup.statProfile ?? "career",
      isPublic: lineup.isPublic ?? false,
    }));
  } catch {
    return [];
  }
}

export function saveSavedLineups(lineups: SavedLineup[]) {
  localStorage.setItem(SAVED_LINEUPS_KEY, JSON.stringify(lineups));
}
