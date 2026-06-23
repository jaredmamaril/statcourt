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
    <section className="flex min-h-[calc(100vh-120px)] items-center justify-center">
      <div className="max-w-lg rounded-md border border-[#1bc2ec]/50 bg-black/60 p-6 text-center">
        <p className="font-michroma text-[10px] uppercase text-white/40">
          Build Your Own
        </p>

        <h2 className="mt-2 font-michroma text-xl text-[#1bc2ec]">
          Draft Your Lineup
        </h2>

        <p className="mt-4 font-michroma text-xs leading-relaxed text-white/55">
          Choose one player for each position. Your current OVR updates as you
          draft, and selected positions turn green so you can track your lineup.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onStartNewDraft}
            className="rounded-md border border-[#1bc2ec]/70 bg-[#1bc2ec]/10 px-5 py-3 font-michroma text-xs uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20"
          >
            Start New Draft
          </button>

          {hasExistingDraft && (
            <button
              type="button"
              onClick={onContinueDraft}
              className="rounded-md border border-white/20 bg-white/5 px-5 py-3 font-michroma text-xs uppercase text-white/60 transition hover:border-[#1bc2ec]/60 hover:text-[#1bc2ec]"
            >
              Continue Draft
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
