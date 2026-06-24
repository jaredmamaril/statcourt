import { players, getPlayerInsights } from "../court-data";
import { getPlayerRating } from "../player-ratings";
import { getArchetypePillStyle } from "./ranking-style-helpers";

type ArchetypeOptionDetail = {
  label: string;
  archetype: Parameters<typeof getArchetypePillStyle>[0] | null;
};

type ArchetypeCardGridProps = {
  archetypeOptionDetails: ArchetypeOptionDetail[];
  selectedArchetype: string;
  onSelectArchetype: (label: string) => void;
};

export function ArchetypeCardGrid({
  archetypeOptionDetails,
  selectedArchetype,
  onSelectArchetype,
}: ArchetypeCardGridProps) {
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {archetypeOptionDetails.map(({ label, archetype }) => {
        const isSelected = selectedArchetype === label;

        const archetypeColor = archetype
          ? getArchetypePillStyle(archetype).color
          : "#94A3B8";

        // Players in archetype group
        const archetypePlayers = players.filter(
          (player) => getPlayerInsights(player).archetype?.label === label,
        );

        // Average rating between all players in archetype
        const averageRating =
          archetypePlayers.length > 0
            ? archetypePlayers.reduce(
                (total, player) => total + getPlayerRating(player, "overall"),
                0,
              ) / archetypePlayers.length
            : null;

        // Highest overall player in archetype group
        const representative = players
          .filter(
            (player) => getPlayerInsights(player).archetype?.label === label,
          )
          .sort(
            (a, b) =>
              getPlayerRating(b, "overall") - getPlayerRating(a, "overall"),
          )[0];

        return (
          // Buttons of archetypes
          <button
            key={label}
            type="button"
            onClick={() => onSelectArchetype(label)}
            className={`rounded-md cursor-pointer border bg-black/30 px-4 py-4 text-left font-michroma transition-all duration-200 hover:bg-white/10 ${
              isSelected ? "scale-[1.02]" : ""
            }`}
            style={{
              color: archetypeColor,
              borderColor: isSelected
                ? archetypeColor
                : "rgba(255,255,255,0.12)",
            }}
          >
            <span className="grid grid-cols-[1fr_auto] items-center gap-4">
              <span className="min-w-0">
                <span className="block truncate text-sm">{label}</span>

                <span className="mt-1 block text-[10px] text-white/40">
                  {archetypePlayers.length}{" "}
                  {archetypePlayers.length === 1 ? "Player" : "Players"}
                </span>

                {representative && (
                  <>
                    <span className="mt-4 block text-[9px] uppercase text-white/35">
                      Face of Archetype
                    </span>
                    <span className="mt-1 block truncate text-[10px] text-white/75">
                      {representative.name}
                    </span>
                  </>
                )}
              </span>

              {averageRating !== null && (
                <span className="text-center">
                  <span className="block text-[8px] uppercase text-white/35">
                    Avg Ovr
                  </span>
                  <span className="mt-1 block text-md font-bold text-white">
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
