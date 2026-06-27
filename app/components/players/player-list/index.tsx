import type { Player, SortValue } from "../../court-data";
import { PlayerListRow } from "./player-list-row";

type PlayerListProps = {
  players: Player[];
  totalPlayersCount: number;
  currentPlayer: string;
  favorites: string[];
  showFavorites: boolean;
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
  sortBy,
  onToggleFavorite,
  onSelectPlayer,
}: PlayerListProps) {
  return (
    <div className="player-list-scroll max-h-112.5 overflow-y-auto pr-2">
      <div className="mx-auto flex w-full max-w-100 flex-col gap-1">
        {players.length === 0 ? (
          <p className="py-8 text-center font-michroma text-xs text-white/40">
            {showFavorites
              ? "No favorites yet. Click star to add a player."
              : "No players found."}
          </p>
        ) : (
          <>
            {players.map((player) => (
              <PlayerListRow
                key={player.id}
                player={player}
                isSelected={player.name === currentPlayer}
                isFavorite={favorites.includes(player.name)}
                sortBy={sortBy}
                onToggleFavorite={onToggleFavorite}
                onSelectPlayer={onSelectPlayer}
              />
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
