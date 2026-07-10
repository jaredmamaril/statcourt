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
  lineupPositions: LineupSlot[];
  activeBuildPosition: LineupSlot;
  customLineup: Record<LineupSlot, string>;
  buildPlayerSearch: string;
  builderStatProfile: BuilderStatProfileMode;
  availableBuildPlayers: Player[];
  customLineupOverall: number | null;
  isLineupComplete: boolean;
  selectedLineupCount: number;
  hoveredBuildPlayer: string;
  playerRevealMode: PlayerRevealMode;
  onSelectPosition: (position: LineupSlot) => void;
  onSearchChange: (value: string) => void;
  onStatProfileChange: (profile: BuilderStatProfileMode) => void;
  onPickPlayer: (playerName: string) => void;
  onHoverPlayer: (playerName: string) => void;
  onRemovePlayer: (position: LineupSlot) => void;
  onScoutLineup: () => void;
  onViewCard: (playerName: string) => void;
};

export function BuilderWorkspace({
  lineupPositions,
  activeBuildPosition,
  customLineup,
  buildPlayerSearch,
  builderStatProfile,
  availableBuildPlayers,
  customLineupOverall,
  isLineupComplete,
  selectedLineupCount,
  hoveredBuildPlayer,
  playerRevealMode,
  onSelectPosition,
  onSearchChange,
  onStatProfileChange,
  onPickPlayer,
  onHoverPlayer,
  onRemovePlayer,
  onScoutLineup,
  onViewCard,
}: BuilderWorkspaceProps) {
  return (
    <div className="mt-3">
      <div className="grid grid-cols-[minmax(0,1fr)_122px] items-start gap-1 lg:grid-cols-[400px_300px_1fr] lg:gap-5">
        <div className="min-w-0">
          <div className="mb-2 flex justify-center">
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
          </div>

          <BuilderPositionTabs
            lineupPositions={lineupPositions}
            activeBuildPosition={activeBuildPosition}
            customLineup={customLineup}
            onSelectPosition={onSelectPosition}
          />

          <div className="mt-2">
            <BuilderPlayerPicker
              key={activeBuildPosition}
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
          lineupPositions={lineupPositions}
          hoveredBuildPlayer={hoveredBuildPlayer}
          customLineup={customLineup}
          customLineupOverall={customLineupOverall}
          isLineupComplete={isLineupComplete}
          selectedLineupCount={selectedLineupCount}
          playerRevealMode={playerRevealMode}
          onHoverPlayer={onHoverPlayer}
          onRemovePlayer={onRemovePlayer}
          onScoutLineup={onScoutLineup}
        />

        {/* Desktop court */}
        <div className="hidden lg:block">
          <BuilderCourtPreview
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
