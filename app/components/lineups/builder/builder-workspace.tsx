import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  closestCenter,
  DndContext,
  KeyboardCode,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
  type ScreenReaderInstructions,
} from "@dnd-kit/core";
import type { LineupSlot } from "../../court-data";
import type { PlayerRevealMode } from "./builder-lineup-helpers";
import type { BuilderStatProfileMode } from "./builder-position-helpers";
import { BuilderPlayerPicker } from "./builder-player-picker";
import { BuilderDraftBoard } from "./builder-draft-board";
import { BuilderCourtPreview } from "./builder-court-preview";
import { BuilderPositionTabs } from "./builder-position-tabs";
import type { DefaultPlayerView } from "../../../lib/use-user-settings";

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
  displayView: DefaultPlayerView;
  availableBuildPlayers: Player[];
  averageLineupRating: number | null;
  scoutLineupRating: number | null;
  isLineupComplete: boolean;
  selectedLineupCount: number;
  playerRevealMode: PlayerRevealMode;
  onSelectPosition: (position: LineupSlot) => void;
  onSearchChange: (value: string) => void;
  onStatProfileChange: (profile: BuilderStatProfileMode) => void;
  onDisplayViewChange: (view: DefaultPlayerView) => void;
  onPickPlayer: (playerName: string) => void;
  onPlacePlayer: (playerName: string, position: LineupSlot) => void;
  onMovePlayer: (fromPosition: LineupSlot, toPosition: LineupSlot) => void;
  onRemovePlayer: (position: LineupSlot) => void;
  onScoutLineup: () => void;
  onViewCard: (playerName: string) => void;
};

const slotLabels: Record<LineupSlot, string> = {
  PG: "Point Guard",
  SG: "Shooting Guard",
  SF: "Small Forward",
  PF: "Power Forward",
  C: "Center",
};

const builderScreenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    "Press Space or Enter to pick up a player. Use arrow keys to choose a lineup position. Press Space or Enter again to place the player, or Escape to cancel.",
};

function getDragPlayerName(activeData: unknown) {
  const data = activeData as { playerName?: string } | undefined;

  return data?.playerName ?? "player";
}

function getOverSlotLabel(overData: unknown) {
  const data = overData as { slot?: LineupSlot } | undefined;
  const slot = data?.slot;

  return slot ? `${slotLabels[slot]} slot` : "lineup slot";
}

