import { useState } from "react";
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
  const [openScoutPlayerId, setOpenScoutPlayerId] = useState<number | null>(
    null,
  );

  function pickPlayer(playerName: string) {
    setOpenScoutPlayerId(null);
    onPickPlayer(playerName);
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex justify-center">
        <input
          type="text"
          value={buildPlayerSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search Player..."
          className="h-5 w-51 rounded-md border border-white/15 bg-black/30 px-3 font-michroma text-[8px] text-white outline-none transition placeholder:text-white/30 focus:border-white lg:h-10 lg:w-full lg:text-xs"
        />
      </div>

      <div className="statcourt-scroll max-h-50 overflow-y-auto pr-1 lg:max-h-100 lg:pr-2">
        <div className="grid grid-cols-[repeat(2,75px)] justify-center gap-1.5 lg:grid-cols-3 lg:justify-stretch lg:gap-2">
          {availableBuildPlayers.map((player) => {
            const isSelected =
              customLineup[activeBuildPosition] === player.name;

            return (
              <BuilderPlayerCard
                key={player.id}
                player={player}
                activeBuildPosition={activeBuildPosition}
                isSelected={isSelected}
                isScoutOpen={openScoutPlayerId === player.id}
                onToggleScout={() => {
                  setOpenScoutPlayerId((currentPlayerId) =>
                    currentPlayerId === player.id ? null : player.id,
                  );
                }}
                onPickPlayer={pickPlayer}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
