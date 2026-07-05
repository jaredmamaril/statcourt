import { getPlayerInsights } from "../../court-data";
import { getArchetypePillStyle } from "../../rankings/ranking-style-helpers";

type ArchetypeOption = NonNullable<
  ReturnType<typeof getPlayerInsights>["archetype"]
>;

type ArchetypeFilterDropdownProps = {
  filteredArchetype: string;
  hasUnclassifiedPlayers: boolean;
  archetypeOptions: ArchetypeOption[];
  isOpen: boolean;
  onOpenDropdown: () => void;
  onSelectArchetype: (archetype: string) => void;
};

export function ArchetypeFilterDropdown({
  filteredArchetype,
  hasUnclassifiedPlayers,
  archetypeOptions,
  isOpen,
  onOpenDropdown,
  onSelectArchetype,
}: ArchetypeFilterDropdownProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpenDropdown}
        className={`flex min-w-10 max-w-38 cursor-pointer items-center gap-2 rounded-md border px-2 py-1 font-michroma text-xs transition-all duration-200 ${
          filteredArchetype
            ? "border-[#1bc2ec]/70 bg-[#1bc2ec]/10 text-[#1bc2ec]"
            : "border-white/20 bg-black/10 text-white/60 hover:border-white/60"
        }`}
      >
        <span className="max-w-52 truncate">
          {filteredArchetype || "All Archetypes"}
        </span>
        <span className="text-[#1bc2ec]">▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-30 mt-2 max-h-48 w-56 overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1 shadow-xl">
          <button
            type="button"
            onClick={() => onSelectArchetype("")}
            className="block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs text-white/70 hover:bg-white/10"
          >
            All Archetypes
          </button>

          {hasUnclassifiedPlayers && (
            <button
              type="button"
              onClick={() => onSelectArchetype("Unclassified")}
              className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs ${
                filteredArchetype === "Unclassified"
                  ? "bg-red-500/10 text-red-400"
                  : "text-red-300/80 hover:bg-white/10"
              }`}
            >
              Unclassified
            </button>
          )}

          {archetypeOptions.map((archetype) => {
            const archetypeStyle = getArchetypePillStyle(archetype);

            return (
              <button
                key={archetype.label}
                type="button"
                onClick={() => onSelectArchetype(archetype.label)}
                className="block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs hover:bg-white/10"
                style={{
                  color: archetypeStyle.color,
                  backgroundColor:
                    filteredArchetype === archetype.label
                      ? archetypeStyle.backgroundColor
                      : undefined,
                }}
              >
                {archetype.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
