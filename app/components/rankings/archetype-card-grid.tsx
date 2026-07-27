import { getPlayerInsights, type Player, type StatMode } from "../court-data";
import {
  getPlayerRating,
  type PlayerRatingCategory,
  type PlayerStatProfileMode,
} from "../player-ratings";
import { getArchetypePillStyle } from "./ranking-style-helpers";

type ArchetypeOptionDetail = {
  label: string;
  archetype: Parameters<typeof getArchetypePillStyle>[0] | null;
};

type ArchetypeCardGridProps = {
  players: Player[];
  statProfileFilter: PlayerStatProfileMode;
  statMode: StatMode;
  archetypeOptionDetails: ArchetypeOptionDetail[];
  selectedArchetype: string;
  onSelectArchetype: (label: string) => void;
};

export function ArchetypeCardGrid({
  players,
  statProfileFilter,
  statMode,
  archetypeOptionDetails,
  selectedArchetype,
  onSelectArchetype,
}: ArchetypeCardGridProps) {
  const overallCategoryByProfile: Record<
    PlayerStatProfileMode,
    PlayerRatingCategory
  > = {
    career: "careerOverall",
    peak: "peakOverall",
    current: "currentOverall",
  };

  const overallCategory = overallCategoryByProfile[statProfileFilter];

  return (
    <div className="statcourt-scroll mt-3 grid max-h-72 gap-1.5 overflow-y-auto pr-1 lg:mt-4 lg:max-h-105 lg:grid-cols-3 lg:gap-2">
      {archetypeOptionDetails.map(({ label, archetype }) => {
        const isSelected = selectedArchetype === label;

        const archetypeColor = archetype
          ? getArchetypePillStyle(archetype).color
          : "#94A3B8";

        // Players in archetype group
        const archetypePlayers = players.filter(
          (player) =>
            getPlayerInsights(player, statMode).archetype?.label === label,
        );

        // Average rating between all players in archetype
        const averageRating =
          archetypePlayers.length > 0
            ? archetypePlayers.reduce(
                (total, player) =>
                  total +
                  getPlayerRating(player, overallCategory, statProfileFilter),
                0,
              ) / archetypePlayers.length
            : null;

        // Highest overall player in archetype group
        const representative = players
          .filter(
            (player) =>
              getPlayerInsights(player, statMode).archetype?.label === label,
          )
          .sort(
            (a, b) =>
              getPlayerRating(b, overallCategory, statProfileFilter) -
              getPlayerRating(a, overallCategory, statProfileFilter),
          )[0];

        return (
          // Buttons of archetypes
          <button
            key={label}
            type="button"
            onClick={() => onSelectArchetype(label)}
            className={`cursor-pointer rounded-md border bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] px-2.5 py-2 text-left font-michroma transition-all duration-200 hover:bg-[color:color-mix(in_srgb,var(--court-panel-alt)_92%,black)] lg:px-4 lg:py-4 ${
              isSelected ? "scale-[1.01]" : ""
            }`}
            style={{
              color: archetypeColor,
              borderColor: isSelected
                ? archetypeColor
                : "rgba(255,255,255,0.12)",
            }}
          >
            <span className="grid grid-cols-[1fr_auto] items-center gap-2 lg:gap-4">
              <span className="min-w-0">
                <span className="block truncate text-[10px] lg:text-sm">
                  {label}
                </span>

                <span className="mt-1 block text-[7px] text-white/40 lg:text-[10px]">
                  {archetypePlayers.length}{" "}
                  {archetypePlayers.length === 1 ? "Player" : "Players"}
                </span>

                {representative && (
                  <>
                    <span className="mt-2 block text-[6.5px] uppercase text-white/35 lg:mt-4 lg:text-[9px]">
                      Face of Archetype
                    </span>
                    <span className="mt-1 block truncate text-[7.5px] text-white/75 lg:text-[10px]">
                      {representative.name}
                    </span>
                  </>
                )}
              </span>

              {averageRating !== null && (
                <span className="text-center">
                  <span className="block text-[6px] uppercase text-white/35 lg:text-[8px]">
                    Avg Rating
                  </span>
                  <span className="mt-1 block text-[11px] font-bold text-white lg:text-lg">
                    {averageRating.toFixed(1)}
                  </span>
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

