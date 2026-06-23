type LineupSavedModalProps = {
  onViewSaved: () => void;
  onBuildAnother: () => void;
};

export function LineupSavedModal({
  onViewSaved,
  onBuildAnother,
}: LineupSavedModalProps) {
  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-md border border-emerald-400/60 bg-[#07111f] p-6 text-center shadow-[0_0_30px_rgba(34,197,94,0.22)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-400/10 font-michroma text-2xl text-emerald-400">
          &#10003;
        </div>

        <h2 className="mt-4 font-michroma text-xl text-white">Lineup Saved</h2>

        <p className="mt-3 font-michroma text-xs text-white/50">
          What would you like to do next?
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onViewSaved}
            className="rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/10 px-4 py-3 font-michroma text-xs uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20"
          >
            View Saved
          </button>

          <button
            type="button"
            onClick={onBuildAnother}
            className="rounded-md border border-white/20 px-4 py-3 font-michroma text-xs uppercase text-white/60 transition hover:border-white/50 hover:text-white"
          >
            Build Another
          </button>
        </div>
      </div>
    </div>
  );
}
