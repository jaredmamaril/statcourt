import { useEffect, useState } from "react";
import type { SavedLineup } from "../shared/lineup-types";
import { getSavedLineups, saveSavedLineups } from "./lineup-storage";

export function useSavedLineups() {
  const [savedLineups, setSavedLineups] = useState<SavedLineup[]>([]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setSavedLineups(getSavedLineups());
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  function updateSavedLineups(nextLineups: SavedLineup[]) {
    setSavedLineups(nextLineups);
    saveSavedLineups(nextLineups);
  }

  return {
    savedLineups,
    updateSavedLineups,
  };
}
