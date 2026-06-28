import PlayerImage from "../player-image";
import { getPlayerHeadshot } from "../player-images";
import { getPlayerRating, type PlayerRatingCategory } from "../player-ratings";
import { getTeamColor, getPlayerInsights, type Player } from "../court-data";

import { getArchetypePillStyle } from "./ranking-style-helpers";
import { RankingPlayerTooltip } from "./ranking-player-tooltip";

type TopRankingCardsProps = {
  players: Player[];
  ratingCategory: PlayerRatingCategory;
  ratingLabel: string;
  onViewPlayer: (playerName: string) => void;
};

export function TopRankingCards({
  players,
  ratingCategory,
  ratingLabel,
  onViewPlayer,
}: TopRankingCardsProps) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-3">
      {players.map((player, index) => {
        const rankLabel = index === 0 ? "1ST" : index === 1 ? "2ND" : "3RD";
        const archetype = getPlayerInsights(player).archetype;
        const rating = getPlayerRating(player, ratingCategory).toFixed(1);
        const rankColor =
          index === 0 ? "#EFBF04" : index === 1 ? "#C0C0C0" : "#CD7F32";
        const teamColor = getTeamColor(player.team);

        return (
          <div
            key={player.id}
            className="group relative rounded-md border border-[#1bc2ec]/30 bg-black/40 px-4 py-4 transition-all duration-200 hover:border-[#1bc2ec]/70 hover:bg-[#1bc2ec]/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-michroma text-xs font-bold text-[#1bc2ec]">
                  {rankLabel}
                </p>

                <p
                  className="mt-2 truncate font-michroma font-semibold text-md text-white"
                  style={{
                    color: rankColor,
                  }}
                >
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

                <p
                  className="mt-1 font-michroma font-semibold text-[10px] text-white/50"
                  style={{
                    color: teamColor,
                  }}
                >
                  {player.team}
                </p>

                <p className="mt-1 font-michroma text-[10px] text-white/50">
                  {player.position}
                </p>
              </div>

              <p className="font-michroma text-xl font-bold text-white">
                {rating}
              </p>
            </div>

            <div className="mt-3 flex justify-center">
              <PlayerImage
                src={getPlayerHeadshot(player)}
                alt={player.name}
                width={240}
                height={240}
                className="h-32 w-32 rounded-md object-cover"
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
