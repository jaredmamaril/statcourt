import {
  getPlayerInsights,
  type Position,
  type SortValue,
  type Team,
  type SortDirection,
} from "../../court-data";

import { TeamFilterDropdown } from "./team-filter-dropdown";
import { PositionFilterDropdown } from "./position-filter-dropdown";
import { SortFilterDropdown } from "./sort-filter-dropdown";
import { ArchetypeFilterDropdown } from "./archetype-filter-dropdown";

type ArchetypeOption = NonNullable<
  ReturnType<typeof getPlayerInsights>["archetype"]
>;

type OpenDropdown = "team" | "position" | "sort" | "archetype" | null;

type PlayerFiltersProps = {
  filtersRef: React.RefObject<HTMLDivElement | null>;
  showFavorites: boolean;
  favoritesCount: number;
  filteredTeam: Team | "";
  teamOptions: Team[];
  filteredPosition: Position | "";
  filteredArchetype: string;
  archetypeOptions: ArchetypeOption[];
  onSelectArchetype: (archetype: string) => void;
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
  teamOptions,
  filteredPosition,
  filteredArchetype,
  archetypeOptions,
  onSelectArchetype,
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
  return (
    <div
      ref={filtersRef}
      className="mb-4 flex flex-wrap items-center justify-center gap-2"
    >
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

      <TeamFilterDropdown
        teamOptions={teamOptions}
        filteredTeam={filteredTeam}
        isOpen={openDropdown === "team"}
        onOpenDropdown={() =>
          onOpenDropdown(openDropdown === "team" ? null : "team")
        }
        onSelectTeam={onSelectTeam}
      />

      <PositionFilterDropdown
        filteredPosition={filteredPosition}
        isOpen={openDropdown === "position"}
        onOpenDropdown={() =>
          onOpenDropdown(openDropdown === "position" ? null : "position")
        }
        onSelectPosition={onSelectPosition}
      />

      <ArchetypeFilterDropdown
        filteredArchetype={filteredArchetype}
        archetypeOptions={archetypeOptions}
        isOpen={openDropdown === "archetype"}
        onOpenDropdown={() =>
          onOpenDropdown(openDropdown === "archetype" ? null : "archetype")
        }
        onSelectArchetype={onSelectArchetype}
      />

      <SortFilterDropdown
        sortBy={sortBy}
        sortDirection={sortDirection}
        isOpen={openDropdown === "sort"}
        onOpenDropdown={() =>
          onOpenDropdown(openDropdown === "sort" ? null : "sort")
        }
        onSelectSort={onSelectSort}
      />

      {hasActiveFilters && (
        <div className="flex basis-full justify-center">
          <button
            type="button"
            onClick={onResetFilters}
            className="cursor-pointer rounded-md border border-white/20 bg-black/10 px-2 py-1 font-michroma text-xs text-white/60 transition-all duration-200 hover:border-red-700/60 hover:text-red-700"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
