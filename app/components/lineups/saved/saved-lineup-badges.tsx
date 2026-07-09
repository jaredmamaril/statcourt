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
    <div className="mt-4 hidden flex-wrap gap-1 lg:flex">
      {badges.slice(0, 3).map((badge) => (
        <span
          key={badge}
          className="flex items-center gap-1 rounded border px-2 py-1 font-michroma text-[7.5px]"
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
