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
import { SkillFilterDropdown } from "./skill-filter-dropdown";
import type { PlayerRatingCategory } from "../../player-ratings";

type ArchetypeOption = NonNullable<
  ReturnType<typeof getPlayerInsights>["archetype"]
>;

type OpenDropdown = "team" | "position" | "sort" | "archetype" | "skill" | null;

type PlayerFiltersProps = {
  filtersRef: React.RefObject<HTMLDivElement | null>;
  showFavorites: boolean;
  favoritesCount: number;
  filteredTeam: Team | "";
  teamOptions: Team[];
  filteredPosition: Position | "";
  filteredArchetype: string;
  hasUnclassifiedPlayers: boolean;
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
  selectedSkill: PlayerRatingCategory;
  onSelectSkill: (skill: PlayerRatingCategory) => void;
};

export function PlayerFilters({
  filtersRef,
  showFavorites,
  favoritesCount,
  filteredTeam,
  teamOptions,
  filteredPosition,
  filteredArchetype,
  hasUnclassifiedPlayers,
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
  selectedSkill,
  onSelectSkill,
}: PlayerFiltersProps) {
  return (
    <div
      ref={filtersRef}
      className="statcourt-scroll mx-auto mb-3 flex max-w-75 flex-wrap items-center justify-center gap-1.5 sm:mb-4 sm:max-w-175 sm:gap-2"
    >
      <button
        type="button"
        onClick={onToggleFavorites}
        className={`flex h-6 cursor-pointer items-center gap-1 rounded-md border px-2 font-michroma text-[10px] transition-all duration-200 sm:h-auto sm:gap-1.5 sm:py-1 sm:text-xs ${
          showFavorites
            ? "border-[#1bc2ec]/70 bg-[#1bc2ec]/10 text-[#1bc2ec]/90"
            : "border-white/20 bg-black/10 text-white/60 hover:border-white/60"
        }`}
      >
        <span>☆</span>
        Favorites
        {favoritesCount > 0 && (
          <span className="ml-0.5 text-[9px] opacity-70 sm:text-[10px]">
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
        hasUnclassifiedPlayers={hasUnclassifiedPlayers}
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

      <SkillFilterDropdown
        selectedSkill={selectedSkill}
        isOpen={openDropdown === "skill"}
        onOpenDropdown={() =>
          onOpenDropdown(openDropdown === "skill" ? null : "skill")
        }
        onSelectSkill={onSelectSkill}
      />

      {hasActiveFilters && (
        <div className="flex basis-full justify-center">
          <button
            type="button"
            onClick={onResetFilters}
            className="cursor-pointer rounded-md border border-white/20 bg-black/10 px-2 py-1 font-michroma text-[9px] text-white/60 transition-all duration-200 hover:border-red-700/60 hover:text-red-700 sm:text-xs"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
