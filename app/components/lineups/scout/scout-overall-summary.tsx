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
          className="font-michroma text-md -tracking-widest lg:text-3xl"
          style={{
            color: scoutArchetypeColor,
            textShadow: `0 0 12px ${scoutArchetypeColor}99`,
          }}
        >
          {animatedScoutOverall.toFixed(1)}
        </p>

        <p className="font-michroma text-[8px] uppercase text-white/65 lg:text-[10px]">
          Scout OVR
        </p>
      </div>

      <p className="mt-0.5 max-w-64 font-michroma text-[8px] leading-relaxed text-white/65 lg:text-[9px]">
        Final team rating from player average, position fit, category balance,
        chemistry, and stat profile.
      </p>

      <p
        className="mt-1 font-michroma text-[9px] lg:text-xs"
        style={{ color: scoutTierColor }}
      >
        {lineupTier}
      </p>

      <div className="mt-2 flex max-w-80 flex-wrap gap-1">
        {lineupBadges.map((badge) => (
          <span
            key={badge}
            className="flex items-center gap-1 rounded-md border px-1 py-0.5 font-michroma text-[7px] lg:py-1 lg:text-[8px]"
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
