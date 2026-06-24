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
  );
}
