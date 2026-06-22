import { teamColors, type Player, type SortValue } from "./court-data";
import { getPlayerHeadshot } from "./player-images";
import { getPlayerRating } from "./player-ratings";
import PlayerImage from "./player-image";

type PlayerListProps = {
  players: Player[];
  currentPlayer: string;
  favorites: string[];
  showFavorites: boolean;
  sortBy: SortValue;
  onToggleFavorite: (playerName: string) => void;
  onSelectPlayer: (playerName: string) => void;
};

export function PlayerList({
  players,
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
          players.map((player) => {
            const isSelected = player.name === currentPlayer;
            const isFavorite = favorites.includes(player.name);
            const teamColor = teamColors[player.team];
            const playerOverall = getPlayerRating(player);
            const selectedStatValue =
              sortBy && sortBy !== "first-name" && sortBy !== "last-name"
                ? player.stats[sortBy]
                : null;

            return (
              <div
                key={player.id}
                className={`flex w-full items-stretch rounded-md border text-left font-michroma text-xs transition-all duration-200 ${
                  isSelected
                    ? "border-[#178aa7] bg-[#1bc2ec]/10 text-[#1bc2ec]"
                    : "border-white/10 bg-black/20 text-white/90 hover:border-white/30 hover:bg-white/5"
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
                  className={`shrink-0 cursor-pointer px-1.5 py-1 text-sm transition-colors duration-200 ${
                    isFavorite
                      ? "text-[#1bc2ec]"
                      : "text-white/20 hover:text-[#1bc2ec]/60"
                  }`}
                >
                  {isFavorite ? "★" : "☆"}
                </button>

                <button
                  type="button"
                  onClick={() => onSelectPlayer(player.name)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 px-2 py-2 text-left font-michroma text-xs"
                >
                  <PlayerImage
                    src={getPlayerHeadshot(player)}
                    alt={player.name}
                    width={44}
                    height={44}
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{player.name}</span>

                    <span className="mt-1 flex items-center gap-1.5">
                      <span
                        className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] text-white/80"
                        style={{
                          backgroundColor: teamColor,
                          borderColor: teamColor,
                        }}
                      >
                        {player.team}
                      </span>

                      <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] text-white/60">
                        {player.position}
                      </span>

                      <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] text-white/60">
                        #{player.jerseyNumber}
                      </span>

                      {selectedStatValue !== null && (
                        <span className="shrink-0 rounded border border-[#1bc2ec]/30 bg-[#1bc2ec]/10 px-1.5 py-0.5 text-[10px] text-[#1bc2ec]">
                          {selectedStatValue}
                          {sortBy === "fgPercent" ||
                          sortBy === "threePercent" ||
                          sortBy === "ftPercent"
                            ? "%"
                            : ""}
                        </span>
                      )}
                    </span>
                  </span>

                  <span className="ml-auto flex w-20 shrink-0 flex-col items-end justify-center text-right">
                    <span
                      className="block font-michroma text-[13px] leading-none"
                      style={{
                        color: teamColor,
                        textShadow: `0 0 10px ${teamColor}88`,
                      }}
                    >
                      {playerOverall.toFixed(1)}
                    </span>

                    <span className="mt-1 block font-michroma text-[7px] uppercase leading-none text-white/35">
                      OVR
                    </span>
                  </span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
