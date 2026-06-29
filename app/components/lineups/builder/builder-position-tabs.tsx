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
    <div className="flex justify-center gap-2">
      {lineupPositions.map((position) => {
        const isActive = activeBuildPosition === position;
        const hasPlayer = customLineup[position] !== "";

        return (
          <button
            key={position}
            type="button"
            onClick={() => onSelectPosition(position)}
            className={`h-10 w-14 cursor-pointer rounded-md border font-michroma text-xs transition ${
              isActive
                ? "border-[#1bc2ec] text-[#1bc2ec]"
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
