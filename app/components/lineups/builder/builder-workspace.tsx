import type { Position } from "../../court-data";
import type { PlayerRevealMode } from "./builder-lineup-helpers";
import { BuilderPlayerPicker } from "./builder-player-picker";
import { BuilderDraftBoard } from "./builder-draft-board";
import { BuilderCourtPreview } from "./builder-court-preview";

type Player = Parameters<
  typeof BuilderPlayerPicker
>[0]["availableBuildPlayers"][number];

type BuilderWorkspaceProps = {
  lineupPositions: Position[];
  activeBuildPosition: Position;
  customLineup: Record<Position, string>;
  buildPlayerSearch: string;
  availableBuildPlayers: Player[];
  customLineupOverall: number | null;
  isLineupComplete: boolean;
  selectedLineupCount: number;
  hoveredBuildPlayer: string;
  playerRevealMode: PlayerRevealMode;
  onSelectPosition: (position: Position) => void;
  onSearchChange: (value: string) => void;
  onPickPlayer: (playerName: string) => void;
  onHoverPlayer: (playerName: string) => void;
  onRemovePlayer: (position: Position) => void;
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
      <div className="grid items-start gap-5 lg:grid-cols-[400px_300px_1fr]">
        <BuilderPlayerPicker
          lineupPositions={lineupPositions}
          activeBuildPosition={activeBuildPosition}
          customLineup={customLineup}
          buildPlayerSearch={buildPlayerSearch}
          availableBuildPlayers={availableBuildPlayers}
          onSelectPosition={onSelectPosition}
          onSearchChange={onSearchChange}
          onPickPlayer={onPickPlayer}
        />

        <BuilderDraftBoard
          lineupPositions={lineupPositions}
          customLineup={customLineup}
          customLineupOverall={customLineupOverall}
          isLineupComplete={isLineupComplete}
          selectedLineupCount={selectedLineupCount}
          playerRevealMode={playerRevealMode}
          onHoverPlayer={onHoverPlayer}
          onRemovePlayer={onRemovePlayer}
          onScoutLineup={onScoutLineup}
        />

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
