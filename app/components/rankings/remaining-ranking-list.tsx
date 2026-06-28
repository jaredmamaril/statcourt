import PlayerImage from "../player-image";
import { getPlayerHeadshot } from "../player-images";
import { getPlayerRating, type PlayerRatingCategory } from "../player-ratings";
import { getTeamColor, getPlayerInsights, type Player } from "../court-data";

import { getArchetypePillStyle } from "./ranking-style-helpers";
import { RankingPlayerTooltip } from "./ranking-player-tooltip";

type RemainingRankingListProps = {
  players: Player[];
  ratingCategory: PlayerRatingCategory;
  ratingLabel: string;
  onViewPlayer: (playerName: string) => void;
};

export function RemainingRankingList({
  players,
  ratingCategory,
  ratingLabel,
  onViewPlayer,
}: RemainingRankingListProps) {
  return (
    <>
      <div className="mb-2 flex items-center justify-between px-3 font-michroma text-[9px] uppercase tracking-wide text-white/40">
        <span className="-ml-2">Remaining Rankings</span>
        <span className="-mr-2">Rating</span>
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {players.slice(3).map((player, index) => {
          const archetype = getPlayerInsights(player).archetype;
          const rating = getPlayerRating(player, ratingCategory).toFixed(1);
          const teamColor = getTeamColor(player.team);

          return (
            <div
              key={player.id}
              className="group relative grid w-full grid-cols-[44px_40px_1fr_52px_56px] items-center rounded-md border border-white/10 bg-black/30 px-3 py-2 transition-all duration-200 hover:border-[#1bc2ec]/50 hover:bg-[#1bc2ec]/10"
            >
              <span className="font-michroma text-xs font-bold text-[#1bc2ec]">
                #{index + 4}
              </span>

              <PlayerImage
                src={getPlayerHeadshot(player)}
                alt={player.name}
                width={120}
                height={120}
                className="h-16 w-16 rounded-md object-cover"
              />

              <div className="min-w-0 ml-4">
                <p className="truncate font-michroma text-[13px] font-semibold text-white">
                  {player.name}
                </p>

                {archetype && (
                  <span
                    className="mt-1 inline-flex w-fit max-w-full rounded border px-2 py-0.5 font-michroma text-[9px]"
                    style={getArchetypePillStyle(archetype)}
                  >
                    <span className="truncate uppercase">
                      {archetype.label}
                    </span>
                  </span>
                )}

                <p className="mt-0.5 font-michroma text-[9px] text-white/40">
                  {player.position} - #{player.jerseyNumber}
                </p>
              </div>

              <span
                className="text-right font-michroma font-semibold text-[11px]"
                style={{
                  color: teamColor,
                }}
              >
                {player.team}
              </span>

              <span className="text-right font-michroma text-xs font-bold text-white">
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
