import type { SavedLineup } from "../shared/lineup-types";

type RenameLineupModalProps = {
  lineup: SavedLineup;
  renameLineupInput: string;
  onChangeName: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function RenameLineupModal({
  lineup,
  renameLineupInput,
  onChangeName,
  onCancel,
  onSave,
}: RenameLineupModalProps) {
  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-md border border-[#1bc2ec]/50 bg-[#07111f] p-6">
        <p className="font-michroma text-lg text-white">Rename Lineup</p>

        <p className="mt-2 font-michroma text-xs text-white/40">
          Current name: {lineup.name}
        </p>

        <input
          type="text"
          value={renameLineupInput}
          onChange={(event) => onChangeName(event.target.value)}
          placeholder="Lineup name"
          className="mt-5 w-full rounded-md border border-white/15 bg-black/30 px-4 py-3 font-michroma text-xs text-white outline-none placeholder:text-white/25 focus:border-[#1bc2ec]"
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-white/15 px-5 py-3 font-michroma text-xs uppercase text-white/50 transition hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            className="rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/10 px-5 py-3 font-michroma text-xs uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20"
          >
            Save Name
          </button>
        </div>
      </div>
    </div>
  );
}
