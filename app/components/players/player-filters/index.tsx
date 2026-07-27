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
import { ViewFilterDropdown } from "./view-filter-dropdown";
import type { PlayerRatingCategory } from "../../player-ratings";
import type { DefaultPlayerView } from "../../../lib/use-user-settings";

type ArchetypeOption = NonNullable<
  ReturnType<typeof getPlayerInsights>["archetype"]
>;

type OpenDropdown =
  | "team"
  | "position"
  | "sort"
  | "archetype"
  | "skill"
  | "view"
  | null;

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
  selectedView: DefaultPlayerView;
  onSelectView: (view: DefaultPlayerView) => void;
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
  selectedView,
  onSelectView,
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
            ? "scale-[1.02] border-[rgb(var(--court-accent-rgb)/0.7)] bg-[color:color-mix(in_srgb,var(--court-accent)_38%,var(--court-panel-alt))] text-[var(--court-accent)] ring-1 ring-[rgb(var(--court-accent-rgb)/0.45)]"
            : "border-white/20 bg-[color:color-mix(in_srgb,var(--court-panel)_86%,black)] text-white/70 hover:border-white/60"
        }`}
      >
        <span>☆</span>
        Favorites
        {favoritesCount > 0 && (
          <span className="ml-0.5 text-[7px] opacity-70 sm:text-[10px]">
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
        sortDirection={sortDirection}
        isOpen={openDropdown === "skill"}
        onOpenDropdown={() =>
          onOpenDropdown(openDropdown === "skill" ? null : "skill")
        }
        onSelectSkill={onSelectSkill}
      />

      <ViewFilterDropdown
        selectedView={selectedView}
        isOpen={openDropdown === "view"}
        onOpenDropdown={() =>
          onOpenDropdown(openDropdown === "view" ? null : "view")
        }
        onSelectView={onSelectView}
      />

      {hasActiveFilters && (
        <div className="flex basis-full justify-center">
          <button
            type="button"
            onClick={onResetFilters}
            className="cursor-pointer rounded-md border border-white/20 bg-[color:color-mix(in_srgb,var(--court-panel)_86%,black)] px-2 py-1 font-michroma text-[9px] text-white/60 transition-all duration-200 hover:border-red-700/60 hover:text-red-700 sm:text-xs"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

