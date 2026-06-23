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
    <div className="flex flex-col gap-2">
      {selectedLineupNames.map((lineupName) => (
        <button
          key={lineupName}
          type="button"
          onClick={() => onSelectLineup(lineupName)}
          className={`rounded-md border px-4 py-3 text-left font-michroma text-xs transition ${
            selectedLineupName === lineupName
              ? "bg-black/30"
              : "border-white/10 bg-black/30 text-white/60 hover:text-white"
          }`}
          style={
            selectedLineupName === lineupName
              ? {
                  color: selectedCategoryColor,
                  borderColor: `${selectedCategoryColor}99`,
                  backgroundColor: `${selectedCategoryColor}18`,
                }
              : undefined
          }
        >
          {lineupName}
        </button>
      ))}
    </div>
  );
}
