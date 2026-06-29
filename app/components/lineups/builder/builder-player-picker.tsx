import type { LineupSlot } from "../../court-data";
import { getBuilderPlayerRating } from "./builder-position-helpers";
import { BuilderPlayerCard } from "./builder-player-card";
import { BuilderPositionTabs } from "./builder-position-tabs";

type Player = Parameters<typeof getBuilderPlayerRating>[0];

type BuilderPlayerPickerProps = {
  lineupPositions: LineupSlot[];
  activeBuildPosition: LineupSlot;
  customLineup: Record<LineupSlot, string>;
  buildPlayerSearch: string;
  availableBuildPlayers: Player[];
  onSelectPosition: (position: LineupSlot) => void;
  onSearchChange: (value: string) => void;
  onPickPlayer: (playerName: string) => void;
};

export function BuilderPlayerPicker({
  lineupPositions,
  activeBuildPosition,
  customLineup,
  buildPlayerSearch,
  availableBuildPlayers,
  onSelectPosition,
  onSearchChange,
  onPickPlayer,
}: BuilderPlayerPickerProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <BuilderPositionTabs
        lineupPositions={lineupPositions}
        activeBuildPosition={activeBuildPosition}
        customLineup={customLineup}
        onSelectPosition={onSelectPosition}
      />

      <div className="flex justify-center">
        <input
          type="text"
          value={buildPlayerSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search Player..."
          className="w-full max-w-md rounded-md border border-white/15 bg-black/30 px-4 py-3 font-michroma text-xs text-white outline-none transition placeholder:text-white/30 focus:border-white"
        />
      </div>

      <div className="overflow-y-auto pr-2" style={{ maxHeight: "392px" }}>
        <div className="grid grid-cols-3 gap-2">
          {availableBuildPlayers.map((player) => {
            const isSelected =
              customLineup[activeBuildPosition] === player.name;

            return (
              <BuilderPlayerCard
                key={player.id}
                player={player}
                activeBuildPosition={activeBuildPosition}
                isSelected={isSelected}
                onPickPlayer={onPickPlayer}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
