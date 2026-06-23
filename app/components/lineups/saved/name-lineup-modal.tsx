type NameLineupModalProps = {
  lineupNameInput: string;
  onChangeName: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function NameLineupModal({
  lineupNameInput,
  onChangeName,
  onCancel,
  onSave,
}: NameLineupModalProps) {
  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-md border border-[#1bc2ec]/60 bg-[#07111f] p-6 shadow-[0_0_35px_rgba(27,194,236,0.25)]">
        <p className="font-michroma text-[10px] uppercase text-white/40">
          Save Lineup
        </p>

        <h2 className="mt-1 font-michroma text-lg text-white">
          Name Your Lineup
        </h2>

        <input
          value={lineupNameInput}
          onChange={(event) => onChangeName(event.target.value)}
          className="mt-5 w-full rounded-md border border-white/15 bg-black/30 px-4 py-3 font-michroma text-xs text-white outline-none placeholder:text-white/30 focus:border-[#1bc2ec]"
          placeholder="Lineup name..."
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-white/15 bg-black/20 px-4 py-3 font-michroma text-xs uppercase text-white/50 transition hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            className="rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/10 px-4 py-3 font-michroma text-xs uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
