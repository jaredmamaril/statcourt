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
  const selectedArchetype = archetypeOptions.find(
    (archetype) => archetype.label === filteredArchetype,
  );
  const selectedArchetypeStyle = selectedArchetype
    ? getArchetypePillStyle(selectedArchetype)
    : null;
  const activeArchetypeColor =
    filteredArchetype === "Unclassified"
      ? "#F87171"
      : selectedArchetypeStyle?.color;
  const activeArchetypeBackground =
    filteredArchetype === "Unclassified"
      ? "rgba(239,68,68,0.1)"
      : selectedArchetypeStyle?.backgroundColor;
  const dropdownId = "players-archetype-filter-menu";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpenDropdown}
        aria-label="Filter players by archetype"
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        aria-haspopup="true"
        className={`flex min-h-9 min-w-0 max-w-37.5 cursor-pointer items-center gap-1 rounded-md border px-2 font-michroma text-[10px] transition-all duration-200 sm:min-h-8 sm:max-w-38 sm:gap-2 sm:py-1 sm:text-xs ${
          filteredArchetype
            ? "scale-[1.02] border-[rgb(var(--court-accent-rgb)/0.7)] bg-[color:color-mix(in_srgb,var(--court-accent)_38%,var(--court-panel-alt))] text-[var(--court-accent)] ring-1 ring-[rgb(var(--court-accent-rgb)/0.45)]"
            : "border-white/20 bg-[color:color-mix(in_srgb,var(--court-panel)_86%,black)] text-white/70 hover:border-white/60"
        }`}
        style={
          filteredArchetype
            ? {
                color: activeArchetypeColor,
                borderColor: activeArchetypeColor,
                backgroundColor: activeArchetypeBackground,
                "--tw-ring-color": `${activeArchetypeColor}4D`,
              } as React.CSSProperties
            : undefined
        }
      >
        <span className="truncate">
          {filteredArchetype || "All Archetypes"}
        </span>
        <span className="shrink-0 text-[9px] text-[var(--court-accent)] sm:text-xs">▾</span>
      </button>

      {isOpen && (
        <div id={dropdownId} className="absolute left-0 top-full z-30 mt-1.5 max-h-40 w-32 overflow-y-auto rounded-md border border-white/20 bg-[var(--court-panel-alt)] py-1 shadow-xl animate-[dropdownIn_140ms_ease-out_both] sm:mt-2 sm:max-h-48 sm:w-56">
          <button
            type="button"
            onClick={() => onSelectArchetype("")}
            className="block w-full cursor-pointer px-2 py-1.5 text-left font-michroma text-[9px] text-white/70 hover:bg-white/10 sm:px-3 sm:py-2 sm:text-xs"
          >
            All Archetypes
          </button>

          {hasUnclassifiedPlayers && (
            <button
              type="button"
              onClick={() => onSelectArchetype("Unclassified")}
              className={`block w-full cursor-pointer px-2 py-1.5 text-left font-michroma text-[9px] sm:px-3 sm:py-2 sm:text-xs ${
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
                className="block w-full cursor-pointer px-2 py-1.5 text-left font-michroma text-[9px] hover:bg-white/10 sm:px-3 sm:py-2 sm:text-xs"
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

