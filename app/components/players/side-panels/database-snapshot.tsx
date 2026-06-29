import { Info } from "lucide-react";
import type { Position, PlayerInsightDisplay } from "../../court-data";

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

          <div className="mx-auto grid max-w-32 grid-cols-3 gap-3 text-center">
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
