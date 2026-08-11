import { useMemo, useState } from "react";
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

const ARCHETYPE_INITIAL_LIMIT = 12;
const ARCHETYPE_LOAD_MORE_AMOUNT = 12;

export function ArchetypeCardGrid({
  players,
  statProfileFilter,
  statMode,
  archetypeOptionDetails,
  selectedArchetype,
  onSelectArchetype,
}: ArchetypeCardGridProps) {
  const [displayLimit, setDisplayLimit] = useState(ARCHETYPE_INITIAL_LIMIT);

  const overallCategoryByProfile: Record<
    PlayerStatProfileMode,
    PlayerRatingCategory
  > = {
    career: "careerOverall",
    peak: "peakOverall",
    current: "currentOverall",
  };

  const overallCategory = overallCategoryByProfile[statProfileFilter];
  const displayedArchetypes = useMemo(
    () => archetypeOptionDetails.slice(0, displayLimit),
    [archetypeOptionDetails, displayLimit],
  );
  const hasMoreArchetypes =
    displayedArchetypes.length < archetypeOptionDetails.length;
  const canShowLess = displayLimit > ARCHETYPE_INITIAL_LIMIT;

  return (
    <>
      <div className="statcourt-scroll mt-3 grid max-h-72 gap-1.5 overflow-y-auto pr-1 lg:mt-4 lg:max-h-105 lg:grid-cols-3 lg:gap-2">
        {displayedArchetypes.map(({ label, archetype }) => {
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

                  <span className="mt-1 block text-[8px] text-white/60 lg:text-[10px]">
                    {archetypePlayers.length}{" "}
                    {archetypePlayers.length === 1 ? "Player" : "Players"}
                  </span>

                  {representative && (
                    <>
                      <span className="mt-2 block text-[8px] uppercase text-white/60 lg:mt-4 lg:text-[9px]">
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
                    <span className="block text-[8px] uppercase text-white/60 lg:text-[9px]">
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

      {archetypeOptionDetails.length > ARCHETYPE_INITIAL_LIMIT && (
        <div className="mt-2 rounded-md border border-white/15 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-1.5 font-michroma lg:mt-3 lg:p-3">
          <div className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:justify-between lg:gap-2">
            <p className="text-center text-[8px] uppercase text-white/60 lg:text-left lg:text-[9px]">
              Showing {displayedArchetypes.length} of{" "}
              {archetypeOptionDetails.length} archetypes
            </p>

            <div className="flex items-center justify-center gap-1.5 lg:gap-2">
              {canShowLess && (
                <button
                  type="button"
                  onClick={() => setDisplayLimit(ARCHETYPE_INITIAL_LIMIT)}
                  className="min-h-9 rounded border border-white/15 bg-white/5 px-2 font-michroma text-[8px] uppercase text-white/70 transition hover:border-[rgb(var(--court-accent-rgb)/0.45)] hover:text-[var(--court-accent)] lg:min-h-8 lg:px-3 lg:text-[9px]"
                >
                  Show Less
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setDisplayLimit((current) =>
                    Math.min(
                      current + ARCHETYPE_LOAD_MORE_AMOUNT,
                      archetypeOptionDetails.length,
                    ),
                  )
                }
                disabled={!hasMoreArchetypes}
                className="min-h-9 rounded border border-[rgb(var(--court-accent-rgb)/0.45)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-2 font-michroma text-[8px] uppercase text-[var(--court-accent)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.2)] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/55 lg:min-h-8 lg:px-3 lg:text-[9px]"
              >
                {hasMoreArchetypes ? "Load More" : "All Shown"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

