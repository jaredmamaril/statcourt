import type { Position } from "../../court-data";
import type { SavedLineup } from "../shared/lineup-types";

export function getSavedSortLabel(savedLineupSort: string) {
  if (savedLineupSort === "lowestOvr") return "Lowest OVR";
  if (savedLineupSort === "newest") return "Newest Saved";
  if (savedLineupSort === "oldest") return "Oldest Saved";

  return "Highest OVR";
}

type GetFilteredSavedLineupsParams = {
  savedLineups: SavedLineup[];
  savedLineupSearch: string;
  savedLineupSort: string;
  savedLineupTierFilter: string;
  savedLineupArchetypeFilter: string;
  lineupPositions: Position[];
};

export function getFilteredSavedLineups({
  savedLineups,
  savedLineupSearch,
  savedLineupSort,
  savedLineupTierFilter,
  savedLineupArchetypeFilter,
  lineupPositions,
}: GetFilteredSavedLineupsParams) {
  return savedLineups
    .filter((lineup) => {
      const search = savedLineupSearch.toLowerCase();

      const playerNames = lineupPositions
        .map((position) => lineup.players[position])
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        lineup.name.toLowerCase().includes(search) ||
        lineup.archetype.toLowerCase().includes(search) ||
        lineup.teamIdentity.toLowerCase().includes(search) ||
        playerNames.includes(search);

      const matchesTier =
        savedLineupTierFilter === "" || lineup.tier === savedLineupTierFilter;

      const matchesArchetype =
        savedLineupArchetypeFilter === "" ||
        lineup.archetype === savedLineupArchetypeFilter;

      return matchesSearch && matchesTier && matchesArchetype;
    })
    .toSorted((a, b) => {
      if (savedLineupSort === "lowestOvr") {
        return a.overall - b.overall;
      }

      if (savedLineupSort === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      if (savedLineupSort === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      return b.overall - a.overall;
    });
}
