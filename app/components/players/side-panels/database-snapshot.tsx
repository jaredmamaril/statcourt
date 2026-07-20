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

type SnapshotMetricLabelProps = {
  label: string;
  tooltip: string;
};

function SnapshotMetricLabel({ label, tooltip }: SnapshotMetricLabelProps) {
  return (
    <div className="group/metric relative inline-flex items-center justify-center gap-1">
      <p className="text-[8px] tracking-wide text-white/25 transition group-hover/metric:text-white/50">
        {label}
      </p>

      <Info className="h-3 w-3 cursor-help text-[#1bc2ec]/45 transition group-hover/metric:text-[#1bc2ec]" />

      <div className="pointer-events-none absolute left-1/2 top-full z-999 mt-1 w-52 -translate-x-1/2 rounded-md border border-white/15 bg-black/95 p-2 text-left text-[7px] leading-relaxed text-white/50 opacity-0 shadow-[0_0_18px_rgba(0,0,0,0.55)] transition-opacity duration-200 group-hover/metric:opacity-100">
        {tooltip}
      </div>
    </div>
  );
}

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
    <div className="panel-reveal absolute -left-58 top-4 z-500 hidden w-64 font-michroma uppercase text-center xl:block">
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
          <SnapshotMetricLabel
            label="Players In Database"
            tooltip="Total players currently loaded from the active player database."
          />
          <p className="text-lg text-[#1bc2ec]">{playersCount}</p>
        </div>

        <div className="mb-2 border-t border-white/10 pt-3">
          <div className="mb-2">
            <SnapshotMetricLabel
              label="Position Breakdown"
              tooltip="Counts players by broad position group: guard, forward, or center."
            />
          </div>

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
          <div className="mb-2">
            <SnapshotMetricLabel
              label="Featured Archetypes"
              tooltip="Featured meaningful archetype labels from the database."
            />
          </div>

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
          <SnapshotMetricLabel
            label="Highest OVR (Career)"
            tooltip="Highest career overall rating using the player rating formula."
          />
          <p className="text-[10px] text-[#EFBF04]/80">
            {highestOverallName} ({highestOverallRating.toFixed(1)})
          </p>
        </div>

        <div className="mb-4">
          <SnapshotMetricLabel
            label="Most Versatile"
            tooltip="Best all-around blend of scoring, rebounding, playmaking, shooting, and defense."
          />
          <p className="text-[10px] text-[#A855F7]/80">{mostVersatileName}</p>
        </div>

        <div className="mb-4">
          <SnapshotMetricLabel
            label="Best Shooter"
            tooltip="Top qualified shooting profile using three-point percentage, free-throw percentage, scoring volume, and games played."
          />
          <p className="text-[10px] text-[#22C55E]/80">{bestShooterName}</p>
        </div>

        <div>
          <SnapshotMetricLabel
            label="Best Playmaker"
            tooltip="Highest career assist creation among players in the database."
          />
          <p className="text-[10px] text-[#38BDF8]/80">{bestPlaymakerName}</p>
        </div>
      </div>
    </div>
  );
}
