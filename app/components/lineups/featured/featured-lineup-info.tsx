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
      <h3 className="font-michroma text-[11px] uppercase tracking-wide text-white lg:text-sm">
        {selectedLineupName}
      </h3>

      <div className="mt-2 grid gap-1 lg:mt-5 lg:gap-2">
        {Object.entries(selectedLineup.players).map(
          ([position, playerName]) => (
            <div
              key={`${position}-${playerName || "empty"}`}
              onMouseEnter={() => onHoverPlayer(playerName)}
              onMouseLeave={() => onHoverPlayer("")}
              className="grid w-fit cursor-pointer grid-cols-[26px_1fr] font-michroma text-[8px] transition lg:grid-cols-[40px_1fr] lg:text-xs"
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

      <p className="mt-2 font-michroma text-[8px] text-white lg:mt-5 lg:text-xs">
        OVR:{" "}
        <span style={{ color: selectedCategoryColor }}>
          {selectedLineup.overall}
        </span>
      </p>

      <div className="mt-2 flex flex-wrap gap-1.5 lg:mt-4 lg:gap-2">
        {selectedLineupAchievements.map((achievement) => (
          <span
            key={achievement}
            className="rounded border px-1 py-0.5 font-michroma text-[6px] lg:px-2 lg:py-1 lg:text-[9px]"
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

      <div className="mt-3 lg:mt-5">
        <p className="font-michroma text-[7px] uppercase text-white/40 lg:text-[10px]">
          Archetype
        </p>

        <p
          className="mt-0.5 font-michroma text-[10px] lg:mt-1 lg:text-sm"
          style={{
            color: selectedCategoryColor,
            textShadow: `0 0 10px ${selectedCategoryColor}`,
          }}
        >
          {selectedLineup.archetype}
        </p>

        <div className="mt-3 lg:mt-5">
          <p className="font-michroma text-[8px] uppercase text-white/40 lg:text-[10px]">
            Description
          </p>

          <p className="mt-1 font-michroma text-[7px] leading-relaxed text-white/70 lg:text-[10px]">
            {selectedLineup.description}
          </p>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:mt-5 lg:gap-4">
          <div>
            <p className="font-michroma text-[8px] uppercase text-emerald-400/40 lg:text-[10px]">
              Strengths
            </p>

            <div className="mt-1.5 flex flex-wrap gap-1.5 lg:mt-2 lg:gap-2">
              {selectedLineup.strengths.map((strength) => (
                <span
                  key={strength}
                  className="rounded border border-emerald-600/40 bg-emerald-500/10 px-1.5 py-0.5 font-michroma text-[7px] text-emerald-400 lg:px-2 lg:py-1 lg:text-[9px]"
                >
                  {strength}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="font-michroma text-[8px] uppercase text-red-700/40 lg:text-[10px]">
              Weaknesses
            </p>

            <div className="mt-1.5 flex flex-wrap gap-1.5 lg:mt-2 lg:gap-2">
              {selectedLineup.weaknesses.map((weakness) => (
                <span
                  key={weakness}
                  className="rounded border border-red-700/40 bg-red-700/10 px-1.5 py-0.5 font-michroma text-[7px] text-red-700 lg:px-2 lg:py-1 lg:text-[9px]"
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
