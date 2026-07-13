import { useEffect, useRef, useState } from "react";
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
  builderLineupRating: number | null;
  isLineupComplete: boolean;
  selectedLineupCount: number;
  playerRevealMode: PlayerRevealMode;
  onSelectPosition: (position: LineupSlot) => void;
  onSearchChange: (value: string) => void;
  onStatProfileChange: (profile: BuilderStatProfileMode) => void;
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
              <p className="mt-0.25 font-michroma text-[4.8px] leading-snug text-white/55 lg:text-[6px]">
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
  availableBuildPlayers,
  builderLineupRating,
  isLineupComplete,
  selectedLineupCount,
  playerRevealMode,
  onSelectPosition,
  onSearchChange,
  onStatProfileChange,
  onPickPlayer,
  onRemovePlayer,
  onScoutLineup,
  onViewCard,
}: BuilderWorkspaceProps) {
  const [hoveredBuildPlayer, setHoveredBuildPlayer] = useState("");

  return (
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
              onSearchChange={onSearchChange}
              onPickPlayer={onPickPlayer}
            />
          </div>
        </div>

        <BuilderDraftBoard
          players={players}
          lineupPositions={lineupPositions}
          hoveredBuildPlayer={hoveredBuildPlayer}
          customLineup={customLineup}
          builderLineupRating={builderLineupRating}
          isLineupComplete={isLineupComplete}
          selectedLineupCount={selectedLineupCount}
          playerRevealMode={playerRevealMode}
          onHoverPlayer={setHoveredBuildPlayer}
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
  );
}