const builderAnnouncements: Announcements = {
  onDragStart({ active }) {
    return `Picked up ${getDragPlayerName(
      active.data.current,
    )}. Use arrow keys to choose a lineup position.`;
  },
  onDragOver({ active, over }) {
    if (!over) return undefined;

    return `${getDragPlayerName(active.data.current)} over ${getOverSlotLabel(
      over.data.current,
    )}.`;
  },
  onDragEnd({ active, over }) {
    if (!over) return `${getDragPlayerName(active.data.current)} was not placed.`;

    return `${getDragPlayerName(active.data.current)} placed in ${getOverSlotLabel(
      over.data.current,
    )}.`;
  },
  onDragCancel({ active }) {
    return `Move cancelled for ${getDragPlayerName(active.data.current)}.`;
  },
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
    color: "text-[var(--court-accent)]",
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

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const tooltipId = "builder-position-fit-legend-tooltip";

  return (
    <div ref={legendRef} className="group/fit relative z-50">
      <button
        type="button"
        aria-label="Position fit legend"
        aria-controls={tooltipId}
        aria-describedby={tooltipId}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
        className="flex min-h-8 min-w-12 items-center justify-center gap-1 rounded border border-white/20 bg-[color:color-mix(in_srgb,var(--court-panel)_86%,black)] px-1.5 font-michroma text-[8px] uppercase text-white/65 transition hover:border-[rgb(var(--court-accent-rgb)/0.7)] hover:text-[var(--court-accent)] lg:min-h-8 lg:px-2 lg:text-[8px]"
      >
        Fit
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-current text-[8px]">
          ?
        </span>
      </button>

      <div
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 top-full z-50 mt-1 w-40 -translate-x-1/2 rounded border border-[rgb(var(--court-accent-rgb)/0.4)] bg-[#020912] p-1.5 shadow-[0_0_14px_rgb(var(--court-accent-rgb)/0.2)] transition lg:w-52 lg:p-2 ${
          isOpen
            ? "opacity-100"
            : "opacity-0 group-hover/fit:opacity-100 group-focus-within/fit:opacity-100"
        }`}
      >
        <p className="mb-1 font-michroma text-[6px] uppercase text-[var(--court-accent)] lg:text-[8px]">
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

function getSlotFromDroppableId(id: unknown): LineupSlot | null {
  if (typeof id !== "string" || !id.startsWith("builder-slot-")) {
    return null;
  }

  return id.replace("builder-slot-", "") as LineupSlot;
}

export function BuilderWorkspace({
  players,
  lineupPositions,
  activeBuildPosition,
  customLineup,
  buildPlayerSearch,
  builderStatProfile,
  displayView,
  availableBuildPlayers,
  averageLineupRating,
  scoutLineupRating,
  isLineupComplete,
  selectedLineupCount,
  playerRevealMode,
  onSelectPosition,
  onSearchChange,
  onStatProfileChange,
  onDisplayViewChange,
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
  const keyboardCoordinateGetter = useMemo<KeyboardCoordinateGetter>(
    () =>
      (event, { context }) => {
        if (
          event.code !== KeyboardCode.Down &&
          event.code !== KeyboardCode.Right &&
          event.code !== KeyboardCode.Up &&
          event.code !== KeyboardCode.Left
        ) {
          return undefined;
        }

        const activeData = context.active?.data.current as
          | {
              slot?: LineupSlot;
              preferredSlot?: LineupSlot;
            }
          | undefined;
        const overSlot = getSlotFromDroppableId(context.over?.id);
        const sourceSlot = activeData?.slot ?? activeData?.preferredSlot;
        const currentSlot = overSlot ?? sourceSlot ?? lineupPositions[0];
        const currentIndex = Math.max(
          lineupPositions.indexOf(currentSlot),
          0,
        );
        const lastIndex = lineupPositions.length - 1;
        const nextIndex =
          overSlot === null
            ? currentIndex
            : event.code === KeyboardCode.Down ||
                event.code === KeyboardCode.Right
              ? currentIndex === lastIndex
                ? 0
                : currentIndex + 1
              : currentIndex === 0
                ? lastIndex
                : currentIndex - 1;
        const nextSlot = lineupPositions[nextIndex];
        const targetRect = context.droppableRects.get(`builder-slot-${nextSlot}`);
        const activeRect = context.draggingNodeRect;

        if (!targetRect || !activeRect) {
          return undefined;
        }

        return {
          x:
            targetRect.left +
            targetRect.width / 2 -
            (activeRect.left + activeRect.width / 2),
          y:
            targetRect.top +
            targetRect.height / 2 -
            (activeRect.top + activeRect.height / 2),
        };
      },
    [lineupPositions],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: keyboardCoordinateGetter,
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

  function handleWorkspacePointerDown(event: React.PointerEvent) {
    if (!activeDraftPlayerName) return;

    const target = event.target as HTMLElement;

    if (target.closest("[data-builder-draft-slot='true']")) {
      return;
    }

    setActiveDraftPlayerName("");
  }

  function handleDragStart(event: DragStartEvent) {
    const activeData = event.active.data.current as
      | {
          playerName?: string;
        }
      | undefined;
    const eventPoint = getEventPoint(event.activatorEvent);

    if (eventPoint) {
      setDragPreviewPosition(eventPoint);
      setDragPreviewLabel(activeData?.playerName ?? "");
    } else {
      setDragPreviewLabel("");
    }
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
      accessibility={{
        announcements: builderAnnouncements,
        screenReaderInstructions: builderScreenReaderInstructions,
      }}
      collisionDetection={closestCenter}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDragPreviewLabel("")}
    >
      <div
        onPointerDownCapture={handleWorkspacePointerDown}
        className="mt-3 animate-[pageEnter_220ms_ease-out_both]"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_122px] items-start gap-1 lg:grid-cols-[minmax(260px,360px)_minmax(220px,280px)_minmax(0,1fr)] lg:gap-4 2xl:grid-cols-[400px_300px_minmax(0,1fr)] 2xl:gap-5">
          <div className="min-w-0">
            <div className="mb-3 flex flex-col items-center justify-center gap-1 lg:mb-2 lg:flex-row lg:gap-2">
              <div
                aria-label="Builder stat profile"
                className="inline-flex rounded-md border border-white/15 bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] p-0.5"
                role="group"
              >
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
                      aria-pressed={isActive}
                      type="button"
                      onClick={() => onStatProfileChange(profile)}
                      className={`min-h-8 rounded px-2 font-michroma text-[8px] uppercase transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--court-accent)] lg:px-2.5 lg:py-1 lg:text-[8px] ${
                        isActive
                          ? "bg-[rgb(var(--court-accent-rgb)/0.34)] text-[var(--court-accent)] shadow-[0_0_12px_rgb(var(--court-accent-rgb)/0.16)]"
                          : "text-white/35 hover:bg-white/5 hover:text-white/70"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div
                aria-label="Builder player display"
                className="inline-flex rounded-md border border-white/15 bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] p-0.5"
                role="group"
              >
                {(["cards", "list"] as const).map((view) => {
                  const isActive = displayView === view;

                  return (
                    <button
                      key={view}
                      aria-pressed={isActive}
                      type="button"
                      onClick={() => onDisplayViewChange(view)}
                      className={`min-h-8 rounded px-2 font-michroma text-[8px] uppercase transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--court-accent)] lg:px-2.5 lg:py-1 lg:text-[8px] ${
                        isActive
                          ? "bg-[rgb(var(--court-accent-rgb)/0.34)] text-[var(--court-accent)] shadow-[0_0_12px_rgb(var(--court-accent-rgb)/0.16)]"
                          : "text-white/35 hover:bg-white/5 hover:text-white/70"
                      }`}
                    >
                      {view}
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
                displayView={displayView}
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
            onSelectDraftPlayer={(playerName, position, isSelected) => {
              onSelectPosition(position);
              setActiveDraftPlayerName(isSelected ? "" : playerName);
            }}
            onRemovePlayer={onRemovePlayer}
            onScoutLineup={onScoutLineup}
          />

          {/* Desktop court */}
          <div className="hidden min-w-0 lg:block">
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
            className="pointer-events-none fixed z-9999 rounded-md border border-[rgb(var(--court-accent-rgb)/0.8)] bg-[color:color-mix(in_srgb,var(--court-panel)_95%,transparent)] px-2 py-1.5 font-michroma text-[5px] uppercase text-[var(--court-accent)] shadow-[0_0_22px_rgb(var(--court-accent-rgb)/0.35)] lg:px-3 lg:py-2 lg:text-xs"
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

