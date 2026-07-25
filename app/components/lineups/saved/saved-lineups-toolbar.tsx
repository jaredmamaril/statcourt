import type { PlayerStatProfileMode } from "../../player-ratings";

type SavedLineupsToolbarProps = {
  savedLineupSearch: string;
  savedLineupSort: string;
  savedLineupProfileFilter: PlayerStatProfileMode | "all";
  savedSortLabel: string;
  savedProfileLabel: string;
  openSavedDropdown: string | null;
  savedLineupCount: number;
  savedProfileCounts: Record<PlayerStatProfileMode, number>;
  onSearchChange: (value: string) => void;
  onToggleSortDropdown: () => void;
  onToggleProfileDropdown: () => void;
  onSelectSort: (value: string) => void;
  onSelectProfile: (value: PlayerStatProfileMode | "all") => void;
};

const savedSortOptions = [
  { label: "Highest OVR", value: "highestOvr" },
  { label: "Lowest OVR", value: "lowestOvr" },
  { label: "Newest Saved", value: "newest" },
  { label: "Oldest Saved", value: "oldest" },
];

const savedProfileOptions: { label: string; value: PlayerStatProfileMode | "all" }[] =
  [
    { label: "All Profiles", value: "all" },
    { label: "Career", value: "career" },
    { label: "3-Year Peak", value: "peak" },
    { label: "Latest Season", value: "current" },
  ];

export function SavedLineupsToolbar({
  savedLineupSearch,
  savedLineupSort,
  savedLineupProfileFilter,
  savedSortLabel,
  savedProfileLabel,
  openSavedDropdown,
  savedLineupCount,
  savedProfileCounts,
  onSearchChange,
  onToggleSortDropdown,
  onToggleProfileDropdown,
  onSelectSort,
  onSelectProfile,
}: SavedLineupsToolbarProps) {
  return (
    <>
      <div className="flex items-center justify-center gap-2 lg:gap-4">
        <input
          type="text"
          value={savedLineupSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search saved lineups..."
          className="h-8 min-w-0 flex-1 rounded-md border border-[rgb(var(--court-accent-rgb)/0.22)] bg-[color:color-mix(in_srgb,var(--court-panel)_72%,transparent)] px-2 font-michroma text-[7px] text-white outline-none transition placeholder:text-white/30 focus:border-[rgb(var(--court-accent-rgb)/0.75)] focus:bg-[color:color-mix(in_srgb,var(--court-panel-alt)_78%,transparent)] lg:h-auto lg:max-w-md lg:px-4 lg:py-3 lg:text-xs"
        />

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={onToggleProfileDropdown}
            className={`flex h-8 min-w-24 cursor-pointer items-center justify-between gap-1 rounded-md border px-2 font-michroma text-[7px] transition lg:h-auto lg:min-w-42 lg:gap-3 lg:px-4 lg:py-3 lg:text-xs ${
              savedLineupProfileFilter !== "all"
                ? "scale-[1.02] border-[rgb(var(--court-accent-rgb)/0.7)] bg-[rgb(var(--court-accent-rgb)/0.1)] text-[var(--court-accent)] ring-1 ring-[rgb(var(--court-accent-rgb)/0.25)]"
                : "border-white/15 bg-black/30 text-white/60 hover:border-white/40"
            }`}
          >
            <span>{savedProfileLabel}</span>
            <span className="text-[var(--court-accent)]">v</span>
          </button>

          {openSavedDropdown === "profile" && (
            <div className="absolute right-0 top-full z-100 mt-1 w-32 animate-[dropdownIn_140ms_ease-out_both] overflow-hidden rounded-md border border-white/15 bg-[var(--court-panel-alt)] shadow-[0_0_20px_rgba(0,0,0,0.45)] lg:mt-2 lg:w-full">
              {savedProfileOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSelectProfile(option.value)}
                  className={`block w-full cursor-pointer px-2 py-2 text-left font-michroma text-[7px] transition lg:px-4 lg:py-3 lg:text-xs ${
                    savedLineupProfileFilter === option.value
                      ? "bg-[rgb(var(--court-accent-rgb)/0.1)] text-[var(--court-accent)]"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={onToggleSortDropdown}
            className={`flex h-8 min-w-24 cursor-pointer items-center justify-between gap-1 rounded-md border px-2 font-michroma text-[7px] transition lg:h-auto lg:min-w-48 lg:gap-3 lg:px-4 lg:py-3 lg:text-xs ${
              savedLineupSort !== "highestOvr"
                ? "scale-[1.02] border-[rgb(var(--court-accent-rgb)/0.7)] bg-[rgb(var(--court-accent-rgb)/0.1)] text-[var(--court-accent)] ring-1 ring-[rgb(var(--court-accent-rgb)/0.25)]"
                : "border-white/15 bg-black/30 text-white/60 hover:border-white/40"
            }`}
          >
            <span>Sort: {savedSortLabel}</span>
            <span className="text-[var(--court-accent)]">v</span>
          </button>

          {openSavedDropdown === "sort" && (
            <div className="absolute right-0 top-full z-100 mt-1 w-32 animate-[dropdownIn_140ms_ease-out_both] overflow-hidden rounded-md border border-white/15 bg-[var(--court-panel-alt)] shadow-[0_0_20px_rgba(0,0,0,0.45)] lg:mt-2 lg:w-full">
              {savedSortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSelectSort(option.value)}
                  className={`block w-full cursor-pointer px-2 py-2 text-left font-michroma text-[7px] transition lg:px-4 lg:py-3 lg:text-xs ${
                    savedLineupSort === option.value
                      ? "bg-[rgb(var(--court-accent-rgb)/0.1)] text-[var(--court-accent)]"
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

        <p className="text-center font-michroma text-[5.5px] uppercase text-white/30 lg:text-[8px]">
          Career {savedProfileCounts.career} · Peak {savedProfileCounts.peak} ·
          Latest {savedProfileCounts.current}
        </p>
      </div>
    </>
  );
}
