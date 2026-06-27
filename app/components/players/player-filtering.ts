import {
  getPlayerInsights,
  type Player,
  type Position,
  type SortDirection,
  type SortValue,
  type Team,
} from "../court-data";
import { getPlayerRating } from "../player-ratings";

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
}: GetFilteredPlayersOptions) {
  return players
    .filter((player) => {
      const matchesSearch = player.name
        .toLowerCase()
        .includes(playerSearch.toLowerCase());

      const matchesFavorites = showFavorites
        ? favorites.includes(player.name)
        : true;

      const matchesTeam = filteredTeam ? player.team === filteredTeam : true;

      const matchesPosition = filteredPosition
        ? player.position === filteredPosition
        : true;

      const playerArchetype =
        getPlayerInsights(player).archetype?.label ?? null;

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
        return (
          getPlayerRating(b) - getPlayerRating(a) ||
          a.name.localeCompare(b.name)
        );
      }

      let result = 0;

      const { lastName: aLastName } = getNameParts(a.name);
      const { lastName: bLastName } = getNameParts(b.name);

      if (sortBy === "first-name") {
        result = a.name.localeCompare(b.name);
      }

      if (sortBy === "last-name") {
        result = aLastName.localeCompare(bLastName);
      }

      if (sortBy === "overall") {
        result = getPlayerRating(b) - getPlayerRating(a);
      }

      if (sortBy === "ppg") result = b.stats.ppg - a.stats.ppg;
      if (sortBy === "rpg") result = b.stats.rpg - a.stats.rpg;
      if (sortBy === "apg") result = b.stats.apg - a.stats.apg;
      if (sortBy === "fgPercent") {
        result = b.stats.fgPercent - a.stats.fgPercent;
      }
      if (sortBy === "threePercent") {
        result = b.stats.threePercent - a.stats.threePercent;
      }
      if (sortBy === "ftPercent") {
        result = b.stats.ftPercent - a.stats.ftPercent;
      }

      return sortDirection === "primary" ? result : -result;
    });
}
