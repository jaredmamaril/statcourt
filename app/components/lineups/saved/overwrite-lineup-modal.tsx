import type { SavedLineup } from "../shared/lineup-types";

type OverwriteLineupModalProps = {
  existingLineup: SavedLineup;
  nextName: string;
  actionLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function OverwriteLineupModal({
  existingLineup,
  nextName,
  actionLabel,
  onCancel,
  onConfirm,
}: OverwriteLineupModalProps) {
  return (
    <div className="fixed inset-0 z-1000 flex animate-[modalBackdropIn_120ms_ease-out_both] items-center justify-center bg-black/65 px-3">
      <div className="w-full max-w-75 animate-[cardFaceIn_140ms_ease-out_both] rounded-md border border-[#f4bb44]/50 bg-[#07111f] p-4 text-center shadow-lg lg:max-w-md lg:p-6">
        <p className="font-michroma text-sm text-white lg:text-lg">
          Overwrite Lineup?
        </p>

        <p className="mt-3 font-michroma text-[8px] leading-relaxed text-white/50 lg:mt-4 lg:text-xs">
          A lineup named &quot;{existingLineup.name}&quot; already exists.
          Saving &quot;{nextName}&quot; will replace the previous version.
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
            className="rounded-md border border-[#f4bb44]/60 bg-[#f4bb44]/10 px-3 py-2 font-michroma text-[8px] uppercase text-[#f4bb44] transition hover:bg-[#f4bb44]/20 lg:px-5 lg:py-3 lg:text-xs"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
