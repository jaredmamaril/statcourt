import type { LineupScoutScores } from "../../lineup-scouting";
import { getRankedScoutScores } from "../../lineup-scouting";

type ScoutScoreProfileProps = {
  scoutScores: LineupScoutScores;
  scoutArchetypeColor: string;
};

export function ScoutScoreProfile({
  scoutScores,
  scoutArchetypeColor,
}: ScoutScoreProfileProps) {
  return (
    <div className="mt-1">
      <div className="scout-section-reveal" style={{ animationDelay: "140ms" }}>
        <p className="text-center font-michroma text-[7px] uppercase text-white/40 lg:text-[10px]">
          Score Profile
        </p>

        <div className="mt-1 grid gap-1">
          {getRankedScoutScores(scoutScores).map((score) => (
            <div
              key={score.key}
              className="grid grid-cols-[48px_minmax(0,1fr)_18px] items-center gap-1 lg:grid-cols-[68px_120px_24px]"
            >
              <p className="truncate font-michroma text-[6px] text-white/40 lg:text-[8px]">
                {score.label}
              </p>

              <div className="h-1 overflow-hidden rounded-full bg-white/10 lg:h-1.5">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(score.value, 100)}%`,
                    backgroundColor: scoutArchetypeColor,
                    boxShadow: `0 0 8px ${scoutArchetypeColor}88`,
                  }}
                />
              </div>

              <p className="text-right font-michroma text-[6px] text-white/45 lg:text-[8px]">
                {Math.round(score.value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
