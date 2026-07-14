import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { LineupSlot } from "../../court-data";
import type { PlayerRevealMode } from "./builder-lineup-helpers";
import type { BuilderStatProfileMode } from "./builder-position-helpers";
import { BuilderPlayerPicker } from "./builder-player-picker";
import { BuilderDraftBoard } from "./builder-draft-board";
import { BuilderCourtPreview } from "./builder-court-preview";
import { BuilderPositionTabs } from "./builder-position-tabs";

type Player = Parameters<
  typeof BuilderPlayerPicker
>[0]["availableBuildPlayers"][number];

type BuilderWorkspaceProps = {
  players: Player[];
  lineupPositions: LineupSlot[];
  activeBuildPosition: LineupSlot;
  customLineup: Record<LineupSlot, string>;
  buildPlayerSearch: string;
  builderStatProfile: BuilderStatProfileMode;
  availableBuildPlayers: Player[];
  averageLineupRating: number | null;
  scoutLineupRating: number | null;
  isLineupComplete: boolean;
  selectedLineupCount: number;
  playerRevealMode: PlayerRevealMode;
  onSelectPosition: (position: LineupSlot) => void;
  onSearchChange: (value: string) => void;
  onStatProfileChange: (profile: BuilderStatProfileMode) => void;
  onPickPlayer: (playerName: string) => void;
  onPlacePlayer: (playerName: string, position: LineupSlot) => void;
  onMovePlayer: (fromPosition: LineupSlot, toPosition: LineupSlot) => void;
  onRemovePlayer: (position: LineupSlot) => void;
  onScoutLineup: () => void;
  onViewCard: (playerName: string) => void;
};

const positionFitLegend = [
  {
    label: "Natural",
    description: "Ideal slot. No rating penalty.",
    color: "text-emerald-300",
  },
  {
    label: "Flex",
    description: "Realistic alternate slot. -2 OVR.",
    color: "text-[#1bc2ec]",
  },
  {
    label: "Reach",
    description: "Possible but costly slot. -5 OVR.",
    color: "text-yellow-300",
  },
  {
    label: "Mismatch",
    description: "Bad slot fit. -10 OVR.",
    color: "text-red-300",
  },
];

