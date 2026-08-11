import { memo, useMemo } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { LineupSlot, Player } from "../../court-data";
import {
  getPlayerRevealDelay,
  type PlayerRevealMode,
} from "./builder-lineup-helpers";

type BuilderDraftBoardProps = {
  players: Player[];
  lineupPositions: LineupSlot[];
  hoveredBuildPlayer: string;
  activeDraftPlayerName: string;
  customLineup: Record<LineupSlot, string>;
  averageLineupRating: number | null;
  scoutLineupRating: number | null;
  isLineupComplete: boolean;
  selectedLineupCount: number;
  playerRevealMode: PlayerRevealMode;
  onHoverPlayer: (playerName: string) => void;
  onSelectDraftPlayer: (
    playerName: string,
    position: LineupSlot,
    isSelected: boolean,
  ) => void;
  onRemovePlayer: (position: LineupSlot) => void;
  onScoutLineup: () => void;
};

type BuilderDraftSlotProps = {
  position: LineupSlot;
  player: Player | undefined;
  playerName: string;
  positionIndex: number;
  playerRevealMode: PlayerRevealMode;
  hoveredBuildPlayer: string;
  activeDraftPlayerName: string;
  onHoverPlayer: (playerName: string) => void;
  onSelectDraftPlayer: (
    playerName: string,
    position: LineupSlot,
    isSelected: boolean,
  ) => void;
  onRemovePlayer: (position: LineupSlot) => void;
};

const slotLabels: Record<LineupSlot, string> = {
  PG: "Point Guard",
  SG: "Shooting Guard",
  SF: "Small Forward",
  PF: "Power Forward",
  C: "Center",
};

