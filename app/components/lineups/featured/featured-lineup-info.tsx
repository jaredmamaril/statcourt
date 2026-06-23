import type { LineupDetail } from "../shared/lineup-types";

type FeaturedLineupInfoProps = {
  selectedLineup: LineupDetail;
  selectedLineupName: string;
  selectedCategoryColor: string;
  selectedLineupAchievements: string[];
  hoveredLineupPlayer: string;
  onHoverPlayer: (playerName: string) => void;
};

export function FeaturedLineupInfo({
  selectedLineup,
  selectedLineupName,
  selectedCategoryColor,
  selectedLineupAchievements,
  hoveredLineupPlayer,
  onHoverPlayer,
}: FeaturedLineupInfoProps) {
  return (
    <div>
      <h3 className="font-michroma text-sm uppercase tracking-wide text-white">
        {selectedLineupName}
      </h3>

      <div className="mt-5 grid gap-2">
        {Object.entries(selectedLineup.players).map(
          ([position, playerName]) => (
            <div
              key={`${position}-${playerName || "empty"}`}
              onMouseEnter={() => onHoverPlayer(playerName)}
              onMouseLeave={() => onHoverPlayer("")}
              className="grid w-fit cursor-pointer grid-cols-[40px_1fr] font-michroma text-xs transition"
            >
              <span
                className="transition-all duration-200"
                style={{
                  color: selectedCategoryColor,
                  textShadow:
                    hoveredLineupPlayer === playerName
                      ? `0 0 10px ${selectedCategoryColor}`
                      : "none",
                }}
              >
                {position}
              </span>

              <span
                className="text-white/80 transition-all duration-200"
                style={{
                  color:
                    hoveredLineupPlayer === playerName
                      ? selectedCategoryColor
                      : "rgba(255,255,255,0.8)",
                  textShadow:
                    hoveredLineupPlayer === playerName
                      ? `0 0 10px ${selectedCategoryColor}`
                      : "none",
                }}
              >
                {playerName}
              </span>
            </div>
          ),
        )}
      </div>

      <p className="mt-5 font-michroma text-xs text-white">
        OVR:{" "}
        <span style={{ color: selectedCategoryColor }}>
          {selectedLineup.overall}
        </span>
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {selectedLineupAchievements.map((achievement) => (
          <span
            key={achievement}
            className="rounded border px-2 py-1 font-michroma text-[9px]"
            style={{
              color: selectedCategoryColor,
              borderColor: `${selectedCategoryColor}66`,
              backgroundColor: `${selectedCategoryColor}14`,
            }}
          >
            {achievement}
          </span>
        ))}
      </div>

      <div className="mt-5">
        <p className="font-michroma text-[10px] uppercase text-white/40">
          Archetype
        </p>

        <p
          className="mt-1 font-michroma text-sm"
          style={{
            color: selectedCategoryColor,
            textShadow: `0 0 10px ${selectedCategoryColor}`,
          }}
        >
          {selectedLineup.archetype}
        </p>

        <div className="mt-5">
          <p className="font-michroma text-[10px] uppercase text-white/40">
            Description
          </p>

          <p className="mt-1 font-michroma text-[10px] leading-relaxed text-white/70">
            {selectedLineup.description}
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="font-michroma text-[10px] uppercase text-emerald-400/40">
              Strengths
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {selectedLineup.strengths.map((strength) => (
                <span
                  key={strength}
                  className="rounded border border-emerald-600/40 bg-emerald-500/10 px-2 py-1 font-michroma text-[9px] text-emerald-400"
                >
                  {strength}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="font-michroma text-[10px] uppercase text-red-700/40">
              Weaknesses
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {selectedLineup.weaknesses.map((weakness) => (
                <span
                  key={weakness}
                  className="rounded border border-red-700/40 bg-red-700/10 px-2 py-1 font-michroma text-[9px] text-red-700"
                >
                  {weakness}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
