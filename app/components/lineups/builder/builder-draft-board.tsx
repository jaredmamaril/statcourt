import { memo, useMemo } from "react";
import type { LineupSlot, Player } from "../../court-data";
import {
  getPlayerRevealDelay,
  type PlayerRevealMode,
} from "./builder-lineup-helpers";

type BuilderDraftBoardProps = {
  players: Player[];
  lineupPositions: LineupSlot[];
  hoveredBuildPlayer: string;
  customLineup: Record<LineupSlot, string>;
  builderLineupRating: number | null;
  isLineupComplete: boolean;
  selectedLineupCount: number;
  playerRevealMode: PlayerRevealMode;
  onHoverPlayer: (playerName: string) => void;
  onRemovePlayer: (position: LineupSlot) => void;
  onScoutLineup: () => void;
};

function BuilderDraftBoardComponent({
  players,
  lineupPositions,
  hoveredBuildPlayer,
  customLineup,
  builderLineupRating,
  isLineupComplete,
  selectedLineupCount,
  playerRevealMode,
  onHoverPlayer,
  onRemovePlayer,
  onScoutLineup,
}: BuilderDraftBoardProps) {
  const playersByName = useMemo(
    () => new Map(players.map((player) => [player.name, player])),
    [players],
  );

  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-1 lg:p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-michroma text-[6px] uppercase text-white/40 lg:text-[10px]">
            Your Lineup
          </p>

          <h2 className="mt-0.5 font-michroma text-[8px] text-white lg:mt-1 lg:text-lg">
            Draft Board
          </h2>
        </div>

        <div className="text-center">
          <p className="font-michroma text-[6px] uppercase text-white/40 lg:text-[10px]">
            OVR
          </p>

          <p
            key={builderLineupRating?.toFixed(1) ?? "--"}
            className="animate-[ovrRise_250ms_ease-out] font-michroma text-xs text-[#1bc2ec] lg:text-2xl"
          >
            {builderLineupRating ? builderLineupRating.toFixed(1) : "--"}
          </p>
        </div>
      </div>

      <div className="mt-1.5 grid gap-1 lg:mt-4 lg:gap-2">
        {lineupPositions.map((position) => {
          const playerName = customLineup[position];
          const player = playersByName.get(playerName);
          const positionIndex = lineupPositions.indexOf(position);
          const isHighlighted = player && player.name === hoveredBuildPlayer;

          return (
            <div
              key={`${position}-${playerName || "empty"}`}
              style={{
                animationDelay: getPlayerRevealDelay(
                  playerRevealMode,
                  positionIndex,
                ),
              }}
              onClick={() => {
                if (!player) return;

                onHoverPlayer(
                  hoveredBuildPlayer === player.name ? "" : player.name,
                );
              }}
              onMouseEnter={() => {
                if (player) {
                  onHoverPlayer(player.name);
                }
              }}
              onMouseLeave={() => onHoverPlayer("")}
              className={`animate-[loadedPlayerReveal_360ms_ease-out_both] grid h-fit grid-cols-[15px_1fr_auto] items-center gap-0.5 rounded-md border px-1 py-2 transition lg:grid-cols-[44px_1fr_auto] lg:gap-2 lg:px-3 lg:py-2 ${
                isHighlighted
                  ? "border-[#1bc2ec]/80 bg-[#1bc2ec]/15 shadow-[0_0_16px_rgba(27,194,236,0.35)]"
                  : player
                    ? "border-emerald-400/50 bg-emerald-400/10 hover:border-[#1bc2ec]/70 hover:bg-[#1bc2ec]/10"
                    : "border-white/10 bg-black/20"
              }`}
            >
              <span
                className={`font-michroma text-[6px] lg:text-sm ${
                  player ? "text-emerald-400" : "text-white/40"
                }`}
              >
                {position}
              </span>

              <div>
                <p className="max-w-13 truncate font-michroma text-[6px] text-white lg:max-w-44 lg:text-sm">
                  {player ? player.name : "Select Player"}
                </p>

                <p className="mt-0.5 font-michroma text-[5px] text-white/35 lg:mt-1 lg:text-[10px]">
                  {player
                    ? `${player.team} - #${player.jerseyNumber}`
                    : "Empty"}
                </p>
              </div>

              {player && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemovePlayer(position);
                    onHoverPlayer("");
                  }}
                  className="font-michroma text-[9px] text-white/40 transition hover:text-red-400 lg:text-xs"
                >
                  x
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          disabled={!isLineupComplete}
          onClick={onScoutLineup}
          className={`mx-auto rounded-md border px-1.5 py-1 font-michroma text-[5.5px] uppercase transition lg:px-8 lg:py-5 lg:text-[16px] ${
            isLineupComplete
              ? "cursor-pointer border-[#1bc2ec]/70 bg-[#1bc2ec]/10 font-bold text-[#1bc2ec] shadow-[0_0_18px_rgba(27,194,236,0.35)] hover:bg-[#1bc2ec]/20"
              : "cursor-not-allowed border-white/10 bg-white/5 text-white/30"
          }`}
        >
          {isLineupComplete
            ? "Scout Lineup"
            : `${selectedLineupCount}/${lineupPositions.length} Selected`}
        </button>
      </div>
    </div>
  );
}

export const BuilderDraftBoard = memo(BuilderDraftBoardComponent);