function BuilderDraftSlot({
  position,
  player,
  playerName,
  positionIndex,
  playerRevealMode,
  hoveredBuildPlayer,
  activeDraftPlayerName,
  onHoverPlayer,
  onSelectDraftPlayer,
  onRemovePlayer,
}: BuilderDraftSlotProps) {
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: `builder-slot-${position}`,
    data: {
      type: "builder-slot",
      slot: position,
    },
  });
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    isDragging,
  } = useDraggable({
    id: `builder-slot-player-${position}`,
    disabled: !player,
    data: {
      type: "slot-player",
      slot: position,
      playerName,
    },
  });
  const isActiveDraftPlayer = Boolean(
    player && player.name === activeDraftPlayerName,
  );
  const isHighlighted =
    player && (player.name === hoveredBuildPlayer || isActiveDraftPlayer);
  const slotLabel = slotLabels[position];
  const slotAccessibleName = player
    ? `${slotLabel} slot, occupied by ${player.name}. Press Space or Enter to move this player.`
    : `${slotLabel} slot, empty.`;

  function setNodeRef(node: HTMLDivElement | null) {
    setDroppableNodeRef(node);
    setDraggableNodeRef(node);
  }

  return (
    <div
      ref={setNodeRef}
      data-builder-draft-slot="true"
      key={`${position}-${playerName || "empty"}`}
      style={{
        animationDelay: getPlayerRevealDelay(playerRevealMode, positionIndex),
      }}
      {...(player ? listeners : {})}
      {...(player ? attributes : { role: "group" })}
      aria-label={slotAccessibleName}
      onClick={() => {
        if (!player) return;

        onSelectDraftPlayer(player.name, position, isActiveDraftPlayer);
      }}
      onMouseEnter={() => {
        if (player) {
          onHoverPlayer(player.name);
        }
      }}
      onMouseLeave={() => onHoverPlayer("")}
      className={`animate-[loadedPlayerReveal_360ms_ease-out_both] grid h-fit touch-none grid-cols-[15px_1fr_auto] items-center gap-0.5 rounded-md border px-1 py-2 transition lg:grid-cols-[44px_1fr_auto] lg:gap-2 lg:px-3 lg:py-2 ${
        isDragging
          ? "border-[rgb(var(--court-accent-rgb)/0.9)] bg-[rgb(var(--court-accent-rgb)/0.2)] opacity-45 shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.45)]"
          : isOver
            ? "border-[rgb(var(--court-accent-rgb)/0.9)] bg-[rgb(var(--court-accent-rgb)/0.2)] shadow-[0_0_16px_rgb(var(--court-accent-rgb)/0.35)]"
            : isHighlighted
              ? "border-[rgb(var(--court-accent-rgb)/0.8)] bg-[rgb(var(--court-accent-rgb)/0.15)] shadow-[0_0_16px_rgb(var(--court-accent-rgb)/0.35)]"
              : player
                ? "border-emerald-400/50 bg-emerald-400/10 hover:border-[rgb(var(--court-accent-rgb)/0.7)] hover:bg-[rgb(var(--court-accent-rgb)/0.1)]"
                : "border-white/15 bg-[color:color-mix(in_srgb,var(--court-panel)_86%,black)]"
      }`}
    >
      <span
        className={`font-michroma text-[8px] lg:text-sm ${
          player ? "text-emerald-400" : "text-white/60"
        }`}
      >
        {position}
      </span>

      <div>
        <p className="max-w-13 truncate font-michroma text-[8px] text-white lg:max-w-44 lg:text-sm">
          {player ? player.name : "Select Player"}
        </p>

        <p className="mt-0.5 font-michroma text-[7px] text-white/60 lg:mt-1 lg:text-[10px]">
          {player ? `${player.team} - #${player.jerseyNumber}` : "Empty"}
        </p>
      </div>

      {player && (
        <button
          type="button"
          aria-label={`Remove ${player.name} from ${slotLabel}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemovePlayer(position);
            onHoverPlayer("");
            onSelectDraftPlayer("", position, false);
          }}
          className="font-michroma text-[9px] text-white/40 transition hover:text-red-400 lg:text-xs"
        >
          x
        </button>
      )}
    </div>
  );
}

function BuilderDraftBoardComponent({
  players,
  lineupPositions,
  hoveredBuildPlayer,
  activeDraftPlayerName,
  customLineup,
  averageLineupRating,
  scoutLineupRating,
  isLineupComplete,
  selectedLineupCount,
  playerRevealMode,
  onHoverPlayer,
  onSelectDraftPlayer,
  onRemovePlayer,
  onScoutLineup,
}: BuilderDraftBoardProps) {
  const playersByName = useMemo(
    () => new Map(players.map((player) => [player.name, player])),
    [players],
  );

  return (
    <div className="rounded-md border border-white/15 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-1 lg:p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-michroma text-[8px] uppercase text-white/65 lg:text-[10px]">
            Your Lineup
          </p>

          <h2 className="mt-0.5 font-michroma text-[8px] text-white lg:mt-1 lg:text-lg">
            Draft Board
          </h2>
        </div>

        <div className="flex items-center gap-2 text-center">
          <div>
            <p className="font-michroma text-[7px] uppercase text-white/65 lg:text-[9px]">
              Avg
            </p>

            <p
              key={averageLineupRating?.toFixed(1) ?? "--"}
              className="animate-[ovrRise_250ms_ease-out] font-michroma text-[9px] text-[var(--court-accent)] lg:text-xl"
            >
              {averageLineupRating ? averageLineupRating.toFixed(1) : "--"}
            </p>
          </div>

          {isLineupComplete && (
            <div>
              <p className="font-michroma text-[7px] uppercase text-white/65 lg:text-[9px]">
                Scout
              </p>

              <p
                key={scoutLineupRating?.toFixed(1) ?? "--"}
                className="animate-[ovrRise_250ms_ease-out] font-michroma text-[9px] text-yellow-300 lg:text-xl"
              >
                {scoutLineupRating ? scoutLineupRating.toFixed(1) : "--"}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-1.5 grid gap-1 lg:mt-4 lg:gap-2">
        {lineupPositions.map((position) => {
          const playerName = customLineup[position];
          const player = playersByName.get(playerName);
          const positionIndex = lineupPositions.indexOf(position);

          return (
            <BuilderDraftSlot
              key={position}
              position={position}
              player={player}
              playerName={playerName}
              positionIndex={positionIndex}
              playerRevealMode={playerRevealMode}
              hoveredBuildPlayer={hoveredBuildPlayer}
              activeDraftPlayerName={activeDraftPlayerName}
              onHoverPlayer={onHoverPlayer}
              onSelectDraftPlayer={onSelectDraftPlayer}
              onRemovePlayer={onRemovePlayer}
            />
          );
        })}

        <button
          type="button"
          disabled={!isLineupComplete}
          onClick={onScoutLineup}
          className={`mx-auto rounded-md border px-1.5 py-1 font-michroma text-[8px] uppercase transition lg:px-8 lg:py-5 lg:text-[16px] ${
            isLineupComplete
              ? "cursor-pointer border-[rgb(var(--court-accent-rgb)/0.7)] bg-[rgb(var(--court-accent-rgb)/0.1)] font-bold text-[var(--court-accent)] shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.35)] hover:bg-[rgb(var(--court-accent-rgb)/0.2)]"
              : "cursor-not-allowed border-white/10 bg-white/5 text-white/60"
          }`}
        >
          {isLineupComplete
            ? "Scout Lineup"
            : `${selectedLineupCount}/${lineupPositions.length} Selected`}
        </button>
      </div>
    </div>
  );
}

export const BuilderDraftBoard = memo(BuilderDraftBoardComponent);
