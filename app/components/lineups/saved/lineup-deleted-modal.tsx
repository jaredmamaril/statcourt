import { AccessibleDialog } from "../../ui/accessible-dialog";

type LineupDeletedModalProps = {
  onClose: () => void;
};

export function LineupDeletedModal({ onClose }: LineupDeletedModalProps) {
  return (
    <AccessibleDialog
      titleId="lineup-deleted-dialog-title"
      descriptionId="lineup-deleted-dialog-description"
      onClose={onClose}
      overlayClassName="fixed inset-0 z-1000 flex animate-[modalBackdropIn_160ms_ease-out_both] items-center justify-center bg-black/70 px-3"
      dialogClassName="w-full max-w-[300px] animate-[modalIn_180ms_ease-out_both] rounded-md border border-red-500/60 bg-[var(--court-panel-alt)] p-4 text-center shadow-[0_0_35px_rgba(239,68,68,0.25)] lg:max-w-sm lg:p-6"
    >
        <p
          id="lineup-deleted-dialog-title"
          className="font-michroma text-sm text-red-400 lg:text-lg"
        >
          Lineup Deleted
        </p>

        <p
          id="lineup-deleted-dialog-description"
          className="mt-2 font-michroma text-[8px] leading-relaxed text-white/40 lg:mt-3 lg:text-xs"
        >
          This lineup was removed from your saved lineups.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 font-michroma text-[8px] uppercase text-red-400 transition hover:bg-red-500/20 lg:mt-6 lg:px-4 lg:py-3 lg:text-xs"
        >
          Done
        </button>
    </AccessibleDialog>
  );
}
