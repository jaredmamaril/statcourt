import { memo, useMemo, useState } from "react";
import type { LineupSlot, Player } from "../../court-data";
import { builderCourtMarkerPositions } from "../featured/featured-lineups";
import { LineupMarker } from "../featured/lineup-marker";
import {
  getPlayerRevealDelay,
  type PlayerRevealMode,
} from "./builder-lineup-helpers";

type BuilderCourtPreviewProps = {
  players: Player[];
  lineupPositions: LineupSlot[];
  customLineup: Record<LineupSlot, string>;
  hoveredBuildPlayer: string;
  playerRevealMode: PlayerRevealMode;
  onViewCard: (playerName: string) => void;
};

function BuilderCourtPreviewComponent({
  players,
  lineupPositions,
  customLineup,
  hoveredBuildPlayer,
  playerRevealMode,
  onViewCard,
}: BuilderCourtPreviewProps) {
  const [openTooltipPlayer, setOpenTooltipPlayer] = useState<string | null>(
    null,
  );
  const playersByName = useMemo(
    () => new Map(players.map((player) => [player.name, player])),
    [players],
  );

  return (
    <div
      className="flex flex-col gap-4"
      onClick={() => setOpenTooltipPlayer(null)}
    >
      <div className="relative mx-auto h-76 w-full max-w-80 overflow-hidden rounded-md bg-transparent lg:h-120 lg:max-w-none lg:overflow-visible">
        <div className="absolute left-1/2 bottom-8 h-[62%] w-[82%] -translate-x-1/2 rounded-t-full border-t border-l border-r border-[rgb(var(--court-accent-rgb)/0.25)] lg:bottom-10 lg:h-[63%] lg:w-[88%]" />

        <div className="absolute left-1/2 bottom-8 h-28 w-20 -translate-x-1/2 border border-[rgb(var(--court-accent-rgb)/0.25)] lg:bottom-10 lg:h-40 lg:w-28" />

        <div className="absolute left-1/2 bottom-36 h-10 w-20 -translate-x-1/2 rounded-t-full border-t border-l border-r border-[rgb(var(--court-accent-rgb)/0.25)] lg:bottom-50 lg:h-14 lg:w-28" />

        <div className="absolute left-1/2 bottom-15 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-[rgb(var(--court-accent-rgb)/0.6)] lg:bottom-20 lg:h-3 lg:w-3" />

        <div className="absolute left-1/2 bottom-15 h-px w-12 -translate-x-1/2 bg-[rgb(var(--court-accent-rgb)/0.6)] lg:bottom-20 lg:w-16" />

        {lineupPositions.map((position) => {
          const playerName = customLineup[position];
          const player = playersByName.get(playerName);
          const positionIndex = lineupPositions.indexOf(position);

          return (
            <LineupMarker
              key={`${position}-${playerName || "empty"}`}
              players={players}
              player={player}
              position={position}
              name={playerName || "Select Player"}
              color="var(--court-accent)"
              isHighlighted={
                Boolean(playerName) &&
                (hoveredBuildPlayer === playerName ||
                  openTooltipPlayer === playerName)
              }
              onViewCard={onViewCard}
              tooltipPosition={
                position === "PG" || position === "SG" ? "bottom" : "top"
              }
              isTooltipOpen={openTooltipPlayer === playerName}
              onToggleTooltip={() => {
                const isAlreadyOpen = openTooltipPlayer === playerName;

                setOpenTooltipPlayer(isAlreadyOpen ? null : playerName);
              }}
              onCloseTooltip={() => setOpenTooltipPlayer(null)}
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

export const BuilderCourtPreview = memo(BuilderCourtPreviewComponent);
