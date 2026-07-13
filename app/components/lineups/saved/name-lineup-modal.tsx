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
    <div className="fixed inset-0 z-1000 flex animate-[modalBackdropIn_120ms_ease-out_both] items-center justify-center bg-black/65 px-3">
      <div className="w-full max-w-75 animate-[cardFaceIn_140ms_ease-out_both] rounded-md border border-[#1bc2ec]/60 bg-[#07111f] p-4 shadow-lg lg:max-w-md lg:p-6">
        <p className="font-michroma text-[7px] uppercase text-white/40 lg:text-[10px]">
          Save Lineup
        </p>

        <h2 className="mt-1 font-michroma text-sm text-white lg:text-lg">
          Name Your Lineup
        </h2>

        <input
          value={lineupNameInput}
          onChange={(event) => onChangeName(event.target.value)}
          className="mt-4 w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 font-michroma text-[9px] text-white outline-none placeholder:text-white/30 focus:border-[#1bc2ec] lg:mt-5 lg:px-4 lg:py-3 lg:text-xs"
          placeholder="Lineup name..."
        />

        <div className="mt-4 flex justify-end gap-2 lg:mt-6 lg:gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-white/15 bg-black/20 px-3 py-2 font-michroma text-[8px] uppercase text-white/50 transition hover:text-white lg:px-4 lg:py-3 lg:text-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            className="rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/10 px-3 py-2 font-michroma text-[8px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 lg:px-4 lg:py-3 lg:text-xs"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
