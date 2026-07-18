import type { Player, SortValue } from "../../court-data";
import { getReadableTeamColor, getTeamColor } from "../../court-data";
import { PlayerListRow } from "./player-list-row";
import { getPlayerHeadshot } from "../../player-images";
import PlayerImage from "../../player-image";
import { getPlayerRating } from "../../player-ratings";
import type { PlayerRatingCategory } from "../../player-ratings";
import type { DefaultPlayerView } from "../../../lib/use-user-settings";

type PlayerListProps = {
  players: Player[];
  totalPlayersCount: number;
  currentPlayer: string;
  favorites: string[];
  showFavorites: boolean;
  selectedSkill: PlayerRatingCategory;
  sortBy: SortValue;
  displayView: DefaultPlayerView;
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
  displayView,
  onToggleFavorite,
  onSelectPlayer,
}: PlayerListProps) {
  const isCardView = displayView === "cards";

  return (
    <div
      className={`statcourt-scroll mx-auto max-h-112.5 w-full overflow-y-auto pr-1 ${
        isCardView ? "max-w-120" : "max-w-100"
      }`}
    >
      <div
        className={
          isCardView
            ? "grid grid-cols-2 gap-2 sm:grid-cols-3"
            : "flex flex-col gap-1"
        }
      >
        {players.length === 0 ? (
          <p className="col-span-full py-8 text-center font-michroma text-xs text-white/40">
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
                {isCardView ? (
                  <PlayerListCard
                    player={player}
                    isSelected={player.name === currentPlayer}
                    isFavorite={favorites.includes(player.name)}
                    selectedSkill={selectedSkill}
                    onToggleFavorite={onToggleFavorite}
                    onSelectPlayer={onSelectPlayer}
                  />
                ) : (
                  <PlayerListRow
                    player={player}
                    isSelected={player.name === currentPlayer}
                    isFavorite={favorites.includes(player.name)}
                    sortBy={sortBy}
                    selectedSkill={selectedSkill}
                    onToggleFavorite={onToggleFavorite}
                    onSelectPlayer={onSelectPlayer}
                  />
                )}
              </div>
            ))}

            {players.length < totalPlayersCount && (
              <p className="col-span-full py-3 text-center font-michroma text-[10px] text-white/35">
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

type PlayerListCardProps = {
  player: Player;
  isSelected: boolean;
  isFavorite: boolean;
  selectedSkill: PlayerRatingCategory;
  onToggleFavorite: (playerName: string) => void;
  onSelectPlayer: (playerName: string) => void;
};

function PlayerListCard({
  player,
  isSelected,
  isFavorite,
  selectedSkill,
  onToggleFavorite,
  onSelectPlayer,
}: PlayerListCardProps) {
  const teamColor = getTeamColor(player.team);
  const readableTeamColor = getReadableTeamColor(player.team);
  const selectedRating = getPlayerRating(player, selectedSkill);

  return (
    <div
      className={`relative flex min-h-33 flex-col items-center rounded-md border bg-black/20 px-2 py-2 text-center font-michroma transition-all duration-200 ${
        isSelected
          ? "border-[#1bc2ec] text-[#1bc2ec] shadow-[0_0_18px_rgba(27,194,236,0.18)]"
          : "border-white/10 text-white/85 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/5"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggleFavorite(player.name)}
        aria-label={
          isFavorite
            ? `Remove ${player.name} from favorites`
            : `Add ${player.name} to favorites`
        }
        className={`absolute left-2 top-1.5 cursor-pointer text-xs transition-colors ${
          isFavorite
            ? "text-[#1bc2ec]"
            : "text-white/20 hover:text-[#1bc2ec]/70"
        }`}
      >
        {isFavorite ? "★" : "☆"}
      </button>

      <button
        type="button"
        onClick={() => onSelectPlayer(player.name)}
        className="flex w-full flex-1 cursor-pointer flex-col items-center justify-center"
      >
        <PlayerImage
          src={getPlayerHeadshot(player)}
          alt={player.name}
          width={240}
          height={240}
          className="h-13 w-13 rounded-full object-cover"
        />

        <span className="mt-1.5 line-clamp-2 text-[9px] leading-tight text-white">
          {player.name}
        </span>

        <span className="mt-1.5 text-[7px] uppercase text-white/35">
          {player.team} · {player.position}
        </span>

        <span
          className="mt-0.5 text-[11px]"
          style={{
            color: readableTeamColor,
            textShadow: `0 0 10px ${teamColor}88`,
          }}
        >
          {selectedRating.toFixed(1)} OVR
        </span>
      </button>
    </div>
  );
}
