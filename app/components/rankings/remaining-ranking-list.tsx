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
import type { DefaultPlayerView } from "../../lib/use-user-settings";

type RemainingRankingListProps = {
  players: Player[];
  ratingCategory: PlayerRatingCategory;
  ratingLabel: string;
  statProfileFilter: PlayerStatProfileMode;
  displayView: DefaultPlayerView;
  onViewPlayer: (playerName: string) => void;
};

export function RemainingRankingList({
  players,
  ratingCategory,
  ratingLabel,
  statProfileFilter,
  displayView,
  onViewPlayer,
}: RemainingRankingListProps) {
  const DISPLAY_LIMIT = 100;
  const isCardView = displayView === "cards";

  return (
    <>
      <div className="mb-2 flex items-center justify-between px-2 font-michroma text-[8px] uppercase tracking-wide text-white/40 sm:px-3 sm:text-[9px]">
        <span className="-ml-2">Remaining Rankings</span>
        <span className="-mr-2">Rating</span>
      </div>

      <div
        className={
          isCardView
            ? "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
            : "grid grid-cols-1 gap-2 lg:grid-cols-2"
        }
      >
        {players.slice(3, DISPLAY_LIMIT).map((player, index) => {
          const archetype = getPlayerInsights(
            player,
            statProfileFilter,
          ).archetype;
          const rating = getPlayerRating(
            player,
            ratingCategory,
            statProfileFilter,
          ).toFixed(1);
          const teamColor = getTeamColor(player.team);

          return isCardView ? (
            <RankingPlayerCard
              key={player.id}
              player={player}
              rank={index + 4}
              ratingLabel={ratingLabel}
              rating={rating}
              teamColor={teamColor}
              archetype={archetype}
              statProfileFilter={statProfileFilter}
              animationDelay={Math.min(index, 12) * 12}
              onViewPlayer={onViewPlayer}
            />
          ) : (
            <RankingPlayerRow
              key={player.id}
              player={player}
              rank={index + 4}
              ratingLabel={ratingLabel}
              rating={rating}
              teamColor={teamColor}
              archetype={archetype}
              statProfileFilter={statProfileFilter}
              animationDelay={Math.min(index, 12) * 12}
              onViewPlayer={onViewPlayer}
            />
          );
        })}
      </div>
    </>
  );
}

type RankingPlayerItemProps = {
  player: Player;
  rank: number;
  ratingLabel: string;
  rating: string;
  teamColor: string;
  archetype: NonNullable<
    ReturnType<typeof getPlayerInsights>["archetype"]
  > | null;
  statProfileFilter: PlayerStatProfileMode;
  animationDelay: number;
  onViewPlayer: (playerName: string) => void;
};

function RankingPlayerRow({
  player,
  rank,
  ratingLabel,
  rating,
  teamColor,
  archetype,
  statProfileFilter,
  animationDelay,
  onViewPlayer,
}: RankingPlayerItemProps) {
  return (
    <div
      tabIndex={0}
      style={{ animationDelay: `${animationDelay}ms` }}
      className="group relative grid w-full grid-cols-[32px_38px_minmax(0,1fr)_42px] items-center gap-1.5 rounded-md border border-white/10 bg-black/30 px-2 py-1 transition-all duration-200 animate-[playerListRowIn_180ms_ease-out_both] outline-none hover:z-200 hover:border-[#1bc2ec]/50 hover:bg-[#1bc2ec]/10 focus:z-200 focus:border-[#1bc2ec]/50 focus:bg-[#1bc2ec]/10 sm:grid-cols-[44px_64px_minmax(0,1fr)_48px_56px] sm:gap-2 sm:px-3 sm:py-2"
    >
      <span className="font-michroma text-[11px] font-bold text-[#1bc2ec] sm:text-xs">
        #{rank}
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
            <span className="truncate uppercase">{archetype.label}</span>
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
        statProfileFilter={statProfileFilter}
        onViewPlayer={onViewPlayer}
      />
    </div>
  );
}

function RankingPlayerCard({
  player,
  rank,
  ratingLabel,
  rating,
  teamColor,
  archetype,
  statProfileFilter,
  animationDelay,
  onViewPlayer,
}: RankingPlayerItemProps) {
  return (
    <div
      tabIndex={0}
      style={{ animationDelay: `${animationDelay}ms` }}
      className="group relative flex min-h-44 flex-col rounded-md border border-white/10 bg-black/30 px-2 py-2 text-center transition-all duration-200 animate-[playerListRowIn_180ms_ease-out_both] outline-none hover:z-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/50 hover:bg-[#1bc2ec]/10 focus:z-200 focus:border-[#1bc2ec]/50 focus:bg-[#1bc2ec]/10"
    >
      <div className="flex items-center justify-between font-michroma text-[10px]">
        <span className="font-bold text-[#1bc2ec]">#{rank}</span>
        <span className="font-bold text-white">{rating}</span>
      </div>

      <PlayerImage
        src={getPlayerHeadshot(player)}
        alt={player.name}
        width={120}
        height={120}
        className="mx-auto mt-2 h-18 w-18 rounded-md object-cover"
      />

      <p className="mt-2 line-clamp-2 font-michroma text-[10px] font-semibold leading-tight text-white">
        {player.name}
      </p>

      <p
        className="mt-1 font-michroma text-[8px] font-semibold"
        style={{ color: teamColor }}
      >
        {player.team} · {player.position}
      </p>

      {archetype && (
        <span
          className="mx-auto mt-2 inline-flex max-w-full rounded border px-1.5 py-1 font-michroma lg:text-[9px] text-[6px] leading-none"
          style={getArchetypePillStyle(archetype)}
        >
          <span className="truncate uppercase">{archetype.label}</span>
        </span>
      )}

      <RankingPlayerTooltip
        player={player}
        ratingLabel={ratingLabel}
        rating={rating}
        statProfileFilter={statProfileFilter}
        onViewPlayer={onViewPlayer}
      />
    </div>
  );
}
