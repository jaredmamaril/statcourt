import type { CSSProperties, ReactNode } from "react";
import {
  getTeamColor,
  type Player,
  type PlayerInsightDisplay,
} from "../../court-data";
import {
  getPlayerRating,
  type PlayerRatingCategory,
} from "../../player-ratings";

type FeaturedPlayerPanelProps = {
  featuredPlayer: Player;
  featuredPlayerInsights: {
    archetype: PlayerInsightDisplay | null;
    traits: PlayerInsightDisplay[];
  } | null;
  ratingView: PlayerRatingCategory;
  statMode: "career" | "peak" | "current";
  statModeLabel: string;
  getInsightRarityStyles: (
    insight: PlayerInsightDisplay,
    isArchetype?: boolean,
  ) => CSSProperties;
  onViewPlayer: (playerName: string) => void;
  children?: ReactNode;
};

export function FeaturedPlayerPanel({
  featuredPlayer,
  featuredPlayerInsights,
  ratingView,
  statMode,
  statModeLabel,
  getInsightRarityStyles,
  onViewPlayer,
  children,
}: FeaturedPlayerPanelProps) {
  const teamColor = getTeamColor(featuredPlayer.team);
  const featuredPlayerRating = getPlayerRating(
    featuredPlayer,
    ratingView,
    statMode,
  );

  return (
    <div className="panel-reveal absolute -right-58 top-4 hidden w-64 text-center font-michroma uppercase xl:block">
      <div className="mt-2 rounded-md border border-white/10 bg-black/10 p-3">
        <p className="mb-2 text-[8px] tracking-wide text-white/25">
          Featured Player
        </p>

        <p
          className="text-sm brightness-125"
          style={{
            color: teamColor,
            textShadow: `0 0 6px ${teamColor}, 0 0 14px ${teamColor}, 0 0 26px ${teamColor}66`,
          }}
        >
          {featuredPlayer.name}
        </p>

        <p className="mt-1 text-xs text-[#1bc2ec]">
          {featuredPlayerRating.toFixed(1)} OVR
        </p>

        <p className="mt-1 text-[7px] text-white/35">{statModeLabel} Profile</p>

        <div className="mt-3 flex flex-col items-center gap-1">
          {featuredPlayerInsights?.archetype && (
            <span
              className="rounded border px-2 py-0.5 text-[8px]"
              style={{
                ...getInsightRarityStyles(
                  featuredPlayerInsights.archetype,
                  true,
                ),
                boxShadow: "none",
                opacity: 0.7,
              }}
            >
              {featuredPlayerInsights.archetype.label}
            </span>
          )}

          {featuredPlayerInsights?.traits.slice(0, 2).map((trait) => (
            <span
              key={trait.label}
              className="rounded border px-2 py-0.5 text-[8px]"
              style={{
                ...getInsightRarityStyles(trait),
                boxShadow: "none",
                opacity: 0.7,
              }}
            >
              {trait.label}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onViewPlayer(featuredPlayer.name)}
          className="pointer-events-auto mt-3 rounded-md border px-5 py-1 text-xs brightness-125 transition hover:brightness-175"
          style={{
            color: teamColor,
            borderColor: teamColor,
            backgroundColor: `${teamColor}14`,
            boxShadow: `0 0 10px ${teamColor}22`,
          }}
        >
          View Player
        </button>
      </div>

      {children}
    </div>
  );
}
