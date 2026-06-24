import type { SavedLineup } from "../shared/lineup-types";

type SavedLineupCardActionsProps = {
  lineup: SavedLineup;
  archetypeColor: string;
  onLoad: (lineup: SavedLineup) => void;
  onScout: (lineup: SavedLineup) => void;
  onRename: (lineup: SavedLineup) => void;
  onDelete: (lineup: SavedLineup) => void;
};

export function SavedLineupCardActions({
  lineup,
  archetypeColor,
  onLoad,
  onScout,
  onRename,
  onDelete,
}: SavedLineupCardActionsProps) {
  return (
    <div className="mt-5 flex gap-2">
      <button
        type="button"
        onClick={() => onLoad(lineup)}
        className="rounded-md border px-3 py-2 font-michroma text-[8px] uppercase transition hover:brightness-150"
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
        onClick={() => onScout(lineup)}
        className="rounded-md border px-3 py-2 font-michroma text-[8px] uppercase transition hover:brightness-150"
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
        className="rounded-md border bg-white/5 px-3 py-2 font-michroma text-[8px] uppercase text-white/45 transition hover:brightness-150"
        style={{
          borderColor: `${archetypeColor}33`,
        }}
      >
        Rename
      </button>

      <button
        type="button"
        onClick={() => onDelete(lineup)}
        className="ml-auto rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 font-michroma text-[8px] uppercase text-red-400 transition hover:bg-red-500/20"
      >
        Delete
      </button>
    </div>
  );
}
