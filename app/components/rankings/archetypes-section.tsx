import type { RefObject } from "react";
import type { Player, StatMode } from "../court-data";
import type { PlayerStatProfileMode } from "../player-ratings";
import { ArchetypeHeader } from "./archetype-header";
import { ArchetypeCardGrid } from "./archetype-card-grid";
import { ArchetypeDescriptionPanel } from "./archetype-description-panel";
import { ArchetypePlayerList } from "./archetype-player-list";
import type { archetypeInfoByLabel } from "./archetype-metadata";

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
  selectedArchetype: string;
  selectedArchetypeColor?: string;
  selectedArchetypeInfo: ArchetypeInfo | undefined;
  selectedArchetypePlayers: Player[];
  archetypeDescriptionRef: RefObject<HTMLDivElement | null>;
  statProfileFilter: PlayerStatProfileMode;
  statMode: StatMode;
  onSelectArchetype: (label: string) => void;
  onViewPlayer: (playerName: string) => void;
};

export function ArchetypesSection({
  players,
  archetypeOptionDetails,
  selectedArchetype,
  selectedArchetypeColor,
  selectedArchetypeInfo,
  selectedArchetypePlayers,
  archetypeDescriptionRef,
  statProfileFilter,
  statMode,
  onSelectArchetype,
  onViewPlayer,
}: ArchetypesSectionProps) {
  return (
    <>
      <ArchetypeHeader />

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
