import type { RefObject } from "react";
import type { Player, StatMode } from "../court-data";
import type { PlayerStatProfileMode } from "../player-ratings";
import { ArchetypeHeader } from "./archetype-header";
import { ArchetypeCardGrid } from "./archetype-card-grid";
import { ArchetypeDescriptionPanel } from "./archetype-description-panel";
import { ArchetypePlayerList } from "./archetype-player-list";
import type { archetypeInfoByLabel } from "./archetype-metadata";
import { RankingStatProfileFilter } from "./ranking-stat-profile-filter";

type ArchetypeOptionDetail = {
  label: string;
  archetype:
    | Parameters<
        typeof import("./ranking-style-helpers").getArchetypePillStyle
      >[0]
    | null;
};

type ArchetypeInfo =
  (typeof archetypeInfoByLabel)[keyof typeof archetypeInfoByLabel];

type ArchetypesSectionProps = {
  players: Player[];
  archetypeOptionDetails: ArchetypeOptionDetail[];
  archetypeSort: "rarity" | "name";
  selectedArchetype: string;
  selectedArchetypeColor?: string;
  selectedArchetypeInfo: ArchetypeInfo | undefined;
  selectedArchetypePlayers: Player[];
  archetypeDescriptionRef: RefObject<HTMLDivElement | null>;
  statProfileFilter: PlayerStatProfileMode;
  statMode: StatMode;
  isProfileFilterOpen: boolean;
  onToggleProfileFilter: () => void;
  onSelectProfileFilter: (profile: PlayerStatProfileMode) => void;
  onToggleArchetypeSort: () => void;
  onSelectArchetype: (label: string) => void;
  onViewPlayer: (playerName: string) => void;
};

export function ArchetypesSection({
  players,
  archetypeOptionDetails,
  archetypeSort,
  selectedArchetype,
  selectedArchetypeColor,
  selectedArchetypeInfo,
  selectedArchetypePlayers,
  archetypeDescriptionRef,
  statProfileFilter,
  statMode,
  isProfileFilterOpen,
  onToggleProfileFilter,
  onSelectProfileFilter,
  onToggleArchetypeSort,
  onSelectArchetype,
  onViewPlayer,
}: ArchetypesSectionProps) {
  return (
    <>
      <ArchetypeHeader />

      <div className="mt-3 flex justify-center gap-2">
        <RankingStatProfileFilter
          isOpen={isProfileFilterOpen}
          selectedProfile={statProfileFilter}
          onToggle={onToggleProfileFilter}
          onSelectProfile={onSelectProfileFilter}
        />

        <button
          type="button"
          onClick={onToggleArchetypeSort}
          className="flex h-6 scale-[1.02] cursor-pointer items-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.6)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-2 font-michroma text-[9px] text-[var(--court-accent)] ring-1 ring-[rgb(var(--court-accent-rgb)/0.3)] transition hover:border-[rgb(var(--court-accent-rgb)/0.8)] lg:h-auto lg:px-3 lg:py-1 lg:text-xs"
        >
          Sort: {archetypeSort === "rarity" ? "Rarity" : "A-Z"}
        </button>
      </div>

      <ArchetypeCardGrid
        players={players}
        statProfileFilter={statProfileFilter}
        statMode={statMode}
        archetypeOptionDetails={archetypeOptionDetails}
        selectedArchetype={selectedArchetype}
        onSelectArchetype={onSelectArchetype}
      />

      {selectedArchetype && (
        <ArchetypeDescriptionPanel
          ref={archetypeDescriptionRef}
          archetypeLabel={selectedArchetype}
          archetypeInfo={selectedArchetypeInfo}
          selectedArchetypeColor={selectedArchetypeColor}
        />
      )}

      <ArchetypePlayerList
        players={selectedArchetypePlayers}
        statProfileFilter={statProfileFilter}
        onViewPlayer={onViewPlayer}
      />
    </>
  );
}

