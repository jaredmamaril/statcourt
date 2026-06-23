import { players } from "../../court-data";
import PlayerImage from "../../player-image";
import { getPlayerHeadshot } from "../../player-images";

type LineupMarkerProps = {
  position: string;
  name: string;
  className: string;
  color: string;
  isHighlighted: boolean;
  onViewCard: (playerName: string) => void;
  tooltipPosition?: "top" | "bottom";
  animationDelay?: string;
};

export function LineupMarker({
  position,
  name,
  className,
  color,
  isHighlighted,
  onViewCard,
  tooltipPosition = "top",
  animationDelay = "0ms",
}: LineupMarkerProps) {
  const player = players.find((player) => player.name === name);
  const imageSrc = player ? getPlayerHeadshot(player) : "/blank-player.svg";
  const tooltipClass =
    tooltipPosition === "bottom" ? "top-full" : "bottom-full";

  return (
    <div
      className={`absolute -translate-x-1/2 text-center transition-all duration-200 hover:z-999 ${
        isHighlighted ? "z-900 scale-125" : "z-10 scale-100"
      } ${className}`}
    >
      <div
        className={player ? "player-add-to-court" : ""}
        style={{ animationDelay }}
      >
        <div className="group/headshot relative inline-block">
          <PlayerImage
            src={imageSrc}
            alt={player?.name || name}
            width={72}
            height={72}
            className="mx-auto h-20 w-20 rounded-full object-cover transition-all duration-200"
            style={{
              boxShadow: isHighlighted
                ? `0 0 0 3px ${color}, 0 0 24px ${color}`
                : "none",
            }}
          />

          <div
            className={`pointer-events-none absolute left-1/2 z-100 w-48 -translate-x-1/2 rounded-md border bg-black/95 p-3 opacity-0 transition-opacity duration-200 group-hover/headshot:pointer-events-auto group-hover/headshot:opacity-100 ${tooltipClass}`}
            style={{
              borderColor: `${color}99`,
            }}
          >
            <p className="font-michroma text-[10px] uppercase text-white">
              {name}
            </p>

            <button
              type="button"
              onClick={() => onViewCard(name)}
              className="mt-2 w-full cursor-pointer rounded border px-3 py-2 font-michroma text-[9px] uppercase transition hover:brightness-150"
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

        <p className="mt-0.5 font-michroma text-[7px] text-white">{name}</p>

        <p className="font-michroma text-[6px]" style={{ color }}>
          {position}
        </p>
      </div>
    </div>
  );
}
