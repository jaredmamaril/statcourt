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
    <div className="fixed inset-0 z-1000 flex animate-[modalBackdropIn_160ms_ease-out_both] items-center justify-center bg-black/70 px-3">
      <div className="w-full max-w-75 animate-[modalIn_180ms_ease-out_both] rounded-md border border-[#1bc2ec]/50 bg-[#07111f] p-4 lg:max-w-md lg:p-6">
        <p className="font-michroma text-sm text-white lg:text-lg">
          Rename Lineup
        </p>

        <p className="mt-2 font-michroma text-[8px] text-white/40 lg:text-xs">
          Current name: {lineup.name}
        </p>

        <input
          type="text"
          value={renameLineupInput}
          onChange={(event) => onChangeName(event.target.value)}
          placeholder="Lineup name"
          className="mt-4 w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 font-michroma text-[9px] text-white outline-none placeholder:text-white/25 focus:border-[#1bc2ec] lg:mt-5 lg:px-4 lg:py-3 lg:text-xs"
        />

        <div className="mt-4 flex justify-end gap-2 lg:mt-6 lg:gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-white/15 px-3 py-2 font-michroma text-[8px] uppercase text-white/50 transition hover:text-white lg:px-5 lg:py-3 lg:text-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            className="rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/10 px-3 py-2 font-michroma text-[8px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 lg:px-5 lg:py-3 lg:text-xs"
          >
            Save Name
          </button>
        </div>
      </div>
    </div>
  );
}
