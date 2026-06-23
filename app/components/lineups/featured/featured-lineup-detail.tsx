import type { RefObject } from "react";
import type { LineupDetail } from "../shared/lineup-types";
import type { LineupCategory, LineupName } from "./featured-lineups";
import { FeaturedLineupSelector } from "./featured-lineup-selector";
import { FeaturedLineupInfo } from "./featured-lineup-info";
import { FeaturedLineupCourt } from "./featured-lineup-court";

type FeaturedLineupDetailProps = {
  lineupSectionRef: RefObject<HTMLDivElement | null>;
  selectedLineupCategory: LineupCategory;
  selectedLineupName: LineupName | "";
  selectedLineup: LineupDetail | null;
  selectedLineupNames: LineupName[];
  selectedLineupAchievements: string[];
  selectedCategoryColor: string;
  hoveredLineupPlayer: string;
  onSelectLineup: (lineupName: LineupName) => void;
  onHoverPlayer: (playerName: string) => void;
  onViewCard: (playerName: string) => void;
};

export function FeaturedLineupDetail({
  lineupSectionRef,
  selectedLineupCategory,
  selectedLineupName,
  selectedLineup,
  selectedLineupNames,
  selectedLineupAchievements,
  selectedCategoryColor,
  hoveredLineupPlayer,
  onSelectLineup,
  onHoverPlayer,
  onViewCard,
}: FeaturedLineupDetailProps) {
  return (
    <div
      ref={lineupSectionRef}
      className="scroll-mt-24 mt-8 rounded-md border border-white/10 bg-black/25 p-4"
    >
      <h2
        className="border-b pb-3 text-center font-michroma text-sm uppercase tracking-wide text-white"
        style={{ borderColor: `${selectedCategoryColor}55` }}
      >
        {selectedLineupCategory}
      </h2>

      <div className="mt-5 grid gap-6 lg:grid-cols-[220px_1fr]">
        <FeaturedLineupSelector
          selectedLineupNames={selectedLineupNames}
          selectedLineupName={selectedLineupName}
          selectedCategoryColor={selectedCategoryColor}
          onSelectLineup={onSelectLineup}
        />

        <div
          className="relative min-h-96 rounded-md border bg-black/30 p-5"
          style={{ borderColor: `${selectedCategoryColor}55` }}
        >
          {selectedLineup ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <FeaturedLineupInfo
                selectedLineup={selectedLineup}
                selectedLineupName={selectedLineupName}
                selectedCategoryColor={selectedCategoryColor}
                selectedLineupAchievements={selectedLineupAchievements}
                hoveredLineupPlayer={hoveredLineupPlayer}
                onHoverPlayer={onHoverPlayer}
              />

              <FeaturedLineupCourt
                selectedLineup={selectedLineup}
                selectedCategoryColor={selectedCategoryColor}
                hoveredLineupPlayer={hoveredLineupPlayer}
                onHoverPlayer={onHoverPlayer}
                onViewCard={onViewCard}
              />
            </div>
          ) : (
            <p className="font-michroma text-xs text-white/40">
              No current details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
