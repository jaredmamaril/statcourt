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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpenDropdown}
        className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 font-michroma text-xs transition-all duration-200 ${
          sortBy
            ? "border-[#1bc2ec]/70 bg-[#1bc2ec]/10 text-[#1bc2ec]"
            : "border-white/20 bg-black/10 text-white/60 hover:border-white/60"
        }`}
      >
        <span>
          Sort: {selectedSortOption ? selectedSortOption.label : "None"}
          {sortBy &&
            (sortBy === "first-name" || sortBy === "last-name"
              ? sortDirection === "primary"
                ? "A-Z"
                : "Z-A"
              : sortDirection === "primary"
                ? "Hi-Lo"
                : "Lo-Hi")}
        </span>
        <span className="text-[#1bc2ec]">▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-30 mt-2 max-h-52 w-44 overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1 shadow-xl">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectSort(option.value)}
              className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs ${
                sortBy === option.value
                  ? "bg-[#1bc2ec]/10 text-[#1bc2ec]"
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
