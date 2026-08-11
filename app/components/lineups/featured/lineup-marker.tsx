import type { CSSProperties } from "react";
import type { Player } from "../../court-data";
import PlayerImage from "../../player-image";
import { getPlayerHeadshot } from "../../player-images";

type LineupMarkerProps = {
  players: Player[];
  player?: Player;
  position: string;
  name: string;
  className: string;
  style?: CSSProperties;
  color: string;
  isHighlighted: boolean;
  onViewCard: (playerName: string) => void;
  tooltipPosition?: "top" | "bottom";
  animationDelay?: string;
  isTooltipOpen: boolean;
  onToggleTooltip: () => void;
  onCloseTooltip: () => void;
};

export function LineupMarker({
  players,
  player: providedPlayer,
  position,
  name,
  className,
  style,
  color,
  isHighlighted,
  onViewCard,
  tooltipPosition = "top",
  animationDelay = "0ms",
  isTooltipOpen,
  onToggleTooltip,
  onCloseTooltip,
}: LineupMarkerProps) {
  const player =
    providedPlayer ?? players.find((player) => player.name === name);
  const imageSrc = player ? getPlayerHeadshot(player) : "/blank-player.svg";
  const tooltipClass =
    tooltipPosition === "bottom" ? "top-full" : "bottom-full";
  const tooltipId = `featured-lineup-marker-${position.toLowerCase()}-tooltip`;

  return (
    <div
      className={`absolute -translate-x-1/2 text-center transition-all duration-200 hover:z-999 ${
        isHighlighted ? "z-900 scale-125" : "z-10 scale-100"
      } ${className}`}
      style={style}
    >
      <div
        className={player ? "player-add-to-court" : ""}
        style={{ animationDelay }}
      >
        <div className="group/headshot relative inline-block">
          <button
            type="button"
            aria-controls={tooltipId}
            aria-expanded={isTooltipOpen}
            aria-label={`${name} lineup marker`}
            onClick={(event) => {
              event.stopPropagation();
              onToggleTooltip();
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                onCloseTooltip();
              }
            }}
            className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--court-accent)]"
          >
            <PlayerImage
              src={imageSrc}
              alt=""
              width={72}
              height={72}
              className="mx-auto h-12 w-12 rounded-full object-cover transition-all duration-200 lg:h-20 lg:w-20"
              style={{
                boxShadow: isHighlighted
                  ? `0 0 0 3px ${color}, 0 0 24px ${color}`
                  : "none",
              }}
            />
          </button>

          <div
            id={tooltipId}
            role="dialog"
            aria-label={`${name} actions`}
            className={`absolute left-1/2 z-100 w-24 -translate-x-1/2 rounded-md border bg-black/95 p-1.5 transition-opacity duration-200 sm:w-28 sm:p-2 lg:w-48 lg:p-3 ${tooltipClass} ${
              isTooltipOpen
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0 group-hover/headshot:pointer-events-auto group-hover/headshot:opacity-100"
            }`}
            style={{
              borderColor: `${color}99`,
            }}
          >
            <p className="font-michroma text-[6px] uppercase text-white sm:text-[7px] lg:text-[10px]">
              {name}
            </p>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onViewCard(name);
                onCloseTooltip();
              }}
              className="mt-1 w-full cursor-pointer rounded border px-1.5 py-1 font-michroma text-[6px] uppercase transition hover:brightness-150 sm:text-[7px] lg:mt-2 lg:px-3 lg:py-2 lg:text-[9px]"
              style={{
                color,
                borderColor: `${color}99`,
                backgroundColor: `${color}18`,
              }}
            >
              View Card
            </button>
          </div>
        </div>

        <p className="mt-0.5 max-w-16 truncate font-michroma text-[6px] text-white lg:max-w-none lg:text-[7px]">
          {name}
        </p>

        <p className="font-michroma text-[5px] lg:text-[6px]" style={{ color }}>
          {position}
        </p>
      </div>
    </div>
  );
}
