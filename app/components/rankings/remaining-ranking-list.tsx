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

const RANKING_DISPLAY_OPTIONS = [50, 100, 200];
const RANKING_LOAD_MORE_OPTIONS = [25, 50, 100];

type RemainingRankingListProps = {
  players: Player[];
  ratingCategory: PlayerRatingCategory;
  ratingLabel: string;
  statProfileFilter: PlayerStatProfileMode;
  displayView: DefaultPlayerView;
  displayLimit: number;
  loadMoreAmount: number;
  onSelectDisplayLimit: (limit: number) => void;
  onSelectLoadMoreAmount: (amount: number) => void;
  onLoadMore: () => void;
  onViewPlayer: (playerName: string) => void;
};

export function RemainingRankingList({
  players,
  ratingCategory,
  ratingLabel,
  statProfileFilter,
  displayView,
  displayLimit,
  loadMoreAmount,
  onSelectDisplayLimit,
  onSelectLoadMoreAmount,
  onLoadMore,
  onViewPlayer,
}: RemainingRankingListProps) {
  const isCardView = displayView === "cards";
  const remainingPlayers = players.slice(3, displayLimit);
  const hasMorePlayers =
    remainingPlayers.length < Math.max(players.length - 3, 0);

  return (
    <>
      <div className="mb-1.5 flex items-center justify-between px-1.5 font-michroma text-[8px] uppercase tracking-wide text-white/65 lg:mb-2 lg:px-3 lg:text-[9px]">
        <span className="-ml-2">Remaining Rankings</span>
        <span className="-mr-2">Rating</span>
      </div>

      <div
        className={
          isCardView
            ? "grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-2"
            : "grid grid-cols-1 gap-1.5 lg:grid-cols-2 lg:gap-2"
        }
      >
        {remainingPlayers.map((player, index) => {
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

      {players.length > 3 && (
        <div className="mt-2 rounded-md border border-white/15 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-1.5 font-michroma lg:mt-3 lg:p-3">
          <div className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:justify-between lg:gap-2">
            <p className="text-center text-[8px] uppercase text-white/60 lg:text-left lg:text-[9px]">
              Showing {remainingPlayers.length} of {players.length - 3}{" "}
              remaining
            </p>

            <div className="flex flex-wrap items-center justify-center gap-1.5 lg:gap-2">
              <label className="flex items-center gap-1 text-[8px] uppercase text-white/60 lg:gap-1.5 lg:text-[9px]">
                Display
                <select
                  value={displayLimit}
                  onChange={(event) =>
                    onSelectDisplayLimit(Number(event.target.value))
                  }
                  className="h-6 rounded border border-white/15 bg-[var(--court-panel)] px-1.5 text-[8px] text-white outline-none transition focus:border-[var(--court-accent)] lg:h-8 lg:px-2 lg:text-[9px]"
                >
                  {RANKING_DISPLAY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1 text-[8px] uppercase text-white/60 lg:gap-1.5 lg:text-[9px]">
                Load
                <select
                  value={loadMoreAmount}
                  onChange={(event) =>
                    onSelectLoadMoreAmount(Number(event.target.value))
                  }
                  className="h-6 rounded border border-white/15 bg-[var(--court-panel)] px-1.5 text-[8px] text-white outline-none transition focus:border-[var(--court-accent)] lg:h-8 lg:px-2 lg:text-[9px]"
                >
                  {RANKING_LOAD_MORE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      +{option}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={onLoadMore}
                disabled={!hasMorePlayers}
                className="h-6 rounded border border-[rgb(var(--court-accent-rgb)/0.45)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-2 text-[8px] uppercase text-[var(--court-accent)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.2)] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/55 lg:h-8 lg:px-3 lg:text-[9px]"
              >
                {hasMorePlayers ? "Load More" : "All Shown"}
              </button>
            </div>
          </div>
        </div>
      )}
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
      className="group relative grid w-full grid-cols-[26px_30px_minmax(0,1fr)_36px] items-center gap-1 rounded-md border border-white/15 bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] px-1.5 py-1 transition-all duration-200 animate-[playerListRowIn_180ms_ease-out_both] outline-none hover:z-200 hover:border-[rgb(var(--court-accent-rgb)/0.75)] hover:bg-[color:color-mix(in_srgb,var(--court-panel-alt)_96%,black)] focus:z-200 focus:border-[rgb(var(--court-accent-rgb)/0.75)] focus:bg-[color:color-mix(in_srgb,var(--court-panel-alt)_96%,black)] sm:grid-cols-[36px_48px_minmax(0,1fr)_42px_48px] sm:gap-1.5 sm:px-2 sm:py-1.5 lg:grid-cols-[44px_64px_minmax(0,1fr)_48px_56px] lg:gap-2 lg:px-3 lg:py-2"
    >
      <span className="font-michroma text-[9px] font-bold text-[var(--court-accent)] sm:text-[10px] lg:text-xs">
        #{rank}
      </span>

      <PlayerImage
        src={getPlayerHeadshot(player)}
        alt={player.name}
        width={96}
        height={96}
        className="h-7.5 w-7.5 rounded-md object-cover sm:h-12 sm:w-12 lg:h-16 lg:w-16"
      />

      <div className="min-w-0 pt-0 sm:pt-0">
        <p className="truncate font-michroma text-[8px] font-semibold text-white sm:text-[11px] lg:text-[13px]">
          {player.name}
        </p>

        {archetype && (
          <span
            className="inline-flex max-w-32 rounded border px-1.5 py-0.5 font-michroma text-[7px] leading-none sm:text-[8px] lg:max-w-full lg:px-2 lg:py-1 lg:text-[9px]"
            style={getArchetypePillStyle(archetype)}
          >
            <span className="truncate uppercase">{archetype.label}</span>
          </span>
        )}

        <p
          className="font-michroma text-[8px] font-semibold sm:hidden"
          style={{ color: teamColor }}
        >
          {player.team}
        </p>

        <p className="mt-0.5 font-michroma text-[7px] text-white/60 sm:text-[8px] lg:text-[9px]">
          {player.position} - #{player.jerseyNumber}
        </p>
      </div>

      <span
        className="hidden text-right font-michroma text-[9px] font-semibold sm:block lg:text-[11px]"
        style={{
          color: teamColor,
        }}
      >
        {player.team}
      </span>

      <span className="justify-self-end text-right font-michroma text-[9px] font-bold text-white sm:text-[10px] lg:text-xs">
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
      className="group relative flex min-h-36 flex-col rounded-md border border-white/15 bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] px-1.5 py-1.5 text-center transition-all duration-200 animate-[playerListRowIn_180ms_ease-out_both] outline-none hover:z-200 hover:-translate-y-0.5 hover:border-[rgb(var(--court-accent-rgb)/0.75)] hover:bg-[color:color-mix(in_srgb,var(--court-panel-alt)_96%,black)] focus:z-200 focus:border-[rgb(var(--court-accent-rgb)/0.75)] focus:bg-[color:color-mix(in_srgb,var(--court-panel-alt)_96%,black)] lg:min-h-44 lg:px-2 lg:py-2"
    >
      <div className="flex items-center justify-between font-michroma text-[8px] lg:text-[10px]">
        <span className="font-bold text-[var(--court-accent)]">#{rank}</span>
        <span className="font-bold text-white">{rating}</span>
      </div>

      <PlayerImage
        src={getPlayerHeadshot(player)}
        alt={player.name}
        width={96}
        height={96}
        className="mx-auto mt-1.5 h-14 w-14 rounded-md object-cover lg:mt-2 lg:h-18 lg:w-18"
      />

      <p className="mt-1.5 line-clamp-2 font-michroma text-[8px] font-semibold leading-tight text-white lg:mt-2 lg:text-[10px]">
        {player.name}
      </p>

      <p
        className="mt-1 font-michroma text-[8px] font-semibold lg:text-[9px]"
        style={{ color: teamColor }}
      >
        {player.team} · {player.position}
      </p>

      {archetype && (
        <span
          className="mx-auto mt-1.5 inline-flex max-w-full rounded border px-1 py-0.5 font-michroma text-[7px] leading-none lg:mt-2 lg:px-1.5 lg:py-1 lg:text-[9px]"
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

