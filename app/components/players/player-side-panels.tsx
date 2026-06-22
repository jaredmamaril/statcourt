import type { CSSProperties, ReactNode } from "react";
import { Info } from "lucide-react";
import type { Position, Player, PlayerInsightDisplay } from "../court-data";
import { players, teamColors } from "../court-data";
import { getPlayerRating } from "../player-ratings";

type ArchetypeDistributionItem = [
  string,
  {
    count: number;
    rarity: PlayerInsightDisplay["rarity"];
  },
];

type DatabaseSnapshotProps = {
  playersCount: number;
  positions: Position[];
  positionBreakdown: Record<Position, number>;
  topArchetypeDistribution: ArchetypeDistributionItem[];
  highestOverallName: string;
  highestOverallRating: number;
  mostVersatileName: string;
  bestShooterName: string;
  bestPlaymakerName: string;
  getRarityColor: (rarity: PlayerInsightDisplay["rarity"]) => string;
};

export function DatabaseSnapshot({
  playersCount,
  positions,
  positionBreakdown,
  topArchetypeDistribution,
  highestOverallName,
  highestOverallRating,
  mostVersatileName,
  bestShooterName,
  bestPlaymakerName,
  getRarityColor,
}: DatabaseSnapshotProps) {
  return (
    <div className="absolute -left-55 top-4 z-500 hidden w-64 font-michroma uppercase text-center xl:block">
      <div className="group/database relative inline-block">
        <p className="flex cursor-help items-center justify-center gap-1 text-[8px] tracking-wide text-white/25 transition group-hover/database:text-white/50">
          Database Snapshot
          <Info className="h-4 w-4 text-[#1bc2ec]/60 transition group-hover/database:text-[#1bc2ec]" />
        </p>

        <div className="pointer-events-none absolute left-1/2 top-full z-999 mt-2 w-72 -translate-x-1/2 rounded-md border border-white/15 bg-black/95 p-3 text-left opacity-0 shadow-[0_0_24px_rgba(0,0,0,0.55)] transition-opacity duration-200 group-hover/database:opacity-100">
          <p className="mb-2 text-[8px] uppercase tracking-wide text-white/45">
            Snapshot Colors
          </p>

          <div className="space-y-2 text-[8px] leading-relaxed">
            <p>
              <span className="text-[#1bc2ec]">Players In Database</span>
              <span className="text-white/45"> - total players loaded.</span>
            </p>
            <p>
              <span className="text-[#EFBF04]">Highest OVR</span>
              <span className="text-white/45"> - best overall rating.</span>
            </p>
            <p>
              <span className="text-[#A855F7]">Most Versatile</span>
              <span className="text-white/45"> - best all-around profile.</span>
            </p>
            <p>
              <span className="text-[#22C55E]">Best Shooter</span>
              <span className="text-white/45">
                {" "}
                - best three-point shooter.
              </span>
            </p>
            <p>
              <span className="text-[#38BDF8]">Best Playmaker</span>
              <span className="text-white/45"> - highest assist creator.</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-md border border-white/10 bg-black/10 p-3">
        <div className="mb-1">
          <p className="text-[8px] tracking-wide text-white/25">
            Players In Database
          </p>
          <p className="text-lg text-[#1bc2ec]">{playersCount}</p>
        </div>

        <div className="mb-2 border-t border-white/10 pt-3">
          <p className="mb-2 text-[8px] tracking-wide text-white/25">
            Position Breakdown
          </p>

          <div className="grid grid-cols-5 gap-1 text-center">
            {positions.map((position) => (
              <div key={position}>
                <p className="text-[8px] text-[#1bc2ec]">{position}</p>
                <p className="text-[10px] text-white/45">
                  {positionBreakdown[position]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4 border-t border-white/10 pt-3">
          <p className="mb-2 text-[8px] tracking-wide text-white/25">
            Common Archetypes
          </p>

          <div className="space-y-1">
            {topArchetypeDistribution.map(([archetype, data]) => {
              const rarityColor = getRarityColor(data.rarity);

              return (
                <div
                  key={archetype}
                  className="flex items-center justify-between gap-2 text-[8px]"
                >
                  <span className="truncate" style={{ color: rarityColor }}>
                    {archetype}
                  </span>

                  <span style={{ color: rarityColor }}>{data.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-[8px] tracking-wide text-white/25">Highest OVR</p>
          <p className="text-[10px] text-[#EFBF04]/80">
            {highestOverallName} ({highestOverallRating.toFixed(1)})
          </p>
        </div>

        <div className="mb-4">
          <p className="text-[8px] tracking-wide text-white/25">
            Most Versatile
          </p>
          <p className="text-[10px] text-[#A855F7]/80">{mostVersatileName}</p>
        </div>

        <div className="mb-4">
          <p className="text-[8px] tracking-wide text-white/25">Best Shooter</p>
          <p className="text-[10px] text-[#22C55E]/80">{bestShooterName}</p>
        </div>

        <div>
          <p className="text-[8px] tracking-wide text-white/25">
            Best Playmaker
          </p>
          <p className="text-[10px] text-[#38BDF8]/80">{bestPlaymakerName}</p>
        </div>
      </div>
    </div>
  );
}

type RecentlyScoutedProps = {
  recentlyViewedPlayers: string[];
  onViewPlayer: (playerName: string) => void;
};

export function RecentlyScouted({
  recentlyViewedPlayers,
  onViewPlayer,
}: RecentlyScoutedProps) {
  if (recentlyViewedPlayers.length === 0) return null;

  return (
    <div className="mt-4 rounded-md border border-white/10 bg-black/10 p-3">
      <p className="mb-2 text-[8px] tracking-wide text-white/25">
        Recently Scouted
      </p>

      <div className="flex flex-col gap-2">
        {recentlyViewedPlayers.map((playerName) => {
          const recentPlayer = players.find(
            (player) => player.name === playerName,
          );

          if (!recentPlayer) return null;

          return (
            <button
              key={playerName}
              type="button"
              onClick={() => onViewPlayer(playerName)}
              className="pointer-events-auto flex items-center justify-between gap-2 rounded border px-2 py-1 text-left font-michroma text-[8px] brightness-125 transition hover:scale-[1.02]"
              style={{
                borderColor: `${teamColors[recentPlayer.team]}50`,
                backgroundColor: `${teamColors[recentPlayer.team]}10`,
                boxShadow: `0 0 8px ${teamColors[recentPlayer.team]}22`,
              }}
            >
              <span
                className="text-[9px]"
                style={{
                  color: teamColors[recentPlayer.team],
                  textShadow: `0 0 8px ${teamColors[recentPlayer.team]}66`,
                }}
              >
                {playerName}
              </span>

              <span
                style={{
                  color: teamColors[recentPlayer.team],
                  textShadow: `0 0 8px ${teamColors[recentPlayer.team]}66`,
                }}
              >
                View Card
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type FeaturedPlayerPanelProps = {
  featuredPlayer: Player;
  featuredPlayerInsights: {
    archetype: PlayerInsightDisplay | null;
    traits: PlayerInsightDisplay[];
  } | null;
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
  getInsightRarityStyles,
  onViewPlayer,
  children,
}: FeaturedPlayerPanelProps) {
  return (
    <div className="absolute -right-55 top-4 hidden w-64 text-center font-michroma uppercase xl:block">
      <div className="mt-2 rounded-md border border-white/10 bg-black/10 p-3">
        <p className="mb-2 text-[8px] tracking-wide text-white/25">
          Featured Player
        </p>

        <p
          className="text-sm brightness-125"
          style={{
            color: teamColors[featuredPlayer.team],
            textShadow: `0 0 6px ${teamColors[featuredPlayer.team]}, 0 0 14px ${teamColors[featuredPlayer.team]}, 0 0 26px ${teamColors[featuredPlayer.team]}66`,
          }}
        >
          {featuredPlayer.name}
        </p>

        <p className="mt-1 text-xs text-[#1bc2ec]">
          {getPlayerRating(featuredPlayer).toFixed(1)} OVR
        </p>

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
            color: teamColors[featuredPlayer.team],
            borderColor: teamColors[featuredPlayer.team],
            backgroundColor: `${teamColors[featuredPlayer.team]}14`,
            boxShadow: `0 0 10px ${teamColors[featuredPlayer.team]}22`,
          }}
        >
          View Player
        </button>
      </div>

      {children}
    </div>
  );
}
