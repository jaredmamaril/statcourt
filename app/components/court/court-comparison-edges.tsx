import { useEffect, useRef, useState } from "react";
import { getTeamColor, type Player, type StatMode } from "../court-data";

type CourtComparisonEdgesProps = {
  leftPlayer?: Player;
  rightPlayer?: Player;
  statMode: StatMode;
};

function getEdgeLabel(
  leftPlayer: Player,
  rightPlayer: Player,
  label: string,
  leftValue: number,
  rightValue: number,
  tieThreshold = 0.4,
  detail = "",
) {
  const difference = Math.abs(leftValue - rightValue);

  if (difference < tieThreshold) {
    return {
      label,
      winner: "Even",
      color: "#94A3B8",
      leftValue,
      rightValue,
      difference,
      tieThreshold,
      detail,
    };
  }

  const winner = leftValue > rightValue ? leftPlayer : rightPlayer;

  return {
    label,
    winner: winner.name,
    color: getTeamColor(winner.team),
    leftValue,
    rightValue,
    difference,
    tieThreshold,
    detail,
  };
}

function formatEdgeValue(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function getEfficiency(stats: {
  fgPercent?: number | null;
  threePercent?: number | null;
  ftPercent?: number | null;
}) {
  return (
    (stats.fgPercent ?? 0) * 0.45 +
    (stats.threePercent ?? 0) * 0.35 +
    (stats.ftPercent ?? 0) * 0.2
  );
}

function getStatsByMode(player: Player, statMode: StatMode) {
  if (statMode === "peak") {
    return (
      player.statProfiles?.peak ?? player.statProfiles?.career ?? player.stats
    );
  }

  if (statMode === "current") {
    return (
      player.statProfiles?.current ??
      player.statProfiles?.career ??
      player.stats
    );
  }

  return player.statProfiles?.career ?? player.stats;
}

export function CourtComparisonEdges({
  leftPlayer,
  rightPlayer,
  statMode,
}: CourtComparisonEdgesProps) {
  const [openEdge, setOpenEdge] = useState<string | null>(null);
  const edgesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function closeOpenEdge(event: PointerEvent) {
      if (!edgesRef.current?.contains(event.target as Node)) {
        setOpenEdge(null);
      }
    }

    document.addEventListener("pointerdown", closeOpenEdge);

    return () => {
      document.removeEventListener("pointerdown", closeOpenEdge);
    };
  }, []);

  if (!leftPlayer || !rightPlayer) {
    return null;
  }

  const leftStats = getStatsByMode(leftPlayer, statMode);
  const rightStats = getStatsByMode(rightPlayer, statMode);

  const edges = [
    getEdgeLabel(
      leftPlayer,
      rightPlayer,
      "Scoring Edge",
      leftStats.ppg ?? 0,
      rightStats.ppg ?? 0,
      0.5,
      "Higher points per game wins. Within 0.5 PPG counts as even.",
    ),

    getEdgeLabel(
      leftPlayer,
      rightPlayer,
      "Playmaking Edge",
      leftStats.apg ?? 0,
      rightStats.apg ?? 0,
      0.4,
      "Higher assists per game wins. Within 0.4 APG counts as even.",
    ),

    getEdgeLabel(
      leftPlayer,
      rightPlayer,
      "Rebounding Edge",
      leftStats.rpg ?? 0,
      rightStats.rpg ?? 0,
      0.5,
      "Higher rebounds per game wins. Within 0.5 RPG counts as even.",
    ),

    getEdgeLabel(
      leftPlayer,
      rightPlayer,
      "Defense Edge",
      leftPlayer.ratings.defense,
      rightPlayer.ratings.defense,
      2,
      "Higher defensive rating wins. Within 2 rating points counts as even.",
    ),

    getEdgeLabel(
      leftPlayer,
      rightPlayer,
      "Efficiency Edge",
      getEfficiency(leftStats),
      getEfficiency(rightStats),
      1.2,
      "Efficiency = FG% x 0.45 + 3PT% x 0.35 + FT% x 0.20. Within 1.2 points counts as even.",
    ),
  ];

  return (
    <div
      ref={edgesRef}
      key={`${leftPlayer.id}-${rightPlayer.id}-${statMode}`}
      className="relative z-100 mx-auto mt-4 grid w-full max-w-6xl grid-cols-2 gap-2 px-3 sm:grid-cols-2 sm:gap-3 sm:px-0 lg:grid-cols-5"
    >
      {edges.map((edge, index) => (
        <div
          key={edge.label}
          role="button"
          tabIndex={0}
          style={{ animationDelay: `${index * 45}ms` }}
          onClick={() =>
            setOpenEdge((current) =>
              current === edge.label ? null : edge.label,
            )
          }
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpenEdge((current) =>
                current === edge.label ? null : edge.label,
              );
            }
          }}
          className={`group relative cursor-help rounded-lg border border-white/15 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,transparent)] px-2.5 py-2 text-center shadow-[0_0_14px_rgba(0,0,0,0.3)] transition hover:z-200 hover:-translate-y-0.5 hover:border-[rgb(var(--court-accent-rgb)/0.5)] hover:bg-[var(--court-panel-alt)] hover:shadow-[0_0_20px_rgb(var(--court-accent-rgb)/0.14)] focus:z-200 sm:px-4 sm:py-3 ${
            edge.label === "Efficiency Edge" ? "col-span-2 lg:col-span-1" : ""
          } animate-[courtEdgeReveal_220ms_ease-out_both]`}
        >
          <p className="font-michroma text-[6.5px] uppercase tracking-wide text-white/75 sm:text-[8px]">
            {edge.label}
          </p>

          <p
            className="mt-1 truncate font-michroma text-[10px] brightness-125 sm:mt-2 sm:text-[14px]"
            style={{
              color: edge.color,
              textShadow: `0 0 10px ${edge.color}, 0 0 20px ${edge.color}66`,
            }}
          >
            {edge.winner}
          </p>

          <div
            className={`absolute top-[calc(100%+6px)] left-1/2 z-999 w-[min(180px,90vw)] -translate-x-1/2 rounded-md border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[#030910]/95 p-1.5 text-left shadow-[0_0_24px_rgb(var(--court-accent-rgb)/0.18)] transition duration-150 lg:w-72 lg:p-3 ${
              openEdge === edge.label
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0 group-hover:opacity-100"
            }`}
          >
            <p className="font-michroma text-[6.5px] uppercase tracking-wide text-[var(--court-accent)] sm:text-[8px]">
              {edge.label} Math
            </p>

            <div className="mt-1.5 space-y-1 font-michroma text-[6.5px] text-white/65 sm:mt-2 sm:text-[8px]">
              <p>
                {leftPlayer.name}:{" "}
                <span className="text-white">
                  {formatEdgeValue(edge.leftValue)}
                </span>
              </p>

              <p>
                {rightPlayer.name}:{" "}
                <span className="text-white">
                  {formatEdgeValue(edge.rightValue)}
                </span>
              </p>

              <p>
                Difference:{" "}
                <span className="text-white">
                  {formatEdgeValue(edge.difference)}
                </span>
              </p>

              <p>
                Even threshold:{" "}
                <span className="text-white">
                  {formatEdgeValue(edge.tieThreshold)}
                </span>
              </p>
            </div>

            <p className="mt-1.5 text-[7px] leading-snug text-white/45 sm:mt-2 sm:text-[10px]">
              {edge.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
