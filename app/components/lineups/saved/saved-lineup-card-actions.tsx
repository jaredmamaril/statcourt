import type { SavedLineup } from "../shared/lineup-types";

type SavedLineupCardActionsProps = {
  lineup: SavedLineup;
  archetypeColor: string;
  isLoadingPlayers: boolean;
  onLoad: (lineup: SavedLineup) => void;
  onScout: (lineup: SavedLineup) => void;
  onRename: (lineup: SavedLineup) => void;
  onDelete: (lineup: SavedLineup) => void;
};

export function SavedLineupCardActions({
  lineup,
  archetypeColor,
  isLoadingPlayers,
  onLoad,
  onScout,
  onRename,
  onDelete,
}: SavedLineupCardActionsProps) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-1.5 lg:mt-5 lg:flex lg:gap-2">
      <button
        type="button"
        disabled={isLoadingPlayers}
        onClick={() => onLoad(lineup)}
        className="rounded-md border px-2 py-2 font-michroma text-[8px] uppercase transition disabled:cursor-not-allowed disabled:opacity-60 lg:px-3 lg:text-[9px] lg:hover:scale-105 lg:hover:shadow-[0_0_14px_rgb(var(--court-accent-rgb)/0.22)]"
        style={{
          color: archetypeColor,
          borderColor: `${archetypeColor}80`,
          backgroundColor: `${archetypeColor}28`,
        }}
      >
        Load
      </button>

      <button
        type="button"
        disabled={isLoadingPlayers}
        onClick={() => onScout(lineup)}
        className="rounded-md border px-2 py-2 font-michroma text-[8px] uppercase transition disabled:cursor-not-allowed disabled:opacity-60 lg:px-3 lg:text-[9px] lg:hover:scale-105 lg:hover:shadow-[0_0_14px_rgb(var(--court-accent-rgb)/0.22)]"
        style={{
          color: archetypeColor,
          borderColor: `${archetypeColor}50`,
          backgroundColor: `${archetypeColor}10`,
        }}
      >
        Scout
      </button>

      <button
        type="button"
        onClick={() => onRename(lineup)}
        className="rounded-md border bg-white/5 px-2 py-2 font-michroma text-[8px] uppercase text-white/70 transition lg:px-3 lg:text-[9px] lg:hover:scale-105 lg:hover:shadow-[0_0_14px_rgb(var(--court-accent-rgb)/0.22)]"
        style={{
          borderColor: `${archetypeColor}33`,
        }}
      >
        Rename
      </button>

      <button
        type="button"
        onClick={() => onDelete(lineup)}
        className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-2 font-michroma text-[8px] uppercase text-red-300 transition lg:ml-auto lg:px-3 lg:text-[9px] lg:hover:scale-105 lg:hover:bg-red-500/20 lg:hover:shadow-[0_0_14px_rgba(239,68,68,0.22)]"
      >
        Delete
      </button>
    </div>
  );
}
