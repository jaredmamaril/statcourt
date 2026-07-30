import { LineupBadgeIcon } from "../shared/lineup-style-helpers";

type SavedLineupBadgesProps = {
  badges: string[];
  archetypeColor: string;
};

export function SavedLineupBadges({
  badges,
  archetypeColor,
}: SavedLineupBadgesProps) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1 lg:mt-4">
      {badges.slice(0, 3).map((badge) => (
        <span
          key={badge}
          className="flex items-center gap-0.75 rounded border px-1 py-0.5 font-michroma text-[4.8px] lg:px-1.5 lg:py-0.75 lg:text-[6.8px]"
          style={{
            color: archetypeColor,
            borderColor: `${archetypeColor}50`,
            backgroundColor: `${archetypeColor}12`,
          }}
        >
          <LineupBadgeIcon badge={badge} />
          {badge}
        </span>
      ))}
    </div>
  );
}
