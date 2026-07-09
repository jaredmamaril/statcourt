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
    <section className="flex justify-center pt-10 lg:min-h-[calc(100vh-120px)] lg:items-center lg:pt-0">
      <div className="w-full max-w-72 rounded-md border border-[#1bc2ec]/50 bg-black/60 p-3 text-center lg:max-w-lg lg:p-6">
        <p className="font-michroma text-[7px] uppercase text-white/40 lg:text-[10px]">
          Build Your Own
        </p>

        <h2 className="mt-1.5 font-michroma text-[15px] text-[#1bc2ec] lg:mt-2 lg:text-xl">
          Draft Your Lineup
        </h2>

        <p className="mt-2 font-michroma text-[7.5px] leading-relaxed text-white/55 lg:mt-4 lg:text-xs">
          Choose one player for each position. Your current OVR updates as you
          draft, and selected positions turn green so you can track your lineup.
        </p>

        <div className="mt-2 flex flex-col justify-center gap-2 lg:mt-6 lg:flex-row lg:gap-3">
          <button
            type="button"
            onClick={onStartNewDraft}
            className="h-7 rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/10 px-3 font-michroma text-[7.5px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 lg:h-auto lg:px-5 lg:py-3 lg:text-xs"
          >
            Start New Draft
          </button>

          {hasExistingDraft && (
            <button
              type="button"
              onClick={onContinueDraft}
              className="h-7 rounded-md border border-white/20 bg-white/5 px-3 font-michroma text-[7.5px] uppercase text-white/60 transition hover:border-[#1bc2ec]/60 hover:text-[#1bc2ec] lg:h-auto lg:px-5 lg:py-3 lg:text-xs"
            >
              Continue Draft
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
