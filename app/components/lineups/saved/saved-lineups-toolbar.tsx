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
      <div className="flex items-center justify-center gap-4">
        <input
          type="text"
          value={savedLineupSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search saved lineups..."
          className="w-full max-w-md rounded-md border border-white/15 bg-black/30 px-4 py-3 font-michroma text-xs text-white outline-none placeholder:text-white/30 focus:border-white"
        />

        <div className="relative">
          <button
            type="button"
            onClick={onToggleDropdown}
            className={`flex min-w-48 cursor-pointer items-center justify-between gap-3 rounded-md border px-4 py-3 font-michroma text-xs transition ${
              savedLineupSort !== "highestOvr"
                ? "border-[#1bc2ec]/70 bg-[#1bc2ec]/10 text-[#1bc2ec]"
                : "border-white/15 bg-black/30 text-white/60 hover:border-white/40"
            }`}
          >
            <span>Sort: {savedSortLabel}</span>
            <span className="text-[#1bc2ec]">v</span>
          </button>

          {openSavedDropdown === "sort" && (
            <div className="absolute right-0 top-full z-100 mt-2 w-full overflow-hidden rounded-md border border-white/15 bg-[#07111f] shadow-[0_0_20px_rgba(0,0,0,0.45)]">
              {savedSortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSelectSort(option.value)}
                  className={`block w-full cursor-pointer px-4 py-3 text-left font-michroma text-xs transition ${
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
        <p className="mb-4 text-center font-michroma text-xs text-white/40">
          {savedLineupCount} Saved{" "}
          {savedLineupCount === 1 ? "Lineup" : "Lineups"}
        </p>
      </div>
    </>
  );
}
