import type { LineupSlot } from "../../court-data";

type BuilderPositionTabsProps = {
  lineupPositions: LineupSlot[];
  activeBuildPosition: LineupSlot;
  customLineup: Record<LineupSlot, string>;
  onSelectPosition: (position: LineupSlot) => void;
};

export function BuilderPositionTabs({
  lineupPositions,
  activeBuildPosition,
  customLineup,
  onSelectPosition,
}: BuilderPositionTabsProps) {
  return (
    <div
      aria-label="Builder position filter"
      className="flex justify-center gap-0.5 overflow-x-auto px-0.5 lg:gap-2 lg:px-1"
      role="group"
    >
      {lineupPositions.map((position) => {
        const isActive = activeBuildPosition === position;
        const hasPlayer = customLineup[position] !== "";

        return (
          <button
            key={position}
            aria-pressed={isActive}
            type="button"
            onClick={() => onSelectPosition(position)}
            className={`min-h-9 min-w-9 cursor-pointer rounded border px-0.5 font-michroma text-[8px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--court-accent)] lg:min-h-10 lg:w-14 lg:text-xs ${
              isActive
                ? "border-[var(--court-accent)] bg-[rgb(var(--court-accent-rgb)/0.34)] text-[var(--court-accent)] shadow-[0_0_12px_rgb(var(--court-accent-rgb)/0.16)]"
                : hasPlayer
                  ? "border-emerald-500/70 text-emerald-400"
                  : "border-white/15 text-white/45 hover:border-white/40 hover:text-white/75"
            }`}
          >
            {position}
          </button>
        );
      })}
    </div>
  );
}
