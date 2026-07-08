import PlayerImage from "../player-image";
import { getPlayerHeadshot } from "../player-images";
import {
  getPlayerRating,
  type PlayerRatingCategory,
  type PlayerStatProfileMode,
} from "../player-ratings";
import { getTeamColor, getPlayerInsights, type Player } from "../court-data";

import { getArchetypePillStyle } from "./ranking-style-helpers";
import { RankingPlayerTooltip } from "./ranking-player-tooltip";

type TopRankingCardsProps = {
  players: Player[];
  ratingCategory: PlayerRatingCategory;
  ratingLabel: string;
  statProfileFilter: PlayerStatProfileMode;
  onViewPlayer: (playerName: string) => void;
};

export function TopRankingCards({
  players,
  ratingCategory,
  ratingLabel,
  statProfileFilter,
  onViewPlayer,
}: TopRankingCardsProps) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-3">
      {players.map((player, index) => {
        const rankLabel = index === 0 ? "1ST" : index === 1 ? "2ND" : "3RD";
        const archetype = getPlayerInsights(player).archetype;
        const rating = getPlayerRating(
          player,
          ratingCategory,
          statProfileFilter,
        ).toFixed(1);
        const rankColor =
          index === 0 ? "#EFBF04" : index === 1 ? "#C0C0C0" : "#CD7F32";
        const teamColor = getTeamColor(player.team);

        return (
          <div
            key={player.id}
            className="group relative min-w-0 rounded-md border border-[#1bc2ec]/30 bg-black/40 px-1.5 py-2 transition-all duration-200 hover:border-[#1bc2ec]/70 hover:bg-[#1bc2ec]/10 sm:px-4 sm:py-4 lg:px-5 lg:py-4"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <p className="font-michroma text-[9px] font-bold text-[#1bc2ec] sm:text-xs">
                    {rankLabel}
                  </p>

                  <p className="font-michroma text-[11px] font-bold text-white sm:text-xl lg:text-2xl">
                    {rating}
                  </p>
                </div>
                <p
                  className="mt-1 max-w-17.5 truncate font-michroma text-[8px] font-semibold text-white sm:mt-2 sm:max-w-none sm:text-md lg:text-lg"
                  style={{ color: rankColor }}
                >
                  {player.name}
                </p>

                {archetype && (
                  <span
                    className="mt-1 inline-flex max-w-19 rounded border px-1 py-1 font-michroma text-[5px] leading-none sm:max-w-full sm:px-2 sm:text-[9px] lg:text-[10px]"
                    style={getArchetypePillStyle(archetype)}
                  >
                    <span className="truncate uppercase">
                      {archetype.label}
                    </span>
                  </span>
                )}

                <p
                  className="mt-1 font-michroma text-[7px] font-semibold text-white/50 sm:text-[10px] lg:text-xs"
                  style={{ color: teamColor }}
                >
                  {player.team}
                </p>

                <p className="mt-0.5 font-michroma text-[7px] text-white/50 sm:mt-1 sm:text-[10px] lg:text-xs">
                  {player.position}
                </p>
              </div>
            </div>

            <div className="mt-1.5 flex justify-center sm:mt-3">
              <PlayerImage
                src={getPlayerHeadshot(player)}
                alt={player.name}
                width={240}
                height={240}
                className="h-13 w-13 rounded-md object-cover sm:h-32 sm:w-32 lg:h-36 lg:w-36"
              />
            </div>

            <RankingPlayerTooltip
              player={player}
              ratingLabel={ratingLabel}
              rating={rating}
              onViewPlayer={onViewPlayer}
            />
          </div>
        );
      })}
    </div>
  );
}
