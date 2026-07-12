import type { CSSProperties, RefObject } from "react";
import type { Player } from "../../court-data";
import type { LineupDetail } from "../shared/lineup-types";
import type { LineupCategory, LineupName } from "./featured-lineups";
import { FeaturedLineupSelector } from "./featured-lineup-selector";
import { FeaturedLineupInfo } from "./featured-lineup-info";
import { FeaturedLineupCourt } from "./featured-lineup-court";

type FeaturedLineupDetailProps = {
  players: Player[];
  lineupSectionRef: RefObject<HTMLDivElement | null>;
  selectedLineupCategory: LineupCategory;
  selectedLineupName: LineupName | "";
  selectedLineup: LineupDetail | null;
  selectedLineupNames: LineupName[];
  selectedLineupAchievements: string[];
  selectedCategoryColor: string;
  detailPulseKey: number;
  hoveredLineupPlayer: string;
  onSelectLineup: (lineupName: LineupName) => void;
  onHoverPlayer: (playerName: string) => void;
  onViewCard: (playerName: string) => void;
};

export function FeaturedLineupDetail({
  players,
  lineupSectionRef,
  selectedLineupCategory,
  selectedLineupName,
  selectedLineup,
  selectedLineupNames,
  selectedLineupAchievements,
  selectedCategoryColor,
  detailPulseKey,
  hoveredLineupPlayer,
  onSelectLineup,
  onHoverPlayer,
  onViewCard,
}: FeaturedLineupDetailProps) {
  return (
    <div
      ref={lineupSectionRef}
      className="scroll-mt-24 mt-4 animate-[pageEnter_220ms_ease-out_both] rounded-md border border-white/10 bg-black/25 p-2 lg:mt-8 lg:p-4"
    >
      <h2
        className="border-b pb-1.5 text-center font-michroma text-[10px] uppercase tracking-wide text-white lg:pb-3 lg:text-sm"
        style={{ borderColor: `${selectedCategoryColor}55` }}
      >
        {selectedLineupCategory}
      </h2>

      <div className="mt-2 grid gap-2 lg:mt-5 lg:grid-cols-[220px_1fr] lg:gap-6">
        <FeaturedLineupSelector
          selectedLineupNames={selectedLineupNames}
          selectedLineupName={selectedLineupName}
          selectedCategoryColor={selectedCategoryColor}
          onSelectLineup={onSelectLineup}
        />

        <div
          key={detailPulseKey}
          className="relative min-h-0 animate-[playerListRowIn_220ms_ease-out_both] rounded-md border bg-black/30 p-2 outline outline-1 outline-transparent lg:min-h-96 lg:p-5"
          style={{
            borderColor: `${selectedCategoryColor}55`,
            animation:
              "playerListRowIn 220ms ease-out both, lineupDetailPulse 520ms ease-out 980ms both",
            "--lineup-pulse-color": `${selectedCategoryColor}44`,
          } as CSSProperties}
        >
          {selectedLineup ? (
            <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr] lg:gap-6">
              <FeaturedLineupInfo
                selectedLineup={selectedLineup}
                selectedLineupName={selectedLineupName}
                selectedCategoryColor={selectedCategoryColor}
                selectedLineupAchievements={selectedLineupAchievements}
                hoveredLineupPlayer={hoveredLineupPlayer}
                onHoverPlayer={onHoverPlayer}
              />

              <FeaturedLineupCourt
                players={players}
                selectedLineup={selectedLineup}
                selectedCategoryColor={selectedCategoryColor}
                hoveredLineupPlayer={hoveredLineupPlayer}
                onHoverPlayer={onHoverPlayer}
                onViewCard={onViewCard}
              />
            </div>
          ) : (
            <p className="font-michroma text-[10px] text-white/40 lg:text-xs">
              No current details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
