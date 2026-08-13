import { useEffect, useRef, useState } from "react";
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
        className="flex min-h-6 min-w-9 items-center justify-center gap-0.5 rounded border border-white/20 bg-[color:color-mix(in_srgb,var(--court-panel)_86%,black)] px-1 font-michroma text-[7px] uppercase text-white/65 transition hover:border-[rgb(var(--court-accent-rgb)/0.7)] hover:text-[var(--court-accent)] lg:min-h-8 lg:min-w-12 lg:gap-1 lg:px-2 lg:text-[8px]"
      >
        Fit
        <span className="flex h-3 w-3 items-center justify-center rounded-full border border-current text-[7px] lg:h-3.5 lg:w-3.5 lg:text-[8px]">
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
  onRemovePlayer,
  onScoutLineup,
  onViewCard,
}: BuilderWorkspaceProps) {
  const [hoveredBuildPlayer, setHoveredBuildPlayer] = useState("");
  const [activeDraftPlayerName, setActiveDraftPlayerName] = useState("");

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

  return (
    <>
      <div
        onPointerDownCapture={handleWorkspacePointerDown}
        className="mt-3 animate-[pageEnter_220ms_ease-out_both]"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_122px] items-start gap-1 lg:grid-cols-[minmax(300px,384px)_minmax(220px,280px)_minmax(0,1fr)] lg:gap-4 2xl:grid-cols-[400px_300px_minmax(0,1fr)] 2xl:gap-5">
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
                      className={`min-h-6 rounded px-1.5 font-michroma text-[7px] uppercase transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--court-accent)] lg:min-h-8 lg:px-2.5 lg:py-1 lg:text-[8px] ${
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
                      className={`min-h-6 rounded px-1.5 font-michroma text-[7px] uppercase transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--court-accent)] lg:min-h-8 lg:px-2.5 lg:py-1 lg:text-[8px] ${
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
    </>
  );
}

