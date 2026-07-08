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

type RemainingRankingListProps = {
  players: Player[];
  ratingCategory: PlayerRatingCategory;
  ratingLabel: string;
  statProfileFilter: PlayerStatProfileMode;
  onViewPlayer: (playerName: string) => void;
};

export function RemainingRankingList({
  players,
  ratingCategory,
  ratingLabel,
  statProfileFilter,
  onViewPlayer,
}: RemainingRankingListProps) {
  const DISPLAY_LIMIT = 100;
  return (
    <>
      <div className="mb-2 flex items-center justify-between px-2 font-michroma text-[8px] uppercase tracking-wide text-white/40 sm:px-3 sm:text-[9px]">
        <span className="-ml-2">Remaining Rankings</span>
        <span className="-mr-2">Rating</span>
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {players.slice(3, DISPLAY_LIMIT).map((player, index) => {
          const archetype = getPlayerInsights(player).archetype;
          const rating = getPlayerRating(
            player,
            ratingCategory,
            statProfileFilter,
          ).toFixed(1);
          const teamColor = getTeamColor(player.team);

          return (
            <div
              key={player.id}
              className="group relative grid w-full grid-cols-[32px_38px_minmax(0,1fr)_42px] items-center gap-1.5 rounded-md border border-white/10 bg-black/30 px-2 py-1 transition-all duration-200 hover:border-[#1bc2ec]/50 hover:bg-[#1bc2ec]/10 sm:grid-cols-[44px_64px_minmax(0,1fr)_48px_56px] sm:gap-2 sm:px-3 sm:py-2"
            >
              <span className="font-michroma text-[11px] font-bold text-[#1bc2ec] sm:text-xs">
                #{index + 4}
              </span>

              <PlayerImage
                src={getPlayerHeadshot(player)}
                alt={player.name}
                width={120}
                height={120}
                className="h-9.5 w-9.5 rounded-md object-cover sm:h-16 sm:w-16"
              />

              <div className="min-w-0 pt-1 sm:pt-0">
                <p className="truncate font-michroma text-[10px] font-semibold text-white sm:text-[13px]">
                  {player.name}
                </p>

                {archetype && (
                  <span
                    className="inline-flex max-w-18 rounded border px-1 py-1 font-michroma text-[5.5px] leading-none sm:max-w-full sm:px-2 sm:text-[9px]"
                    style={getArchetypePillStyle(archetype)}
                  >
                    <span className="truncate uppercase">
                      {archetype.label}
                    </span>
                  </span>
                )}

                <p
                  className="font-michroma text-[7px] font-semibold sm:hidden"
                  style={{ color: teamColor }}
                >
                  {player.team}
                </p>

                <p className="mt-0.5 font-michroma text-[7px] text-white/40 sm:text-[9px]">
                  {player.position} - #{player.jerseyNumber}
                </p>
              </div>

              <span
                className="hidden text-right font-michroma text-[11px] font-semibold sm:block"
                style={{
                  color: teamColor,
                }}
              >
                {player.team}
              </span>

              <span className="justify-self-end text-right font-michroma text-[11px] font-bold text-white sm:text-xs">
                {rating}
              </span>

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
    </>
  );
}
