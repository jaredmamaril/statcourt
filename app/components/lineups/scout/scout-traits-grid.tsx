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
          <p className="font-michroma text-[8px] uppercase text-emerald-300 lg:text-[9px]">
            Strengths
          </p>

          <div className="mt-1 grid gap-2">
            {lineupStrengths.map((strength) => (
              <p
                key={strength}
                className="font-michroma text-[8px] text-white lg:text-[9px]"
              >
                <span className="text-emerald-400">✓</span> {strength}
              </p>
            ))}
          </div>
        </div>

        <div>
          <p className="font-michroma text-[8px] uppercase text-red-300 lg:text-[9px]">
            Weaknesses
          </p>

          <div className="mt-1 grid gap-2">
            {lineupWeaknesses.map((weakness) => (
              <p
                key={weakness}
                className="font-michroma text-[8px] text-white lg:text-[9px]"
              >
                <span className="text-red-400">!</span> {weakness}
              </p>
            ))}
          </div>
        </div>

        <div>
          <p className="font-michroma text-[8px] uppercase text-[#EFBF04] lg:text-[9px]">
            Tradeoff
          </p>

          <p className="mt-1 max-w-25 font-michroma text-[8px] text-white lg:text-[9px]">
            {lineupTradeoff}
          </p>
        </div>

        <div>
          <p className="font-michroma text-[8px] uppercase text-white/65 lg:text-[9px]">
            Team Grades
          </p>

          <div className="mt-1 grid gap-1">
            <p className="font-michroma text-[7px] text-white/65 lg:text-[8px]">
              Offense:{" "}
              <span className="text-white/80">{teamGrades.offense}</span>
            </p>

            <p className="font-michroma text-[7px] text-white/65 lg:text-[8px]">
              Defense:{" "}
              <span className="text-white/80">{teamGrades.defense}</span>
            </p>

            <p className="font-michroma text-[7px] text-white/65 lg:text-[8px]">
              Shooting:{" "}
              <span className="text-white/80">{teamGrades.shooting}</span>
            </p>

            <p className="font-michroma text-[7px] text-white/65 lg:text-[8px]">
              Playmaking:{" "}
              <span className="text-white/80">{teamGrades.playmaking}</span>
            </p>

            <p className="font-michroma text-[7px] text-white/65 lg:text-[8px]">
              Rebounding:{" "}
              <span className="text-white/80">{teamGrades.rebounding}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
