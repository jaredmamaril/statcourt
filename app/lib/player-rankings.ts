import type { Player } from "../components/court-data";
import {
  getPlayerRating,
  type PlayerRatingCategory,
  type PlayerStatProfileMode,
} from "../components/player-ratings";
import { filterCurrentSeasonPlayers } from "./player-season";

// Current mode ranks only players from the newest season (active players).
// Career and Peak rank every player, retired players included.
export function getRankingPool<T extends Player>(
  players: readonly T[],
  statProfileMode: PlayerStatProfileMode,
): T[] {
  return statProfileMode === "current"
    ? filterCurrentSeasonPlayers(players)
    : [...players];
}

// Highest rating first. A player's rank is their position in the result (index + 1).
// Shooting and efficiency leave out players without a rating.
export function rankPlayers<T extends Player>(
  players: readonly T[],
  category: PlayerRatingCategory,
  statProfileMode: PlayerStatProfileMode,
): T[] {
  const ratings = new Map(
    players.map((player) => [
      player,
      getPlayerRating(player, category, statProfileMode),
    ]),
  );

  return players
    .filter((player) => {
      if (category === "shooting" || category === "efficiency") {
        return (ratings.get(player) ?? 0) > 0;
      }

      return true;
    })
    .sort((a, b) => (ratings.get(b) ?? 0) - (ratings.get(a) ?? 0));
}
