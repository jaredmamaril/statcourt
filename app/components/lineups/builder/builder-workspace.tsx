import type { LineupSlot } from "../../court-data";
import type { PlayerRevealMode } from "./builder-lineup-helpers";
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
  availableBuildPlayers: Player[];
  customLineupOverall: number | null;
  isLineupComplete: boolean;
  selectedLineupCount: number;
  hoveredBuildPlayer: string;
  playerRevealMode: PlayerRevealMode;
  onSelectPosition: (position: LineupSlot) => void;
  onSearchChange: (value: string) => void;
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
  availableBuildPlayers,
  customLineupOverall,
  isLineupComplete,
  selectedLineupCount,
  hoveredBuildPlayer,
  playerRevealMode,
  onSelectPosition,
  onSearchChange,
  onPickPlayer,
  onHoverPlayer,
  onRemovePlayer,
  onScoutLineup,
  onViewCard,
}: BuilderWorkspaceProps) {
  return (
    <div className="mt-3">
      <div className="grid grid-cols-[minmax(0,1fr)_135px] items-start gap-2 lg:grid-cols-[400px_300px_1fr] lg:gap-5">
        <div className="min-w-0">
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
