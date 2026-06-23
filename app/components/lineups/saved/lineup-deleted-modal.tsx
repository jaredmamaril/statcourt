type LineupDeletedModalProps = {
  onClose: () => void;
};

export function LineupDeletedModal({ onClose }: LineupDeletedModalProps) {
  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-md border border-red-500/60 bg-[#07111f] p-6 text-center shadow-[0_0_35px_rgba(239,68,68,0.25)]">
        <p className="font-michroma text-lg text-red-400">Lineup Deleted</p>

        <p className="mt-3 font-michroma text-xs leading-relaxed text-white/40">
          This lineup was removed from your saved lineups.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 rounded-md border border-red-500/60 bg-red-500/10 px-4 py-3 font-michroma text-xs uppercase text-red-400 transition hover:bg-red-500/20"
        >
          Done
        </button>
      </div>
    </div>
  );
}
