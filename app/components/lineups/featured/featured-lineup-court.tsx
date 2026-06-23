import type { Position } from "../../court-data";
import type { LineupDetail } from "../shared/lineup-types";
import { featuredCourtMarkerPositions } from "./featured-lineups";
import { LineupMarker } from "../featured/lineup-marker";

type FeaturedLineupCourtProps = {
  selectedLineup: LineupDetail;
  selectedCategoryColor: string;
  hoveredLineupPlayer: string;
  onHoverPlayer: (playerName: string) => void;
  onViewCard: (playerName: string) => void;
};

export function FeaturedLineupCourt({
  selectedLineup,
  selectedCategoryColor,
  hoveredLineupPlayer,
  onHoverPlayer,
  onViewCard,
}: FeaturedLineupCourtProps) {
  return (
    <div className="relative min-h-96 overflow-visible rounded-md bg-transparent">
      <div className="absolute inset-x-8 inset-y-6" />

      <div
        className="absolute left-1/2 bottom-17 h-[60%] w-[70%] -translate-x-1/2 rounded-t-full border-t border-l border-r"
        style={{
          borderColor: `${selectedCategoryColor}40`,
        }}
      />

      <div
        className="absolute left-1/2 bottom-17 h-36 w-24 -translate-x-1/2 border"
        style={{
          borderColor: `${selectedCategoryColor}40`,
        }}
      />

      <div
        className="absolute left-1/2 bottom-53 h-12 w-24 -translate-x-1/2 rounded-t-full border-t border-l border-r"
        style={{
          borderColor: `${selectedCategoryColor}40`,
        }}
      />

      <div
        className="absolute left-1/2 bottom-24 h-3 w-3 -translate-x-1/2 rounded-full border"
        style={{
          borderColor: `${selectedCategoryColor}80`,
        }}
      />

      <div
        className="absolute left-1/2 bottom-24 h-px w-14 -translate-x-1/2"
        style={{
          backgroundColor: `${selectedCategoryColor}80`,
        }}
      />

      {Object.entries(selectedLineup.players).map(([position, playerName]) => (
        <div
          key={`${position}-${playerName || "empty"}`}
          onMouseEnter={() => onHoverPlayer(playerName)}
          onMouseLeave={() => onHoverPlayer("")}
        >
          <LineupMarker
            position={position}
            name={playerName || "Select Player"}
            color={selectedCategoryColor}
            isHighlighted={hoveredLineupPlayer === playerName}
            onViewCard={onViewCard}
            tooltipPosition={
              position === "PG" || position === "SG" ? "bottom" : "top"
            }
            className={featuredCourtMarkerPositions[position as Position]}
          />
        </div>
      ))}
    </div>
  );
}
