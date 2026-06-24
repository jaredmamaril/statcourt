import PlayerImage from "../player-image";
import { getPlayerHeadshot } from "../player-images";
import { getPlayerRating } from "../player-ratings";
import { teamColors, type Player } from "../court-data";
import { RankingPlayerTooltip } from "./ranking-player-tooltip";

type ArchetypePlayerListProps = {
  players: Player[];
  onViewPlayer: (playerName: string) => void;
};

export function ArchetypePlayerList({
  players,
  onViewPlayer,
}: ArchetypePlayerListProps) {
  return (
    <>
      <div className="mt-4">
        <h2 className="font-michroma text-sm uppercase tracking-wide text-white">
          Top Players In Selected Archetype
        </h2>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-2">
        {players.length === 0 ? (
          <p className="font-michroma text-xs text-white/40">
            Select an archetype to view players.
          </p>
        ) : (
          players.map((player, index) => {
            const rating = getPlayerRating(player, "overall").toFixed(1);

            return (
              <div
                key={player.id}
                className="group relative grid w-full grid-cols-[48px_48px_1fr_72px] items-center rounded-md border border-white/10 bg-black/30 px-4 py-3 transition-all duration-200 hover:border-[#1bc2ec]/50 hover:bg-[#1bc2ec]/10"
              >
                <span className="font-michroma text-xs font-bold text-[#1bc2ec]">
                  #{index + 1}
                </span>

                <PlayerImage
                  src={getPlayerHeadshot(player)}
                  alt={player.name}
                  width={120}
                  height={120}
                  className="-ml-3 h-16 w-16 rounded-md object-cover"
                />

                <div className="min-w-0">
                  <p className="truncate font-michroma text-sm font-semibold text-white">
                    {player.name}
                  </p>
                  <p
                    className="mt-0.5 font-michroma text-[9px]"
                    style={{ color: teamColors[player.team] }}
                  >
                    {player.team}
                  </p>
                  <p className="mt-0.5 font-michroma text-[9px] text-white/40">
                    {player.position} - #{player.jerseyNumber}
                  </p>
                </div>

                <span className="text-right font-michroma text-sm font-bold text-white">
                  {rating}
                </span>

                <RankingPlayerTooltip
                  player={player}
                  ratingLabel="Overall Rating"
                  rating={rating}
                  onViewPlayer={onViewPlayer}
                />
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
