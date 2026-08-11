import type { SavedLineup } from "../shared/lineup-types";
import { AccessibleDialog } from "../../ui/accessible-dialog";

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
    <AccessibleDialog
      titleId="delete-lineup-dialog-title"
      descriptionId="delete-lineup-dialog-description"
      onClose={onCancel}
      overlayClassName="fixed inset-0 z-1000 flex animate-[modalBackdropIn_160ms_ease-out_both] items-center justify-center bg-black/70 px-3"
      dialogClassName="w-full max-w-75 animate-[modalIn_180ms_ease-out_both] rounded-md border border-red-500/40 bg-[var(--court-panel-alt)] p-4 text-center lg:max-w-md lg:p-6"
    >
        <p
          id="delete-lineup-dialog-title"
          className="font-michroma text-sm text-white lg:text-lg"
        >
          Delete Lineup
        </p>

        <p
          id="delete-lineup-dialog-description"
          className="mt-3 font-michroma text-[8px] leading-relaxed text-white/50 lg:mt-4 lg:text-xs"
        >
          Delete {lineup.name}? This cannot be undone.
        </p>

        <div className="mt-4 flex justify-center gap-2 lg:mt-6 lg:gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-white/15 px-3 py-2 font-michroma text-[8px] uppercase text-white/50 transition hover:text-white lg:px-5 lg:py-3 lg:text-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 font-michroma text-[8px] uppercase text-red-400 transition hover:bg-red-500/20 lg:px-5 lg:py-3 lg:text-xs"
          >
            Delete
          </button>
        </div>
    </AccessibleDialog>
  );
}
