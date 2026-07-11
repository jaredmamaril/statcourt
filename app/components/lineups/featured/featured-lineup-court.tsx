import { useState } from "react";
import type { LineupSlot, Player } from "../../court-data";
import type { LineupDetail } from "../shared/lineup-types";
import { featuredCourtMarkerPositions } from "./featured-lineups";
import { LineupMarker } from "../featured/lineup-marker";

type FeaturedLineupCourtProps = {
  players: Player[];
  selectedLineup: LineupDetail;
  selectedCategoryColor: string;
  hoveredLineupPlayer: string;
  onHoverPlayer: (playerName: string) => void;
  onViewCard: (playerName: string) => void;
};

export function FeaturedLineupCourt({
  players,
  selectedLineup,
  selectedCategoryColor,
  hoveredLineupPlayer,
  onHoverPlayer,
  onViewCard,
}: FeaturedLineupCourtProps) {
  const [openTooltipPlayer, setOpenTooltipPlayer] = useState<string | null>(
    null,
  );
  return (
    <div
      className="relative min-h-72 overflow-visible rounded-md bg-transparent lg:min-h-96"
      onClick={() => setOpenTooltipPlayer(null)}
    >
      <div className="absolute inset-x-8 inset-y-6" />

      <div
        className="absolute left-1/2 bottom-12 h-[58%] w-[72%] -translate-x-1/2 rounded-t-full border-t border-l border-r lg:bottom-17 lg:h-[60%] lg:w-[70%]"
        style={{
          borderColor: `${selectedCategoryColor}40`,
        }}
      />

      <div
        className="absolute left-1/2 bottom-12 h-28 w-18 -translate-x-1/2 border lg:bottom-17 lg:h-36 lg:w-24"
        style={{
          borderColor: `${selectedCategoryColor}40`,
        }}
      />

      <div
        className="absolute left-1/2 bottom-40 h-9 w-18 -translate-x-1/2 rounded-t-full border-t border-l border-r lg:bottom-53 lg:h-12 lg:w-24"
        style={{
          borderColor: `${selectedCategoryColor}40`,
        }}
      />

      <div
        className="absolute left-1/2 bottom-18 h-2.5 w-2.5 -translate-x-1/2 rounded-full border lg:bottom-24 lg:h-3 lg:w-3"
        style={{
          borderColor: `${selectedCategoryColor}80`,
        }}
      />

      <div
        className="absolute left-1/2 bottom-18 h-px w-10 -translate-x-1/2 lg:bottom-24 lg:w-14"
        style={{
          backgroundColor: `${selectedCategoryColor}80`,
        }}
      />

      {Object.entries(selectedLineup.players).map(([position, playerName]) => {
        const lineupPosition = position as LineupSlot;

        return (
          <div
            key={`${lineupPosition}-${playerName || "empty"}`}
            onMouseEnter={() => onHoverPlayer(playerName)}
            onMouseLeave={() => {
              onHoverPlayer("");
              setOpenTooltipPlayer(null);
            }}
          >
            <LineupMarker
              players={players}
              position={lineupPosition}
              name={playerName || "Select Player"}
              color={selectedCategoryColor}
              isHighlighted={hoveredLineupPlayer === playerName}
              isTooltipOpen={openTooltipPlayer === playerName}
              onToggleTooltip={() => {
                const isAlreadyOpen = openTooltipPlayer === playerName;

                setOpenTooltipPlayer(isAlreadyOpen ? null : playerName);
                onHoverPlayer(isAlreadyOpen ? "" : playerName);
              }}
              onCloseTooltip={() => setOpenTooltipPlayer(null)}
              onViewCard={onViewCard}
              tooltipPosition={
                lineupPosition === "PG" || lineupPosition === "SG"
                  ? "bottom"
                  : "top"
              }
              className={featuredCourtMarkerPositions[lineupPosition]}
            />
          </div>
        );
      })}
    </div>
  );
}
