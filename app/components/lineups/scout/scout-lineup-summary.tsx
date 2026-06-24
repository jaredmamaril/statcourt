import { players, type Position } from "../../court-data";
import type { LineupScoutScores } from "../../lineup-scouting";
import { ScoutScoreProfile } from "./scout-score-profile";

type ScoutLineupSummaryProps = {
  lineupPositions: Position[];
  customLineup: Record<Position, string>;
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
    <div className="absolute right-5 top-5 w-56">
      <p className="font-michroma text-[10px] uppercase text-white/40">
        Lineup
      </p>

      <div className="mt-0.5 grid gap-1">
        {lineupPositions.map((position) => {
          const playerName = customLineup[position];
          const player = players.find((player) => player.name === playerName);

          return (
            <div
              key={position}
              className="grid grid-cols-[34px_1fr] items-center gap-3"
            >
              <span
                className="font-michroma text-[10px]"
                style={{ color: scoutArchetypeColor }}
              >
                {position}
              </span>

              <div>
                <p className="truncate font-michroma text-[10px] text-white">
                  {player?.name ?? "Empty"}
                </p>

                <p
                  className="mt-1 font-michroma text-[8px]"
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
