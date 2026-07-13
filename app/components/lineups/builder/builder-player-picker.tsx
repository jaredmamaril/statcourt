import { useCallback, useMemo, useState } from "react";
import type { LineupSlot, Player } from "../../court-data";
import type { BuilderStatProfileMode } from "./builder-position-helpers";
import { BuilderPlayerCard } from "./builder-player-card";

const DISPLAYED_BUILD_PLAYER_LIMIT = 36;
const SEARCH_BUILD_PLAYER_LIMIT = 80;

type BuilderPlayerPickerProps = {
  activeBuildPosition: LineupSlot;
  customLineup: Record<LineupSlot, string>;
  buildPlayerSearch: string;
  builderStatProfile: BuilderStatProfileMode;
  availableBuildPlayers: Player[];
  onSearchChange: (value: string) => void;
  onPickPlayer: (playerName: string) => void;
};

export function BuilderPlayerPicker({
  activeBuildPosition,
  customLineup,
  buildPlayerSearch,
  builderStatProfile,
  availableBuildPlayers,
  onSearchChange,
  onPickPlayer,
}: BuilderPlayerPickerProps) {
  const [openScoutPlayer, setOpenScoutPlayer] = useState<{
    playerId: number;
    contextKey: string;
  } | null>(null);
  const scoutContextKey = `${activeBuildPosition}-${builderStatProfile}`;
  const openScoutPlayerId =
    openScoutPlayer?.contextKey === scoutContextKey
      ? openScoutPlayer.playerId
      : null;

  const pickPlayer = useCallback((playerName: string) => {
    setOpenScoutPlayer(null);
    onPickPlayer(playerName);
  }, [onPickPlayer]);

  const toggleScoutPlayer = useCallback(
    (playerId: number) => {
      setOpenScoutPlayer((currentPlayer) =>
        currentPlayer?.playerId === playerId &&
        currentPlayer.contextKey === scoutContextKey
          ? null
          : {
              playerId,
              contextKey: scoutContextKey,
            },
      );
    },
    [scoutContextKey],
  );

  const displayedBuildPlayers = useMemo(() => {
    const displayLimit = buildPlayerSearch.trim()
      ? SEARCH_BUILD_PLAYER_LIMIT
      : DISPLAYED_BUILD_PLAYER_LIMIT;

    return availableBuildPlayers.slice(0, displayLimit);
  }, [availableBuildPlayers, buildPlayerSearch]);

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

      <p className="text-center font-michroma text-[5.5px] uppercase text-white/30 lg:text-[8px]">
        {buildPlayerSearch.trim() ? (
          <>Showing {displayedBuildPlayers.length} results</>
        ) : (
          <>
            Showing top {displayedBuildPlayers.length} of{" "}
            {availableBuildPlayers.length}
          </>
        )}
      </p>

      <div className="statcourt-scroll max-h-50 overflow-y-auto pr-1 lg:max-h-100 lg:pr-2">
        <div
          key={`${activeBuildPosition}-${builderStatProfile}`}
          className="grid grid-cols-[repeat(2,75px)] justify-center gap-1.5 lg:grid-cols-3 lg:justify-stretch lg:gap-2"
        >
          {displayedBuildPlayers.map((player, index) => {
            const isSelected =
              customLineup[activeBuildPosition] === player.name;

            return (
              <div
                key={player.id}
                className="animate-[playerListRowIn_160ms_ease-out_both]"
                style={{
                  animationDelay: `${Math.min(index, 14) * 24}ms`,
                }}
              >
                <BuilderPlayerCard
                  player={player}
                  activeBuildPosition={activeBuildPosition}
                  builderStatProfile={builderStatProfile}
                  isSelected={isSelected}
                  isScoutOpen={openScoutPlayerId === player.id}
                  onToggleScout={toggleScoutPlayer}
                  onPickPlayer={pickPlayer}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
