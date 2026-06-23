import { LineupBadgeIcon } from "../shared/lineup-style-helpers";

type ScoutOverallSummaryProps = {
  animatedScoutOverall: number;
  lineupTier: string;
  scoutTierColor: string;
  lineupBadges: string[];
  scoutArchetypeColor: string;
};

export function ScoutOverallSummary({
  animatedScoutOverall,
  lineupTier,
  scoutTierColor,
  lineupBadges,
  scoutArchetypeColor,
}: ScoutOverallSummaryProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <p
          className="font-michroma text-3xl -tracking-widest"
          style={{
            color: scoutArchetypeColor,
            textShadow: `0 0 12px ${scoutArchetypeColor}99`,
          }}
        >
          {animatedScoutOverall.toFixed(1)}
        </p>

        <p className="font-michroma text-[10px] uppercase text-white/40">
          Overall
        </p>
      </div>

      <p className="font-michroma text-xs" style={{ color: scoutTierColor }}>
        {lineupTier}
      </p>

      <div className="mt-2 flex max-w-80 flex-wrap gap-1">
        {lineupBadges.map((badge) => (
          <span
            key={badge}
            className="flex items-center gap-1 rounded-md border px-1 py-1 font-michroma text-[6.5px]"
            style={{
              color: scoutArchetypeColor,
              borderColor: `${scoutArchetypeColor}55`,
              backgroundColor: `${scoutArchetypeColor}18`,
            }}
          >
            <LineupBadgeIcon badge={badge} />
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
