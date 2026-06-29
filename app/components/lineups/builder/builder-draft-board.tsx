import type { LineupSlot } from "../../court-data";
import { players } from "../../court-data";
import {
  getPlayerRevealDelay,
  type PlayerRevealMode,
} from "./builder-lineup-helpers";

type BuilderDraftBoardProps = {
  lineupPositions: LineupSlot[];
  customLineup: Record<LineupSlot, string>;
  customLineupOverall: number | null;
  isLineupComplete: boolean;
  selectedLineupCount: number;
  playerRevealMode: PlayerRevealMode;
  onHoverPlayer: (playerName: string) => void;
  onRemovePlayer: (position: LineupSlot) => void;
  onScoutLineup: () => void;
};

export function BuilderDraftBoard({
  lineupPositions,
  customLineup,
  customLineupOverall,
  isLineupComplete,
  selectedLineupCount,
  playerRevealMode,
  onHoverPlayer,
  onRemovePlayer,
  onScoutLineup,
}: BuilderDraftBoardProps) {
  return (
    <div
      className="rounded-md border border-white/10 bg-black/20 p-4"
      style={{ height: "480px" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-michroma text-[10px] uppercase text-white/40">
            Your Lineup
          </p>

          <h2 className="mt-1 font-michroma text-lg text-white">Draft Board</h2>
        </div>

        <div className="text-center">
          <p className="font-michroma text-[10px] uppercase text-white/40">
            OVR
          </p>

          <p
            key={customLineupOverall?.toFixed(1) ?? "--"}
            className="animate-[ovrRise_250ms_ease-out] font-michroma text-2xl text-[#1bc2ec]"
          >
            {customLineupOverall ? customLineupOverall.toFixed(1) : "--"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {lineupPositions.map((position) => {
          const playerName = customLineup[position];
          const player = players.find((player) => player.name === playerName);
          const positionIndex = lineupPositions.indexOf(position);

          return (
            <div
              key={`${position}-${playerName || "empty"}`}
              style={{
                animationDelay: getPlayerRevealDelay(
                  playerRevealMode,
                  positionIndex,
                ),
              }}
              onMouseEnter={() => {
                if (player) {
                  onHoverPlayer(player.name);
                }
              }}
              onMouseLeave={() => onHoverPlayer("")}
              className={`animate-[loadedPlayerReveal_360ms_ease-out_both] grid h-fit grid-cols-[44px_1fr_auto] items-center gap-2 rounded-md border px-3 py-2 transition ${
                player
                  ? "border-emerald-400/50 bg-emerald-400/10 hover:border-[#1bc2ec]/70 hover:bg-[#1bc2ec]/10"
                  : "border-white/10 bg-black/20"
              }`}
            >
              <span
                className={`font-michroma text-sm ${
                  player ? "text-emerald-400" : "text-white/40"
                }`}
              >
                {position}
              </span>

              <div>
                <p className="max-w-44 truncate font-michroma text-sm text-white">
                  {player ? player.name : "Select Player"}
                </p>

                <p className="mt-1 font-michroma text-[10px] text-white/35">
                  {player
                    ? `${player.team} - #${player.jerseyNumber}`
                    : "Empty"}
                </p>
              </div>

              {player && (
                <button
                  type="button"
                  onClick={() => onRemovePlayer(position)}
                  className="font-michroma text-xs text-white/40 transition hover:text-red-400"
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
          className={`mx-auto rounded-md border px-8 py-5 font-michroma text-[16px] uppercase transition ${
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
