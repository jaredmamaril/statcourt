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
    <div className="mt-3 grid grid-cols-3 gap-2 lg:gap-5">
      {players.map((player, index) => {
        const rankLabel = index === 0 ? "1ST" : index === 1 ? "2ND" : "3RD";
        const archetype = getPlayerInsights(
          player,
          statProfileFilter,
        ).archetype;
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
            tabIndex={0}
            style={{ animationDelay: `${index * 45}ms` }}
            className="group relative min-w-0 rounded-md border border-[rgb(var(--court-accent-rgb)/0.3)] bg-black/40 px-1.5 py-2 transition-all duration-200 animate-[playerListRowIn_180ms_ease-out_both] outline-none hover:z-200 hover:border-[rgb(var(--court-accent-rgb)/0.7)] hover:bg-[rgb(var(--court-accent-rgb)/0.1)] focus:z-200 focus:border-[rgb(var(--court-accent-rgb)/0.7)] focus:bg-[rgb(var(--court-accent-rgb)/0.1)] lg:px-4 lg:py-3"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <p className="font-michroma text-[9px] font-bold text-[var(--court-accent)] lg:text-[11px]">
                    {rankLabel}
                  </p>

                  <p className="font-michroma text-[11px] font-bold text-white lg:text-xl">
                    {rating}
                  </p>
                </div>
                <p
                  className="mt-1 max-w-17.5 truncate font-michroma text-[8px] font-semibold text-white lg:mt-2 lg:max-w-none lg:text-lg"
                  style={{ color: rankColor }}
                >
                  {player.name}
                </p>

                {archetype && (
                  <span
                    className="mt-1 inline-flex max-w-17 rounded border px-1 py-1 font-michroma text-[5px] leading-none lg:max-w-full lg:px-2 lg:text-[8px]"
                    style={getArchetypePillStyle(archetype)}
                  >
                    <span className="truncate uppercase">
                      {archetype.label}
                    </span>
                  </span>
                )}

                <p
                  className="mt-1 font-michroma text-[7px] font-semibold text-white/50 lg:text-[10px]"
                  style={{ color: teamColor }}
                >
                  {player.team}
                </p>

                <p className="mt-0.5 font-michroma text-[7px] text-white/50 lg:mt-1 lg:text-[10px]">
                  {player.position}
                </p>
              </div>
            </div>

            <div className="mt-1.5 flex justify-center lg:mt-2.5">
              <PlayerImage
                src={getPlayerHeadshot(player)}
                alt={player.name}
                width={240}
                height={240}
                className="h-13 w-13 rounded-md object-cover lg:h-30 lg:w-30"
              />
            </div>

            <RankingPlayerTooltip
              player={player}
              ratingLabel={ratingLabel}
              rating={rating}
              statProfileFilter={statProfileFilter}
              onViewPlayer={onViewPlayer}
            />
          </div>
        );
      })}
    </div>
  );
}

