type SavedLineupsToolbarProps = {
  savedLineupSearch: string;
  savedLineupSort: string;
  savedSortLabel: string;
  openSavedDropdown: string | null;
  savedLineupCount: number;
  onSearchChange: (value: string) => void;
  onToggleDropdown: () => void;
  onSelectSort: (value: string) => void;
};

const savedSortOptions = [
  { label: "Highest OVR", value: "highestOvr" },
  { label: "Lowest OVR", value: "lowestOvr" },
  { label: "Newest Saved", value: "newest" },
  { label: "Oldest Saved", value: "oldest" },
];

export function SavedLineupsToolbar({
  savedLineupSearch,
  savedLineupSort,
  savedSortLabel,
  openSavedDropdown,
  savedLineupCount,
  onSearchChange,
  onToggleDropdown,
  onSelectSort,
}: SavedLineupsToolbarProps) {
  return (
    <>
      <div className="flex items-center justify-center gap-2 lg:gap-4">
        <input
          type="text"
          value={savedLineupSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search saved lineups..."
          className="h-8 min-w-0 flex-1 rounded-md border border-white/15 bg-black/30 px-2 font-michroma text-[7px] text-white outline-none placeholder:text-white/30 focus:border-white lg:h-auto lg:max-w-md lg:px-4 lg:py-3 lg:text-xs"
        />

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={onToggleDropdown}
            className={`flex h-8 min-w-24 cursor-pointer items-center justify-between gap-1 rounded-md border px-2 font-michroma text-[7px] transition lg:h-auto lg:min-w-48 lg:gap-3 lg:px-4 lg:py-3 lg:text-xs ${
              savedLineupSort !== "highestOvr"
                ? "border-[#1bc2ec]/70 bg-[#1bc2ec]/10 text-[#1bc2ec]"
                : "border-white/15 bg-black/30 text-white/60 hover:border-white/40"
            }`}
          >
            <span>Sort: {savedSortLabel}</span>
            <span className="text-[#1bc2ec]">v</span>
          </button>

          {openSavedDropdown === "sort" && (
            <div className="absolute right-0 top-full z-100 mt-1 w-32 overflow-hidden rounded-md border border-white/15 bg-[#07111f] shadow-[0_0_20px_rgba(0,0,0,0.45)] lg:mt-2 lg:w-full">
              {savedSortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSelectSort(option.value)}
                  className={`block w-full cursor-pointer px-2 py-2 text-left font-michroma text-[7px] transition lg:px-4 lg:py-3 lg:text-xs ${
                    savedLineupSort === option.value
                      ? "bg-[#1bc2ec]/10 text-[#1bc2ec]"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2">
        <p className="mb-2 text-center font-michroma text-[7px] text-white/40 lg:mb-4 lg:text-xs">
          {savedLineupCount} Saved{" "}
          {savedLineupCount === 1 ? "Lineup" : "Lineups"}
        </p>
      </div>
    </>
  );
}
