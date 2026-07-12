import type { Player, SortValue } from "../../court-data";
import { PlayerListRow } from "./player-list-row";
import type { PlayerRatingCategory } from "../../player-ratings";

type PlayerListProps = {
  players: Player[];
  totalPlayersCount: number;
  currentPlayer: string;
  favorites: string[];
  showFavorites: boolean;
  selectedSkill: PlayerRatingCategory;
  sortBy: SortValue;
  onToggleFavorite: (playerName: string) => void;
  onSelectPlayer: (playerName: string) => void;
};

export function PlayerList({
  players,
  totalPlayersCount,
  currentPlayer,
  favorites,
  showFavorites,
  selectedSkill,
  sortBy,
  onToggleFavorite,
  onSelectPlayer,
}: PlayerListProps) {
  return (
    <div className="statcourt-scroll mx-auto max-h-112.5 w-full max-w-100 overflow-y-auto pr-1">
      <div className="flex flex-col gap-1">
        {players.length === 0 ? (
          <p className="py-8 text-center font-michroma text-xs text-white/40">
            {showFavorites
              ? "No favorites yet. Click star to add a player."
              : "No players found."}
          </p>
        ) : (
          <>
            {players.map((player, index) => (
              <div
                key={player.id}
                style={{ animationDelay: `${Math.min(index, 12) * 12}ms` }}
                className="animate-[playerListRowIn_180ms_ease-out_both]"
              >
                <PlayerListRow
                  player={player}
                  isSelected={player.name === currentPlayer}
                  isFavorite={favorites.includes(player.name)}
                  sortBy={sortBy}
                  selectedSkill={selectedSkill}
                  onToggleFavorite={onToggleFavorite}
                  onSelectPlayer={onSelectPlayer}
                />
              </div>
            ))}

            {players.length < totalPlayersCount && (
              <p className="py-3 text-center font-michroma text-[10px] text-white/35">
                Showing {players.length} of {totalPlayersCount}. Use search or
                filters to narrow results.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
