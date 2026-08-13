import { useCallback, useEffect, useMemo, useState } from "react";
import type { LineupSlot, Player } from "../../court-data";
import type { BuilderStatProfileMode } from "./builder-position-helpers";
import {
  getBuilderPlayerRatingForPosition,
  getPositionFit,
  getPositionPenalty,
} from "./builder-position-helpers";
import PlayerImage from "../../player-image";
import { getPlayerHeadshot } from "../../player-images";
import { BuilderPlayerCard } from "./builder-player-card";
import type { DefaultPlayerView } from "../../../lib/use-user-settings";

const BUILD_PLAYER_DISPLAY_OPTIONS = [20, 50, 80];
const BUILD_PLAYER_LOAD_MORE_OPTIONS = [25, 50, 100];

type BuilderPlayerPickerProps = {
  activeBuildPosition: LineupSlot;
  customLineup: Record<LineupSlot, string>;
  buildPlayerSearch: string;
  builderStatProfile: BuilderStatProfileMode;
  displayView: DefaultPlayerView;
  availableBuildPlayers: Player[];
  allBuildPlayers: Player[];
  activeDraftPlayerName: string;
  onSearchChange: (value: string) => void;
  onPickPlayer: (playerName: string) => void;
};

export function BuilderPlayerPicker({
  activeBuildPosition,
  customLineup,
  buildPlayerSearch,
  builderStatProfile,
  displayView,
  availableBuildPlayers,
  allBuildPlayers,
  activeDraftPlayerName,
  onSearchChange,
  onPickPlayer,
}: BuilderPlayerPickerProps) {
  const [openScoutPlayer, setOpenScoutPlayer] = useState<{
    playerId: number;
    contextKey: string;
  } | null>(null);
  const [baseDisplayLimit, setBaseDisplayLimit] = useState(50);
  const [loadMoreAmount, setLoadMoreAmount] = useState(50);
  const [displayLimit, setDisplayLimit] = useState(50);
  const scoutContextKey = `${activeBuildPosition}-${builderStatProfile}`;
  const openScoutPlayerId =
    openScoutPlayer?.contextKey === scoutContextKey
      ? openScoutPlayer.playerId
      : null;
  const isCardView = displayView === "cards";

  const pickPlayer = useCallback(
    (playerName: string) => {
      setOpenScoutPlayer(null);
      onPickPlayer(playerName);
    },
    [onPickPlayer],
  );

  const toggleScoutPlayer = useCallback(
    (playerId: number) => {
      setOpenScoutPlayer((currentPlayer) =>
        currentPlayer?.playerId === playerId &&
        currentPlayer.contextKey === scoutContextKey
          ? null
          : {
              playerId,
              contextKey: scoutContextKey,
            },
      );
    },
    [scoutContextKey],
  );

  const displayedBuildPlayers = useMemo(() => {
    if (!activeDraftPlayerName) {
      return availableBuildPlayers.slice(0, displayLimit);
    }

    const activePlayer = allBuildPlayers.find(
      (player) => player.name === activeDraftPlayerName,
    );

    if (!activePlayer) {
      return availableBuildPlayers.slice(0, displayLimit);
    }

    return [
      activePlayer,
      ...availableBuildPlayers.filter(
        (player) => player.name !== activeDraftPlayerName,
      ),
    ].slice(0, displayLimit);
  }, [
    activeDraftPlayerName,
    allBuildPlayers,
    availableBuildPlayers,
    displayLimit,
  ]);

  const hasMoreBuildPlayers =
    displayedBuildPlayers.length < availableBuildPlayers.length;
  const displayTotal = Math.max(
    availableBuildPlayers.length,
    displayedBuildPlayers.length,
  );

  const resetDisplayLimitKey = `${activeBuildPosition}-${builderStatProfile}-${buildPlayerSearch}`;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDisplayLimit(baseDisplayLimit);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [baseDisplayLimit, resetDisplayLimitKey]);

  function loadMoreBuildPlayers() {
    setDisplayLimit((currentLimit) =>
      Math.min(currentLimit + loadMoreAmount, availableBuildPlayers.length),
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex justify-center">
        <label htmlFor="builder-player-search" className="sr-only">
          Search players
        </label>
        <input
          id="builder-player-search"
          type="search"
          value={buildPlayerSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search Player..."
          className="h-5 w-51 rounded-md border border-[rgb(var(--court-accent-rgb)/0.22)] bg-[color:color-mix(in_srgb,var(--court-panel)_72%,transparent)] px-3 font-michroma text-[9px] text-white outline-none transition placeholder:text-white/55 focus:border-[rgb(var(--court-accent-rgb)/0.75)] focus:bg-[color:color-mix(in_srgb,var(--court-panel-alt)_78%,transparent)] lg:h-10 lg:w-full lg:max-w-96 lg:text-xs"
        />
      </div>

      <p className="text-center font-michroma text-[8px] uppercase text-white/55 lg:text-[9px]">
        {buildPlayerSearch.trim() ? (
          <>
            Showing {displayedBuildPlayers.length} of{" "}
            {displayTotal} results
          </>
        ) : (
          <>
            Showing top {displayedBuildPlayers.length} of{" "}
            {displayTotal}
          </>
        )}
      </p>

      <div className="statcourt-scroll mx-auto max-h-21 w-full overflow-y-auto pr-1 lg:max-h-84 lg:max-w-96 lg:pr-2">
        <div
          key={`${activeBuildPosition}-${builderStatProfile}-${displayView}`}
          className={
            isCardView
              ? "grid grid-cols-[repeat(3,75px)] justify-center gap-1 lg:grid-cols-3 lg:justify-stretch lg:gap-2"
              : "grid w-full grid-cols-1 gap-1.5"
          }
        >
          {displayedBuildPlayers.map((player, index) => {
            const isSelected =
              customLineup[activeBuildPosition] === player.name;

            return (
              <div
                key={player.id}
                className="w-full animate-[playerListRowIn_160ms_ease-out_both]"
                style={{
                  animationDelay: `${Math.min(index, 14) * 24}ms`,
                }}
              >
                {isCardView ? (
                  <BuilderPlayerCard
                    player={player}
                    activeBuildPosition={activeBuildPosition}
                    builderStatProfile={builderStatProfile}
                    isSelected={isSelected}
                    isScoutOpen={openScoutPlayerId === player.id}
                    onToggleScout={toggleScoutPlayer}
                    onPickPlayer={pickPlayer}
                  />
                ) : (
                  <BuilderPlayerListRow
                    player={player}
                    activeBuildPosition={activeBuildPosition}
                    builderStatProfile={builderStatProfile}
                    isSelected={isSelected}
                    onPickPlayer={pickPlayer}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto w-fit max-w-full rounded border border-white/15 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-0.5 font-michroma lg:rounded-md lg:p-1">
        <div className="flex flex-wrap items-center justify-center gap-0.5 lg:gap-2">
          <label className="flex items-center gap-0.5 text-[7px] uppercase text-white/60 lg:gap-1 lg:text-[8px]">
            Show
            <select
              aria-label="Number of players to show"
              value={baseDisplayLimit}
              onChange={(event) =>
                setBaseDisplayLimit(Number(event.target.value))
              }
              className="h-4.5 rounded border border-white/15 bg-[var(--court-panel)] px-0.5 text-[7px] text-white outline-none focus:border-[var(--court-accent)] lg:h-6 lg:px-1.5 lg:text-[8px]"
            >
              {BUILD_PLAYER_DISPLAY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-0.5 text-[7px] uppercase text-white/60 lg:gap-1 lg:text-[8px]">
            Load
            <select
              aria-label="Number of additional players to load"
              value={loadMoreAmount}
              onChange={(event) =>
                setLoadMoreAmount(Number(event.target.value))
              }
              className="h-4.5 rounded border border-white/15 bg-[var(--court-panel)] px-0.5 text-[7px] text-white outline-none focus:border-[var(--court-accent)] lg:h-6 lg:px-1.5 lg:text-[8px]"
            >
              {BUILD_PLAYER_LOAD_MORE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  +{option}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={loadMoreBuildPlayers}
            disabled={!hasMoreBuildPlayers}
            className="h-4.5 rounded border border-[rgb(var(--court-accent-rgb)/0.45)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-1 font-michroma text-[7px] uppercase text-[var(--court-accent)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.2)] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/55 lg:h-6 lg:px-3 lg:text-[8px]"
          >
            {hasMoreBuildPlayers ? "Load More" : "All Shown"}
          </button>
        </div>
      </div>
    </div>
  );
}

type BuilderPlayerListRowProps = {
  player: Player;
  activeBuildPosition: LineupSlot;
  builderStatProfile: BuilderStatProfileMode;
  isSelected: boolean;
  onPickPlayer: (playerName: string) => void;
};

function BuilderPlayerListRow({
  player,
  activeBuildPosition,
  builderStatProfile,
  isSelected,
  onPickPlayer,
}: BuilderPlayerListRowProps) {
  const positionFit = getPositionFit(
    player,
    activeBuildPosition,
    builderStatProfile,
  );
  const positionPenalty = getPositionPenalty(positionFit);
  const positionRating = getBuilderPlayerRatingForPosition(
    player,
    activeBuildPosition,
    builderStatProfile,
  );
  const fitLabel =
    positionFit === "natural"
      ? "Natural"
      : positionFit === "flex"
        ? `Flex -${positionPenalty}`
        : positionFit === "reach"
          ? `Reach -${positionPenalty}`
          : `Mismatch -${positionPenalty}`;

  return (
    <button
      aria-label={`${player.name}, ${positionRating.toFixed(
        1,
      )} overall for ${activeBuildPosition}, ${fitLabel} fit. Click to draft to ${activeBuildPosition}.`}
      type="button"
      onClick={() => onPickPlayer(player.name)}
      className={`mx-auto grid w-80 max-w-full min-w-0 grid-cols-[34px_minmax(0,1fr)_52px] items-center gap-2 rounded-md border bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] px-2 py-1.5 text-left transition lg:grid-cols-[38px_minmax(0,1fr)_56px] lg:px-2 lg:py-1.5 ${
        isSelected
          ? "border-[var(--court-accent)] bg-[rgb(var(--court-accent-rgb)/0.15)] shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.35)]"
          : "border-white/15 hover:border-[var(--court-accent)] hover:bg-[rgb(var(--court-accent-rgb)/0.1)]"
      }`}
    >
      <PlayerImage
        src={getPlayerHeadshot(player)}
        alt={player.name}
        width={120}
        height={120}
        className="h-8.5 w-8.5 rounded-full object-cover lg:h-9 lg:w-9"
      />

      <span className="min-w-0">
        <span className="block font-michroma text-[7px] text-white lg:text-[10px]">
          {player.name}
        </span>
        <span className="mt-0.5 block font-michroma text-[7px] text-white/60 lg:text-[8px]">
          {player.team} · {player.position}
        </span>
      </span>

      <span className="text-right">
        <span className="block font-michroma text-[7px] text-[var(--court-accent)] lg:text-[10px]">
          {positionRating.toFixed(1)}
        </span>
        <span
          className={`mt-0.5 block font-michroma text-[7px] uppercase lg:text-[8px] ${
            positionFit === "natural"
              ? "text-emerald-400"
              : positionFit === "flex"
                ? "text-[var(--court-accent)]"
                : positionFit === "reach"
                  ? "text-yellow-400"
                  : "text-red-400"
          }`}
        >
          {fitLabel}
        </span>
      </span>
    </button>
  );
}