function PositionFitLegend() {
  const [isOpen, setIsOpen] = useState(false);
  const legendRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        legendRef.current &&
        !legendRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div ref={legendRef} className="group/fit relative z-50">
      <button
        type="button"
        aria-label="Position fit legend"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-4 items-center gap-1 rounded border border-white/15 bg-black/30 px-1.5 font-michroma text-[5px] uppercase text-white/45 transition hover:border-[#1bc2ec]/70 hover:text-[#1bc2ec] lg:h-6 lg:px-2 lg:text-[7px]"
      >
        Fit
        <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full border border-current text-[6px] lg:h-3.5 lg:w-3.5 lg:text-[8px]">
          ?
        </span>
      </button>

      <div
        className={`pointer-events-none absolute left-1/2 top-full z-50 mt-1 w-40 -translate-x-1/2 rounded border border-[#1bc2ec]/40 bg-[#020912] p-1.5 shadow-[0_0_14px_rgba(27,194,236,0.2)] transition lg:w-52 lg:p-2 ${
          isOpen
            ? "opacity-100"
            : "opacity-0 group-hover/fit:opacity-100 group-focus-within/fit:opacity-100"
        }`}
      >
        <p className="mb-1 font-michroma text-[6px] uppercase text-[#1bc2ec] lg:text-[8px]">
          Position Fit
        </p>

        <div className="grid gap-0.75 lg:gap-1">
          {positionFitLegend.map((item) => (
            <div key={item.label}>
              <p
                className={`font-michroma text-[5px] uppercase lg:text-[7px] ${item.color}`}
              >
                {item.label}
              </p>
              <p className="mt-px font-michroma text-[4.8px] leading-snug text-white/55 lg:text-[6px]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getEventPoint(event: Event) {
  if ("clientX" in event && "clientY" in event) {
    const pointerEvent = event as MouseEvent | PointerEvent;

    return {
      x: pointerEvent.clientX,
      y: pointerEvent.clientY,
    };
  }

  if (event instanceof TouchEvent && event.touches.length > 0) {
    const touch = event.touches[0];

    return {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  return null;
}

export function BuilderWorkspace({
  players,
  lineupPositions,
  activeBuildPosition,
  customLineup,
  buildPlayerSearch,
  builderStatProfile,
  availableBuildPlayers,
  averageLineupRating,
  scoutLineupRating,
  isLineupComplete,
  selectedLineupCount,
  playerRevealMode,
  onSelectPosition,
  onSearchChange,
  onStatProfileChange,
  onPickPlayer,
  onPlacePlayer,
  onMovePlayer,
  onRemovePlayer,
  onScoutLineup,
  onViewCard,
}: BuilderWorkspaceProps) {
  const [hoveredBuildPlayer, setHoveredBuildPlayer] = useState("");
  const [activeDraftPlayerName, setActiveDraftPlayerName] = useState("");
  const [dragPreviewLabel, setDragPreviewLabel] = useState("");
  const [dragPreviewPosition, setDragPreviewPosition] = useState({
    x: 0,
    y: 0,
  });
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  useEffect(() => {
    if (!dragPreviewLabel) return;

    function handlePointerMove(event: PointerEvent) {
      setDragPreviewPosition({
        x: event.clientX,
        y: event.clientY,
      });
    }

    function handleTouchMove(event: TouchEvent) {
      const touch = event.touches[0];

      if (!touch) return;

      setDragPreviewPosition({
        x: touch.clientX,
        y: touch.clientY,
      });
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [dragPreviewLabel]);

  const visibleActiveDraftPlayerName = lineupPositions.some(
    (position) => customLineup[position] === activeDraftPlayerName,
  )
    ? activeDraftPlayerName
    : "";
  const pinnedPickerPlayerName =
    visibleActiveDraftPlayerName || customLineup[activeBuildPosition];

  function handleDragStart(event: DragStartEvent) {
    const activeData = event.active.data.current as
      | {
          playerName?: string;
        }
      | undefined;
    const eventPoint = getEventPoint(event.activatorEvent);

    if (eventPoint) {
      setDragPreviewPosition(eventPoint);
    }

    setDragPreviewLabel(activeData?.playerName ?? "");
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragPreviewLabel("");

    const overData = event.over?.data.current as
      | {
          type?: string;
          slot?: LineupSlot;
        }
      | undefined;
    const activeData = event.active.data.current as
      | {
          type?: string;
          slot?: LineupSlot;
          playerName?: string;
        }
      | undefined;

    if (overData?.type !== "builder-slot" || !overData.slot) return;

    if (activeData?.type === "picker-player" && activeData.playerName) {
      onPlacePlayer(activeData.playerName, overData.slot);
      onSelectPosition(overData.slot);
      return;
    }

    if (activeData?.type === "slot-player" && activeData.slot) {
      onMovePlayer(activeData.slot, overData.slot);
      onSelectPosition(overData.slot);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDragPreviewLabel("")}
    >
      <div className="mt-3 animate-[pageEnter_220ms_ease-out_both]">
        <div className="grid grid-cols-[minmax(0,1fr)_122px] items-start gap-1 lg:grid-cols-[400px_300px_1fr] lg:gap-5">
          <div className="min-w-0">
            <div className="mb-3 flex flex-col items-center justify-center gap-1 lg:mb-2 lg:flex-row lg:gap-2">
              <div className="inline-flex rounded-md border border-white/10 bg-black/25 p-0.5">
                {(["career", "peak", "current"] as const).map((profile) => {
                  const isActive = builderStatProfile === profile;
                  const label =
                    profile === "career"
                      ? "Career"
                      : profile === "peak"
                        ? "Peak"
                        : "Current";

                  return (
                    <button
                      key={profile}
                      type="button"
                      onClick={() => onStatProfileChange(profile)}
                      className={`rounded px-1.5 py-0.5 font-michroma text-[5.5px] uppercase transition lg:px-2.5 lg:py-1 lg:text-[8px] ${
                        isActive
                          ? "bg-[#1bc2ec]/20 text-[#1bc2ec]"
                          : "text-white/35 hover:bg-white/5 hover:text-white/70"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <PositionFitLegend />
            </div>

            <BuilderPositionTabs
              lineupPositions={lineupPositions}
              activeBuildPosition={activeBuildPosition}
              customLineup={customLineup}
              onSelectPosition={onSelectPosition}
            />

            <div className="mt-2">
              <BuilderPlayerPicker
                activeBuildPosition={activeBuildPosition}
                customLineup={customLineup}
                buildPlayerSearch={buildPlayerSearch}
                builderStatProfile={builderStatProfile}
                availableBuildPlayers={availableBuildPlayers}
                allBuildPlayers={players}
                activeDraftPlayerName={pinnedPickerPlayerName}
                onSearchChange={onSearchChange}
                onPickPlayer={onPickPlayer}
              />
            </div>
          </div>

          <BuilderDraftBoard
            players={players}
            lineupPositions={lineupPositions}
            hoveredBuildPlayer={hoveredBuildPlayer}
            activeDraftPlayerName={visibleActiveDraftPlayerName}
            customLineup={customLineup}
            averageLineupRating={averageLineupRating}
            scoutLineupRating={scoutLineupRating}
            isLineupComplete={isLineupComplete}
            selectedLineupCount={selectedLineupCount}
            playerRevealMode={playerRevealMode}
            onHoverPlayer={setHoveredBuildPlayer}
            onSelectDraftPlayer={(playerName) => {
              setActiveDraftPlayerName((currentPlayerName) =>
                currentPlayerName === playerName ? "" : playerName,
              );
            }}
            onRemovePlayer={onRemovePlayer}
            onScoutLineup={onScoutLineup}
          />

          {/* Desktop court */}
          <div className="hidden lg:block">
            <BuilderCourtPreview
              players={players}
              lineupPositions={lineupPositions}
              customLineup={customLineup}
              hoveredBuildPlayer={hoveredBuildPlayer}
              playerRevealMode={playerRevealMode}
              onViewCard={onViewCard}
            />
          </div>
        </div>

        {/* Mobile court below picker + draft board */}
        <div className="mt-4 lg:hidden">
          <BuilderCourtPreview
            players={players}
            lineupPositions={lineupPositions}
            customLineup={customLineup}
            hoveredBuildPlayer={hoveredBuildPlayer}
            playerRevealMode={playerRevealMode}
            onViewCard={onViewCard}
          />
        </div>
      </div>
      {dragPreviewLabel &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed z-9999 rounded-md border border-[#1bc2ec]/80 bg-[#06131d]/95 px-2 py-1.5 font-michroma text-[5px] uppercase text-[#1bc2ec] shadow-[0_0_22px_rgba(27,194,236,0.35)] lg:px-3 lg:py-2 lg:text-xs"
            style={{
              left: dragPreviewPosition.x - 55,
              top: dragPreviewPosition.y + 15,
              transform: "translateY(-100%)",
            }}
          >
            {dragPreviewLabel}
          </div>,
          document.body,
        )}
    </DndContext>
  );
}
