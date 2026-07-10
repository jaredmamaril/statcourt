import type { SavedLineup } from "../shared/lineup-types";
import type { PlayerStatProfileMode } from "../../player-ratings";

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
  savedLineupProfileFilter: PlayerStatProfileMode | "all";
  savedLineupTierFilter: string;
  savedLineupArchetypeFilter: string;
};

export function getFilteredSavedLineups({
  savedLineups,
  savedLineupSearch,
  savedLineupSort,
  savedLineupProfileFilter,
  savedLineupTierFilter,
  savedLineupArchetypeFilter,
}: GetFilteredSavedLineupsParams) {
  return savedLineups
    .filter((lineup) => {
      const search = savedLineupSearch.toLowerCase();

      const matchesSearch = lineup.name.toLowerCase().includes(search);

      const matchesProfile =
        savedLineupProfileFilter === "all" ||
        (lineup.statProfile ?? "career") === savedLineupProfileFilter;

      const matchesTier =
        savedLineupTierFilter === "" || lineup.tier === savedLineupTierFilter;

      const matchesArchetype =
        savedLineupArchetypeFilter === "" ||
        lineup.archetype === savedLineupArchetypeFilter;

      return matchesSearch && matchesProfile && matchesTier && matchesArchetype;
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
