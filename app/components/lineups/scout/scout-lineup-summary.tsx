import { players, type Position } from "../../court-data";
import type { LineupScoutScores } from "../../lineup-scouting";
import { getRankedScoutScores } from "../../lineup-scouting";

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

      <div className="mt-1">
        <div
          className="scout-section-reveal"
          style={{ animationDelay: "140ms" }}
        >
          <p className="text-center font-michroma text-[10px] uppercase text-white/40">
            Score Profile
          </p>

          <div className="mt-1 grid gap-1">
            {getRankedScoutScores(scoutScores).map((score) => (
              <div
                key={score.key}
                className="grid grid-cols-[68px_120px_24px] items-center gap-1"
              >
                <p className="font-michroma text-[8px] text-white/40">
                  {score.label}
                </p>

                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(score.value, 100)}%`,
                      backgroundColor: scoutArchetypeColor,
                      boxShadow: `0 0 8px ${scoutArchetypeColor}88`,
                    }}
                  />
                </div>

                <p className="text-right font-michroma text-[8px] text-white/45">
                  {Math.round(score.value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
