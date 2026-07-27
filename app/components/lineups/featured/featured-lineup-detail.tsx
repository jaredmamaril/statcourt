import type { Player } from "../../court-data";
import type { LineupDetail } from "../shared/lineup-types";
import type { LineupCategory, LineupName } from "./featured-lineups";
import { FeaturedLineupSelector } from "./featured-lineup-selector";
import { FeaturedLineupInfo } from "./featured-lineup-info";
import { FeaturedLineupCourt } from "./featured-lineup-court";

type FeaturedLineupDetailProps = {
  players: Player[];
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
  players,
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
      className="animate-[pageEnter_220ms_ease-out_both] rounded-md border border-white/15 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-2 lg:p-4"
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
          className="relative min-h-0 animate-[playerListRowIn_220ms_ease-out_both] rounded-md border bg-[color:color-mix(in_srgb,var(--court-panel-alt)_88%,black)] p-2 lg:min-h-96 lg:p-5"
          style={{
            borderColor: `${selectedCategoryColor}55`,
          }}
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
