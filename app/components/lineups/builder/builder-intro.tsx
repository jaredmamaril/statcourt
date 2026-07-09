type BuilderIntroProps = {
  hasExistingDraft: boolean;
  onStartNewDraft: () => void;
  onContinueDraft: () => void;
};

export function BuilderIntro({
  hasExistingDraft,
  onStartNewDraft,
  onContinueDraft,
}: BuilderIntroProps) {
  return (
    <section className="flex min-h-[calc(100vh-260px)] items-center justify-center sm:min-h-[calc(100vh-120px)]">
      <div className="w-full max-w-72 rounded-md border border-[#1bc2ec]/50 bg-black/60 p-3 text-center sm:max-w-lg sm:p-6">
        <p className="font-michroma text-[7px] uppercase text-white/40 sm:text-[10px]">
          Build Your Own
        </p>

        <h2 className="mt-1.5 font-michroma text-[15px] text-[#1bc2ec] sm:mt-2 sm:text-xl">
          Draft Your Lineup
        </h2>

        <p className="mt-2 font-michroma text-[7.5px] leading-relaxed text-white/55 sm:mt-4 sm:text-xs">
          Choose one player for each position. Your current OVR updates as you
          draft, and selected positions turn green so you can track your lineup.
        </p>

        <div className="mt-2 flex flex-col justify-center gap-2 sm:mt-6 sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={onStartNewDraft}
            className="h-7 rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/10 px-3 font-michroma text-[7.5px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 sm:h-auto sm:px-5 sm:py-3 sm:text-xs"
          >
            Start New Draft
          </button>

          {hasExistingDraft && (
            <button
              type="button"
              onClick={onContinueDraft}
              className="h-7 rounded-md border border-white/20 bg-white/5 px-3 font-michroma text-[7.5px] uppercase text-white/60 transition hover:border-[#1bc2ec]/60 hover:text-[#1bc2ec] sm:h-auto sm:px-5 sm:py-3 sm:text-xs"
            >
              Continue Draft
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
