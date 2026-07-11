import {
  getPlayerInsights,
  normalizeTeamCode,
  type Player,
  type Position,
  type SortDirection,
  type SortValue,
  type Team,
} from "../court-data";
import { getPlayerRating } from "../player-ratings";
import type { PlayerRatingCategory } from "../player-ratings";

function getActivePlayerStats(
  player: Player,
  selectedRatingView: PlayerRatingCategory,
) {
  if (selectedRatingView === "peakOverall") {
    return (
      player.statProfiles?.peak ?? player.statProfiles?.career ?? player.stats
    );
  }

  if (selectedRatingView === "currentOverall") {
    return (
      player.statProfiles?.current ??
      player.statProfiles?.career ??
      player.stats
    );
  }

  return player.statProfiles?.career ?? player.stats;
}

type GetFilteredPlayersOptions = {
  players: Player[];
  playerSearch: string;
  favorites: string[];
  showFavorites: boolean;
  filteredTeam: Team | "";
  filteredPosition: Position | "";
  filteredArchetype: string;
  sortBy: SortValue;
  sortDirection: SortDirection;
  selectedRatingView: PlayerRatingCategory;
};

function getNameParts(name: string) {
  const parts = name.trim().split(/\s+/);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.at(-1) ?? "",
  };
}

export function getFilteredPlayers({
  players,
  playerSearch,
  favorites,
  showFavorites,
  filteredTeam,
  filteredPosition,
  filteredArchetype,
  sortBy,
  sortDirection,
  selectedRatingView,
}: GetFilteredPlayersOptions) {
  return players
    .filter((player) => {
      const matchesSearch = player.name
        .toLowerCase()
        .includes(playerSearch.toLowerCase());

      const matchesFavorites = showFavorites
        ? favorites.includes(player.name)
        : true;

      const matchesTeam = filteredTeam
        ? normalizeTeamCode(player.team) === filteredTeam
        : true;

      const matchesPosition = filteredPosition
        ? player.position === filteredPosition
        : true;

      const statMode =
        selectedRatingView === "peakOverall"
          ? "peak"
          : selectedRatingView === "currentOverall"
            ? "current"
            : "career";

      const playerArchetype =
        getPlayerInsights(player, statMode).archetype?.label ?? null;

      const matchesArchetype =
        filteredArchetype === "Unclassified"
          ? playerArchetype === null
          : filteredArchetype
            ? playerArchetype === filteredArchetype
            : true;

      return (
        matchesSearch &&
        matchesFavorites &&
        matchesTeam &&
        matchesPosition &&
        matchesArchetype
      );
    })
    .sort((a, b) => {
      if (!sortBy) {
        const result =
          getPlayerRating(b, selectedRatingView) -
            getPlayerRating(a, selectedRatingView) ||
          a.name.localeCompare(b.name);

        return sortDirection === "primary" ? result : -result;
      }

      let result = 0;

      const aStats = getActivePlayerStats(a, selectedRatingView);
      const bStats = getActivePlayerStats(b, selectedRatingView);
      const { lastName: aLastName } = getNameParts(a.name);
      const { lastName: bLastName } = getNameParts(b.name);

      if (sortBy === "first-name") {
        result = a.name.localeCompare(b.name);
      }

      if (sortBy === "last-name") {
        result = aLastName.localeCompare(bLastName);
      }

      if (sortBy === "ppg") result = (bStats.ppg ?? 0) - (aStats.ppg ?? 0);
      if (sortBy === "rpg") result = (bStats.rpg ?? 0) - (aStats.rpg ?? 0);
      if (sortBy === "apg") result = (bStats.apg ?? 0) - (aStats.apg ?? 0);
      if (sortBy === "fgPercent")
        result = (bStats.fgPercent ?? 0) - (aStats.fgPercent ?? 0);
      if (sortBy === "threePercent")
        result = (bStats.threePercent ?? 0) - (aStats.threePercent ?? 0);
      if (sortBy === "ftPercent")
        result = (bStats.ftPercent ?? 0) - (aStats.ftPercent ?? 0);

      return sortDirection === "primary" ? result : -result;
    });
}
