import type { TeamGrades } from "../../lineup-scouting";

type ScoutTraitsGridProps = {
  lineupStrengths: string[];
  lineupWeaknesses: string[];
  lineupTradeoff: string;
  teamGrades: TeamGrades;
};

export function ScoutTraitsGrid({
  lineupStrengths,
  lineupWeaknesses,
  lineupTradeoff,
  teamGrades,
}: ScoutTraitsGridProps) {
  return (
    <div
      className="scout-section-reveal relative z-10"
      style={{ animationDelay: "260ms" }}
    >
      <div className="mt-2 grid grid-cols-2 items-start gap-2 lg:grid-cols-[130px_130px_130px_130px] lg:gap-3">
        <div>
          <p className="font-michroma text-[6px] lg:text-[9px] uppercase text-emerald-400/60">
            Strengths
          </p>

          <div className="mt-1 grid gap-2">
            {lineupStrengths.map((strength) => (
              <p
                key={strength}
                className="font-michroma text-[6px] lg:text-[9px] text-white"
              >
                <span className="text-emerald-400">✓</span> {strength}
              </p>
            ))}
          </div>
        </div>

        <div>
          <p className="font-michroma text-[6px] lg:text-[9px] uppercase text-red-400/60">
            Weaknesses
          </p>

          <div className="mt-1 grid gap-2">
            {lineupWeaknesses.map((weakness) => (
              <p
                key={weakness}
                className="font-michroma text-[6px] lg:text-[9px] text-white"
              >
                <span className="text-red-400">!</span> {weakness}
              </p>
            ))}
          </div>
        </div>

        <div>
          <p className="font-michroma text-[6px] lg:text-[9px] uppercase text-[#EFBF04]">
            Tradeoff
          </p>

          <p className="mt-1 max-w-25 font-michroma text-[6px] lg:text-[9px] text-white">
            {lineupTradeoff}
          </p>
        </div>

        <div>
          <p className="font-michroma text-[6px] lg:text-[9px] uppercase text-white/30">
            Team Grades
          </p>

          <div className="mt-1 grid gap-1">
            <p className="font-michroma text-[5px] lg:text-[8px] text-white/35">
              Offense:{" "}
              <span className="text-white/55">{teamGrades.offense}</span>
            </p>

            <p className="font-michroma text-[5px] lg:text-[8px] text-white/35">
              Defense:{" "}
              <span className="text-white/55">{teamGrades.defense}</span>
            </p>

            <p className="font-michroma text-[5px] lg:text-[8px] text-white/35">
              Shooting:{" "}
              <span className="text-white/55">{teamGrades.shooting}</span>
            </p>

            <p className="font-michroma text-[5px] lg:text-[8px] text-white/35">
              Playmaking:{" "}
              <span className="text-white/55">{teamGrades.playmaking}</span>
            </p>

            <p className="font-michroma text-[5px] lg:text-[8px] text-white/35">
              Rebounding:{" "}
              <span className="text-white/55">{teamGrades.rebounding}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
