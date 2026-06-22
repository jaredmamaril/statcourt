import type {
  Player,
  Position,
  SortDirection,
  SortValue,
  Team,
} from "../court-data";

type GetFilteredPlayersOptions = {
  players: Player[];
  playerSearch: string;
  favorites: string[];
  showFavorites: boolean;
  filteredTeam: Team | "";
  filteredPosition: Position | "";
  sortBy: SortValue;
  sortDirection: SortDirection;
};

export function getFilteredPlayers({
  players,
  playerSearch,
  favorites,
  showFavorites,
  filteredTeam,
  filteredPosition,
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

      return (
        matchesSearch && matchesFavorites && matchesTeam && matchesPosition
      );
    })
    .sort((a, b) => {
      if (!sortBy) return 0;

      let result = 0;

      const aSpaceIndex = a.name.indexOf(" ");
      const aFirstName = a.name.slice(0, aSpaceIndex);
      const aLastName = a.name.slice(aSpaceIndex + 1);

      const bSpaceIndex = b.name.indexOf(" ");
      const bFirstName = b.name.slice(0, bSpaceIndex);
      const bLastName = b.name.slice(bSpaceIndex + 1);

      if (sortBy === "first-name") {
        result = aFirstName.localeCompare(bFirstName);
      }

      if (sortBy === "last-name") {
        result = aLastName.localeCompare(bLastName);
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
