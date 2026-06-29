import type { LineupSlot } from "../../court-data";
import { builderCourtMarkerPositions } from "../featured/featured-lineups";
import { LineupMarker } from "../featured/lineup-marker";
import {
  getPlayerRevealDelay,
  type PlayerRevealMode,
} from "./builder-lineup-helpers";

type BuilderCourtPreviewProps = {
  lineupPositions: LineupSlot[];
  customLineup: Record<LineupSlot, string>;
  hoveredBuildPlayer: string;
  playerRevealMode: PlayerRevealMode;
  onViewCard: (playerName: string) => void;
};

export function BuilderCourtPreview({
  lineupPositions,
  customLineup,
  hoveredBuildPlayer,
  playerRevealMode,
  onViewCard,
}: BuilderCourtPreviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-120 overflow-visible bg-transparent">
        <div className="absolute left-1/2 bottom-10 h-[63%] w-[88%] -translate-x-1/2 rounded-t-full border-t border-l border-r border-[#1bc2ec]/25" />

        <div className="absolute left-1/2 bottom-10 h-40 w-28 -translate-x-1/2 border border-[#1bc2ec]/25" />

        <div className="absolute left-1/2 bottom-50 h-14 w-28 -translate-x-1/2 rounded-t-full border-t border-l border-r border-[#1bc2ec]/25" />

        <div className="absolute left-1/2 bottom-20 h-3 w-3 -translate-x-1/2 rounded-full border border-[#1bc2ec]/60" />

        <div className="absolute left-1/2 bottom-20 h-px w-16 -translate-x-1/2 bg-[#1bc2ec]/60" />

        {lineupPositions.map((position) => {
          const playerName = customLineup[position];
          const positionIndex = lineupPositions.indexOf(position);

          return (
            <LineupMarker
              key={`${position}-${playerName || "empty"}`}
              position={position}
              name={playerName || "Select Player"}
              color="#1bc2ec"
              isHighlighted={
                Boolean(playerName) && hoveredBuildPlayer === playerName
              }
              onViewCard={onViewCard}
              tooltipPosition={
                position === "PG" || position === "SG" ? "bottom" : "top"
              }
              animationDelay={getPlayerRevealDelay(
                playerRevealMode,
                positionIndex,
              )}
              className={builderCourtMarkerPositions[position]}
            />
          );
        })}
      </div>
    </div>
  );
}
