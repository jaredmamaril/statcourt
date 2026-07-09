import type { LineupSlot } from "../../court-data";
import { getBuilderPlayerRating } from "./builder-position-helpers";
import { BuilderPlayerCard } from "./builder-player-card";

type Player = Parameters<typeof getBuilderPlayerRating>[0];

type BuilderPlayerPickerProps = {
  activeBuildPosition: LineupSlot;
  customLineup: Record<LineupSlot, string>;
  buildPlayerSearch: string;
  availableBuildPlayers: Player[];
  onSearchChange: (value: string) => void;
  onPickPlayer: (playerName: string) => void;
};

export function BuilderPlayerPicker({
  activeBuildPosition,
  customLineup,
  buildPlayerSearch,
  availableBuildPlayers,
  onSearchChange,
  onPickPlayer,
}: BuilderPlayerPickerProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex justify-center">
        <input
          type="text"
          value={buildPlayerSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search Player..."
          className="h-5 w-full rounded-md border border-white/15 bg-black/30 px-3 font-michroma text-[8px] text-white outline-none transition placeholder:text-white/30 focus:border-white lg:h-10 lg:text-xs"
        />
      </div>

      <div className="statcourt-scroll max-h-50 overflow-y-auto pr-1 lg:max-h-100 lg:pr-2">
        <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-3 lg:gap-2">
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
