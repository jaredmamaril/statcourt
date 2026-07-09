import { players, type LineupSlot } from "../../court-data";
import type { LineupScoutScores } from "../../lineup-scouting";
import { ScoutScoreProfile } from "./scout-score-profile";

type ScoutLineupSummaryProps = {
  lineupPositions: LineupSlot[];
  customLineup: Record<LineupSlot, string>;
  scoutScores: LineupScoutScores;
  scoutArchetypeColor: string;
};

export function ScoutLineupSummary({
  lineupPositions,
  customLineup,
  scoutScores,
  scoutArchetypeColor,
}: ScoutLineupSummaryProps) {
  return (
    <div
      className="mt-2 w-full rounded-md border border-white/10 bg-black/20 p-2 lg:absolute lg:top-5 lg:mt-0 lg:w-56 lg:border-0 lg:bg-transparent lg:p-0"
      style={{ left: "340px" }}
    >
      <p className="font-michroma text-[7px] uppercase text-white/40 lg:text-[10px]">
        Lineup
      </p>

      <div className="mt-0.5 grid gap-1">
        {lineupPositions.map((position) => {
          const playerName = customLineup[position];
          const player = players.find((player) => player.name === playerName);

          return (
            <div
              key={position}
              className="grid grid-cols-[24px_1fr] items-center gap-2 lg:grid-cols-[34px_1fr] lg:gap-3"
            >
              <span
                className="font-michroma text-[7px] lg:text-[10px]"
                style={{ color: scoutArchetypeColor }}
              >
                {position}
              </span>

              <div>
                <p className="truncate font-michroma text-[7px] text-white lg:text-[10px]">
                  {player?.name ?? "Empty"}
                </p>

                <p
                  className="mt-0.5 font-michroma text-[6px] lg:mt-1 lg:text-[8px]"
                  style={{ color: `${scoutArchetypeColor}99` }}
                >
                  {player ? `${player.team} • #${player.jerseyNumber}` : "--"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <ScoutScoreProfile
        scoutScores={scoutScores}
        scoutArchetypeColor={scoutArchetypeColor}
      />
    </div>
  );
}
