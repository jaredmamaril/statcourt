import {
  sortOptions,
  type SortDirection,
  type SortValue,
} from "../../court-data";

type SortFilterDropdownProps = {
  sortBy: SortValue;
  sortDirection: SortDirection;
  isOpen: boolean;
  onOpenDropdown: () => void;
  onSelectSort: (sort: SortValue) => void;
};

export function SortFilterDropdown({
  sortBy,
  sortDirection,
  isOpen,
  onOpenDropdown,
  onSelectSort,
}: SortFilterDropdownProps) {
  const selectedSortOption = sortOptions.find(
    (option) => option.value === sortBy,
  );

  const selectedSortButtonLabel =
    sortBy === "fgPercent"
      ? "FG%"
      : sortBy === "threePercent"
        ? "3PT%"
        : sortBy === "ftPercent"
          ? "FT%"
          : selectedSortOption?.label;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpenDropdown}
        className={`flex h-6 cursor-pointer items-center gap-1 rounded-md border px-2 font-michroma text-[9px] transition-all duration-200 sm:h-auto sm:gap-2 sm:py-1 sm:text-xs ${
          sortBy
            ? "scale-[1.02] border-[rgb(var(--court-accent-rgb)/0.7)] bg-[color:color-mix(in_srgb,var(--court-accent)_38%,var(--court-panel-alt))] text-[var(--court-accent)] ring-1 ring-[rgb(var(--court-accent-rgb)/0.45)]"
            : "border-white/20 bg-[color:color-mix(in_srgb,var(--court-panel)_86%,black)] text-white/70 hover:border-white/60"
        }`}
      >
        <span className="truncate">
          {selectedSortButtonLabel || "Sort"}{" "}
          {sortBy &&
            (sortBy === "first-name" || sortBy === "last-name"
              ? sortDirection === "primary"
                ? "A-Z"
                : "Z-A"
              : sortDirection === "primary"
                ? "Hi-Lo"
                : "Lo-Hi")}
        </span>

        <span className="shrink-0 text-[8px] text-[var(--court-accent)] sm:text-xs">▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-30 mt-1.5 max-h-44 w-28 overflow-y-auto rounded-md border border-white/20 bg-[var(--court-panel-alt)] py-1 shadow-xl animate-[dropdownIn_140ms_ease-out_both] sm:mt-2 sm:max-h-52 sm:w-40">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectSort(option.value)}
              className={`block w-full cursor-pointer px-2 py-1.5 text-left font-michroma text-[9px] sm:px-3 sm:py-2 sm:text-xs ${
                sortBy === option.value
                  ? "bg-[color:color-mix(in_srgb,var(--court-accent)_38%,var(--court-panel-alt))] text-[var(--court-accent)]"
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

