import { useState } from "react";

type LineupSavedModalProps = {
  onViewSaved: () => void;
  onBuildAnother: () => void;
};

export function LineupSavedModal({
  onViewSaved,
  onBuildAnother,
}: LineupSavedModalProps) {
  const [isOpeningSaved, setIsOpeningSaved] = useState(false);
  const [isOpeningBuilder, setIsOpeningBuilder] = useState(false);

  function viewSavedLineups() {
    if (isOpeningSaved || isOpeningBuilder) return;

    setIsOpeningSaved(true);
    window.setTimeout(onViewSaved, 140);
  }

  function buildAnotherLineup() {
    if (isOpeningSaved || isOpeningBuilder) return;

    setIsOpeningBuilder(true);
    window.setTimeout(onBuildAnother, 140);
  }

  return (
    <div className="fixed inset-0 z-1000 flex animate-[modalBackdropIn_120ms_ease-out_both] items-center justify-center bg-black/65 px-3">
      <div className="w-full max-w-[300px] animate-[cardFaceIn_140ms_ease-out_both] rounded-md border border-emerald-400/60 bg-[#07111f] p-4 text-center shadow-lg lg:max-w-md lg:p-6">
        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-400/10 font-michroma text-lg text-emerald-400 lg:h-12 lg:w-12 lg:text-2xl">
          &#10003;
        </div>

        <h2 className="mt-3 font-michroma text-sm text-white lg:mt-4 lg:text-xl">
          Lineup Saved
        </h2>

        <p className="mt-2 font-michroma text-[8px] text-white/50 lg:mt-3 lg:text-xs">
          What would you like to do next?
        </p>

        <div className="mt-4 flex justify-center gap-2 lg:mt-6 lg:gap-3">
          <button
            type="button"
            onClick={viewSavedLineups}
            disabled={isOpeningSaved}
            className="rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/10 px-3 py-2 font-michroma text-[8px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 disabled:cursor-wait disabled:border-[#1bc2ec]/35 disabled:text-[#1bc2ec]/45 lg:px-4 lg:py-3 lg:text-xs"
          >
            {isOpeningSaved ? "Opening" : "View Saved"}
          </button>

          <button
            type="button"
            onClick={buildAnotherLineup}
            disabled={isOpeningSaved || isOpeningBuilder}
            className="rounded-md border border-white/20 px-3 py-2 font-michroma text-[8px] uppercase text-white/60 transition hover:border-white/50 hover:text-white disabled:cursor-wait disabled:border-white/10 disabled:text-white/30 lg:px-4 lg:py-3 lg:text-xs"
          >
            {isOpeningBuilder ? "Opening" : "Build Another"}
          </button>
        </div>
      </div>
    </div>
  );
}
