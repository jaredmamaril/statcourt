import Image from "next/image";
import {
  positions,
  sortOptions,
  teams,
  teamColors,
  teamLogos,
  type Position,
  type SortValue,
  type Team,
  type SortDirection,
} from "../court-data";

type OpenDropdown = "team" | "position" | "sort" | null;

type PlayerFiltersProps = {
  filtersRef: React.RefObject<HTMLDivElement | null>;
  showFavorites: boolean;
  favoritesCount: number;
  filteredTeam: Team | "";
  filteredPosition: Position | "";
  sortBy: SortValue;
  sortDirection: SortDirection;
  openDropdown: OpenDropdown;
  hasActiveFilters: boolean;
  onToggleFavorites: () => void;
  onOpenDropdown: (dropdown: OpenDropdown) => void;
  onSelectTeam: (team: Team | "") => void;
  onSelectPosition: (position: Position | "") => void;
  onSelectSort: (sort: SortValue) => void;
  onResetFilters: () => void;
};

export function PlayerFilters({
  filtersRef,
  showFavorites,
  favoritesCount,
  filteredTeam,
  filteredPosition,
  sortBy,
  sortDirection,
  openDropdown,
  hasActiveFilters,
  onToggleFavorites,
  onOpenDropdown,
  onSelectTeam,
  onSelectPosition,
  onSelectSort,
  onResetFilters,
}: PlayerFiltersProps) {
  const selectedSortOption = sortOptions.find(
    (option) => option.value === sortBy,
  );

  return (
    <div
      ref={filtersRef}
      className="mb-4 flex flex-wrap items-center justify-center gap-2"
    >
      {/* Favorites filter */}
      <button
        type="button"
        onClick={onToggleFavorites}
        className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 font-michroma text-xs transition-all duration-200 ${
          showFavorites
            ? "border-[#1bc2ec]/70 bg-[#1bc2ec]/10 text-[#1bc2ec]/90"
            : "border-white/20 bg-black/10 text-white/60 hover:border-white/60"
        }`}
      >
        <span>☆</span>
        Favorites
        {favoritesCount > 0 && (
          <span className="ml-0.5 text-[10px] opacity-70">
            ({favoritesCount})
          </span>
        )}
      </button>

      {/* Team filter */}
      <div className="relative">
        <button
          type="button"
          onClick={() =>
            onOpenDropdown(openDropdown === "team" ? null : "team")
          }
          className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 font-michroma text-xs transition-all duration-200 ${
            filteredTeam
              ? "bg-[#1bc2ec]/10"
              : "border-white/20 bg-black/10 text-white/60 hover:border-white/60"
          }`}
          style={{
            color: filteredTeam ? teamColors[filteredTeam] : undefined,
            borderColor: filteredTeam ? teamColors[filteredTeam] : undefined,
          }}
        >
          {filteredTeam && (
            <Image
              src={teamLogos[filteredTeam]}
              alt={`${filteredTeam} logo`}
              width={16}
              height={16}
              className="h-4 w-4 shrink-0 object-contain"
            />
          )}
          <span>{filteredTeam || "All Teams"}</span>
          <span className="text-[#1bc2ec]">▾</span>
        </button>

        {openDropdown === "team" && (
          <div className="absolute left-0 top-full z-30 mt-2 max-h-40 w-36 overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1 shadow-xl">
            <button
              type="button"
              onClick={() => onSelectTeam("")}
              className="block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs text-white/70 hover:bg-white/10"
            >
              All Teams
            </button>

            {teams.map((team) => (
              <button
                key={team}
                type="button"
                onClick={() => onSelectTeam(team)}
                className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs ${
                  filteredTeam === team
                    ? "bg-[#1bc2ec]/10 text-[#1bc2ec]"
                    : "text-white/70 hover:bg-white/10"
                }`}
                style={{ color: teamColors[team] }}
              >
                <span className="flex items-center gap-2">
                  <Image
                    src={teamLogos[team]}
                    alt={`${team} logo`}
                    width={16}
                    height={16}
                    className="h-4 w-4 object-contain"
                  />
                  <span>{team}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Position filter */}
      <div className="relative">
        <button
          type="button"
          onClick={() =>
            onOpenDropdown(openDropdown === "position" ? null : "position")
          }
          className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 font-michroma text-xs transition-all duration-200 ${
            filteredPosition
              ? "border-[#1bc2ec]/70 bg-[#1bc2ec]/10 text-[#1bc2ec]"
              : "border-white/20 bg-black/10 text-white/60 hover:border-white/60"
          }`}
        >
          <span>{filteredPosition || "All Positions"}</span>
          <span className="text-[#1bc2ec]">▾</span>
        </button>

        {openDropdown === "position" && (
          <div className="absolute left-0 top-full z-30 mt-2 max-h-40 w-36 overflow-y-auto rounded-md border border-white/20 bg-[#07111f] py-1 shadow-xl">
            <button
              type="button"
              onClick={() => onSelectPosition("")}
              className="block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs text-white/70 hover:bg-white/10"
            >
              All Positions
            </button>

            {positions.map((position) => (
              <button
                key={position}
                type="button"
                onClick={() => onSelectPosition(position)}
                className={`block w-full cursor-pointer px-3 py-2 text-left font-michroma text-xs ${
                  filteredPosition === position
                    ? "bg-[#1bc2ec]/10 text-[#1bc2ec]"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                {position}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sort filter */}
      <div className="relative">
        <button
          type="button"
          onClick={() =>
            onOpenDropdown(openDropdown === "sort" ? null : "sort")
          }
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

        {openDropdown === "sort" && (
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

      {/* Reset filters button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="cursor-pointer rounded-md border border-white/20 bg-black/10 px-2 py-1 font-michroma text-xs text-white/60 transition-all duration-200 hover:border-red-700/60 hover:text-red-700"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
