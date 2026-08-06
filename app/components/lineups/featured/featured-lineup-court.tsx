import { useMemo, useState } from "react";
import type { LineupSlot, Player } from "../../court-data";
import type { LineupDetail } from "../shared/lineup-types";
import { LineupMarker } from "../featured/lineup-marker";

type FeaturedLineupCourtProps = {
  players: Player[];
  selectedLineup: LineupDetail;
  selectedCategoryColor: string;
  hoveredLineupPlayer: string;
  onHoverPlayer: (playerName: string) => void;
  onViewCard: (playerName: string) => void;
};

const featuredCourtMarkerPositions: Record<
  LineupSlot,
  {
    left: string;
    top: string;
  }
> = {
  PG: { left: "50%", top: "6%" },
  SG: { left: "22%", top: "22%" },
  SF: { left: "78%", top: "74%" },
  PF: { left: "25%", top: "68%" },
  C: { left: "65%", top: "42%" },
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
  const playersByName = useMemo(
    () => new Map(players.map((player) => [player.name, player])),
    [players],
  );

  return (
    <div
      className="flex justify-center"
      onClick={() => setOpenTooltipPlayer(null)}
    >
      <div className="relative h-[19rem] w-full max-w-[22rem] overflow-visible rounded-md bg-transparent lg:h-[30rem] lg:max-w-none">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 8 92 L 8 70 A 42 42 0 0 1 92 70 L 92 92"
            fill="none"
            stroke={selectedCategoryColor}
            strokeOpacity="0.55"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
          />
          <rect
            x="40"
            y="63"
            width="20"
            height="29"
            fill="none"
            stroke={selectedCategoryColor}
            strokeOpacity="0.55"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M 40 63 A 10 10 0 0 1 60 63"
            fill="none"
            stroke={selectedCategoryColor}
            strokeOpacity="0.55"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
          />
          <circle
            cx="50"
            cy="86"
            r="1.4"
            fill="none"
            stroke={selectedCategoryColor}
            strokeOpacity="0.85"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1="43"
            x2="57"
            y1="86"
            y2="86"
            stroke={selectedCategoryColor}
            strokeOpacity="0.85"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

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
                player={playersByName.get(playerName)}
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
                className=""
                style={featuredCourtMarkerPositions[lineupPosition]}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
