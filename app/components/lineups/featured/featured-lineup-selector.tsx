import type { LineupName } from "./featured-lineups";

type FeaturedLineupSelectorProps = {
  selectedLineupNames: LineupName[];
  selectedLineupName: LineupName | "";
  selectedCategoryColor: string;
  onSelectLineup: (lineupName: LineupName) => void;
};

export function FeaturedLineupSelector({
  selectedLineupNames,
  selectedLineupName,
  selectedCategoryColor,
  onSelectLineup,
}: FeaturedLineupSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-1.5 lg:flex lg:flex-col lg:gap-2">
      {selectedLineupNames.map((lineupName, index) => (
        <button
          key={lineupName}
          type="button"
          onClick={() => onSelectLineup(lineupName)}
          className={`h-7 animate-[playerListRowIn_160ms_ease-out_both] rounded-md border px-2 text-left font-michroma text-[8px] transition lg:h-auto lg:px-4 lg:py-3 lg:text-xs ${
            selectedLineupName === lineupName
              ? "bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)]"
              : "border-white/15 bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] text-white/65 hover:text-white"
          }`}
          style={
            selectedLineupName === lineupName
              ? {
                  color: selectedCategoryColor,
                  borderColor: `${selectedCategoryColor}99`,
                  backgroundColor: `${selectedCategoryColor}24`,
                  animationDelay: `${index * 35}ms`,
                }
              : {
                  animationDelay: `${index * 35}ms`,
                }
          }
        >
          <span className="block truncate">{lineupName}</span>
        </button>
      ))}
    </div>
  );
}
