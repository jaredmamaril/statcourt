import type { RefObject } from "react";
import type { Player } from "../court-data";
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
  archetypeOptionDetails: ArchetypeOptionDetail[];
  selectedArchetype: string;
  selectedArchetypeInfo: ArchetypeInfo | undefined;
  selectedArchetypePlayers: Player[];
  archetypeDescriptionRef: RefObject<HTMLDivElement | null>;
  onSelectArchetype: (label: string) => void;
  onViewPlayer: (playerName: string) => void;
};

export function ArchetypesSection({
  archetypeOptionDetails,
  selectedArchetype,
  selectedArchetypeInfo,
  selectedArchetypePlayers,
  archetypeDescriptionRef,
  onSelectArchetype,
  onViewPlayer,
}: ArchetypesSectionProps) {
  return (
    <>
      <ArchetypeHeader />

      <ArchetypeCardGrid
        archetypeOptionDetails={archetypeOptionDetails}
        selectedArchetype={selectedArchetype}
        onSelectArchetype={onSelectArchetype}
      />

      {selectedArchetype && (
        <ArchetypeDescriptionPanel
          ref={archetypeDescriptionRef}
          archetypeLabel={selectedArchetype}
          archetypeInfo={selectedArchetypeInfo}
        />
      )}

      <ArchetypePlayerList
        players={selectedArchetypePlayers}
        onViewPlayer={onViewPlayer}
      />
    </>
  );
}
