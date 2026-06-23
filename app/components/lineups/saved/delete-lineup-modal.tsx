import type { SavedLineup } from "../shared/lineup-types";

type DeleteLineupModalProps = {
  lineup: SavedLineup;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteLineupModal({
  lineup,
  onCancel,
  onConfirm,
}: DeleteLineupModalProps) {
  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-md border border-red-500/40 bg-[#07111f] p-6 text-center">
        <p className="font-michroma text-lg text-white">Delete Lineup</p>

        <p className="mt-4 font-michroma text-xs leading-relaxed text-white/50">
          Delete {lineup.name}? This cannot be undone.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-white/15 px-5 py-3 font-michroma text-xs uppercase text-white/50 transition hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md border border-red-500/50 bg-red-500/10 px-5 py-3 font-michroma text-xs uppercase text-red-400 transition hover:bg-red-500/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
