import { useCallback, useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
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

const DISPLAYED_BUILD_PLAYER_LIMIT = 20;
const SEARCH_BUILD_PLAYER_LIMIT = 20;

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
    const displayLimit = buildPlayerSearch.trim()
      ? SEARCH_BUILD_PLAYER_LIMIT
      : DISPLAYED_BUILD_PLAYER_LIMIT;

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
    buildPlayerSearch,
  ]);

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex justify-center">
        <input
          type="text"
          value={buildPlayerSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search Player..."
          className="h-5 w-51 rounded-md border border-white/15 bg-black/30 px-3 font-michroma text-[8px] text-white outline-none transition placeholder:text-white/30 focus:border-white lg:h-10 lg:w-full lg:text-xs"
        />
      </div>

      <p className="text-center font-michroma text-[5.5px] uppercase text-white/30 lg:text-[8px]">
        {buildPlayerSearch.trim() ? (
          <>Showing {displayedBuildPlayers.length} results</>
        ) : (
          <>
            Showing top {displayedBuildPlayers.length} of{" "}
            {availableBuildPlayers.length}
          </>
        )}
      </p>

      <div className="statcourt-scroll max-h-26 w-full overflow-y-auto pr-1 lg:max-h-84 lg:pr-2">
        <div
          key={`${activeBuildPosition}-${builderStatProfile}-${displayView}`}
          className={
            isCardView
              ? "grid grid-cols-[repeat(2,75px)] justify-center gap-1.5 lg:grid-cols-3 lg:justify-stretch lg:gap-2"
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
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `builder-player-${player.id}`,
    data: {
      type: "picker-player",
      playerName: player.name,
    },
  });
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
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      onClick={() => onPickPlayer(player.name)}
      className={`grid w-full min-w-0 touch-none grid-cols-[34px_minmax(0,1fr)_52px] items-center gap-2 rounded-md border bg-black/30 px-2 py-1.5 text-left transition lg:grid-cols-[46px_minmax(0,1fr)_70px] lg:px-3 lg:py-2 ${
        isSelected
          ? "border-[#1bc2ec] bg-[#1bc2ec]/15 shadow-[0_0_18px_rgba(27,194,236,0.35)]"
          : isDragging
            ? "border-[#1bc2ec] bg-[#1bc2ec]/15 opacity-45 shadow-[0_0_22px_rgba(27,194,236,0.35)]"
            : "border-white/15 hover:border-[#1bc2ec] hover:bg-[#1bc2ec]/10"
      }`}
    >
      <PlayerImage
        src={getPlayerHeadshot(player)}
        alt={player.name}
        width={120}
        height={120}
        className="h-8.5 w-8.5 rounded-full object-cover lg:h-11 lg:w-11"
      />

      <span className="min-w-0">
        <span className="block  font-michroma text-[6px] text-white lg:text-[10px]">
          {player.name}
        </span>
        <span className="mt-0.5 block font-michroma text-[5px] text-white/40 lg:text-[8px]">
          {player.team} · {player.position}
        </span>
      </span>

      <span className="text-right">
        <span className="block font-michroma text-[7px] text-[#1bc2ec] lg:text-[10px]">
          {positionRating.toFixed(1)}
        </span>
        <span
          className={`mt-0.5 block font-michroma text-[4.8px] uppercase lg:text-[7px] ${
            positionFit === "natural"
              ? "text-emerald-400"
              : positionFit === "flex"
                ? "text-[#1bc2ec]"
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
