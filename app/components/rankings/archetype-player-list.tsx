import PlayerImage from "../player-image";
import { getPlayerHeadshot } from "../player-images";
import {
  getPlayerRating,
  type PlayerRatingCategory,
  type PlayerStatProfileMode,
} from "../player-ratings";
import { getTeamColor, type Player } from "../court-data";
import { RankingPlayerTooltip } from "./ranking-player-tooltip";

type ArchetypePlayerListProps = {
  players: Player[];
  onViewPlayer: (playerName: string) => void;
  statProfileFilter: PlayerStatProfileMode;
};

export function ArchetypePlayerList({
  players,
  onViewPlayer,
  statProfileFilter,
}: ArchetypePlayerListProps) {
  const statProfileLabels = {
    career: "Career",
    peak: "3-Year Peak",
    current: "Latest Season",
  };

  const overallCategoryByProfile: Record<
    PlayerStatProfileMode,
    PlayerRatingCategory
  > = {
    career: "careerOverall",
    peak: "peakOverall",
    current: "currentOverall",
  };

  const overallCategory = overallCategoryByProfile[statProfileFilter];

  return (
    <>
      <div className="mt-4">
        <h2 className="font-michroma text-[9px] uppercase tracking-wide text-white lg:text-sm">
          Top {statProfileLabels[statProfileFilter]} Players In Selected
          Archetype
        </h2>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-2">
        {players.length === 0 ? (
          <p className="font-michroma text-xs text-white/40">
            Select an archetype to view players.
          </p>
        ) : (
          players.map((player, index) => {
            const rating = getPlayerRating(
              player,
              overallCategory,
              statProfileFilter,
            ).toFixed(1);
            const teamColor = getTeamColor(player.team);

            return (
              <div
                key={player.id}
                tabIndex={0}
                style={{ animationDelay: `${Math.min(index, 12) * 12}ms` }}
                className="group relative grid w-full grid-cols-[28px_34px_minmax(0,1fr)_42px] items-center rounded-md border border-white/10 bg-black/30 px-2 py-1.5 transition-all duration-200 animate-[playerListRowIn_180ms_ease-out_both] outline-none hover:z-[200] hover:border-[rgb(var(--court-accent-rgb)/0.5)] hover:bg-[rgb(var(--court-accent-rgb)/0.1)] focus:z-[200] focus:border-[rgb(var(--court-accent-rgb)/0.5)] focus:bg-[rgb(var(--court-accent-rgb)/0.1)] lg:grid-cols-[48px_48px_1fr_72px] lg:px-4 lg:py-3"
              >
                <span className="font-michroma text-[9px] font-bold text-[var(--court-accent)] lg:text-xs">
                  #{index + 1}
                </span>

                <PlayerImage
                  src={getPlayerHeadshot(player)}
                  alt={player.name}
                  width={120}
                  height={120}
                  className="-ml-1 h-10 w-10 rounded-md object-cover lg:-ml-3 lg:h-16 lg:w-16"
                />

                <div className="min-w-0">
                  <p className="truncate font-michroma text-[10px] font-semibold text-white lg:text-sm">
                    {player.name}
                  </p>
                  <p
                    className="mt-0.5 font-michroma text-[7px] lg:text-[9px]"
                    style={{ color: teamColor }}
                  >
                    {player.team}
                  </p>
                  <p className="mt-0.5 font-michroma text-[7px] text-white/40 lg:text-[9px]">
                    {player.position} - #{player.jerseyNumber}
                  </p>
                </div>

                <span className="text-right font-michroma text-[10px] font-bold text-white lg:text-sm">
                  {rating}
                </span>

                <RankingPlayerTooltip
                  player={player}
                  ratingLabel="Overall Rating"
                  rating={rating}
                  statProfileFilter={statProfileFilter}
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

