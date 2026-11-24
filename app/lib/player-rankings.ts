import type { Player } from "../components/court-data";
import {
  getPlayerRating,
  type PlayerRatingCategory,
  type PlayerStatProfileMode,
} from "../components/player-ratings";
import { filterPeakPlayers } from "./player-peak";
import {
  filterCurrentSeasonPlayers,
  type CurrentSeasonRankingOptions,
} from "./player-season";

// Current mode ranks only players eligible for Current Season rankings: active and
// with enough games in the newest season (isEligibleForCurrentRankings).
// Peak ranks players with a two-season peak (app/lib/player-peak.ts), retired included.
// Career ranks every player.
export function getRankingPool<T extends Player>(
  players: readonly T[],
  statProfileMode: PlayerStatProfileMode,
  options: CurrentSeasonRankingOptions = {},
): T[] {
  if (statProfileMode === "current") {
    return filterCurrentSeasonPlayers(players, options);
  }

  return statProfileMode === "peak" ? filterPeakPlayers(players) : [...players];
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
