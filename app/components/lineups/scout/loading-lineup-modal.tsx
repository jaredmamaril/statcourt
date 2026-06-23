type LoadingLineupModalProps = {
  isExiting: boolean;
  steps: string[];
  currentStep: number;
  progress: number;
};

export function LoadingLineupModal({
  isExiting,
  steps,
  currentStep,
  progress,
}: LoadingLineupModalProps) {
  return (
    <div
      className={`fixed inset-0 z-1000 flex items-center justify-center bg-black/75 px-4 transition-opacity duration-300 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-md border border-[#1bc2ec]/60 bg-[#07111f] p-6 shadow-[0_0_35px_rgba(27,194,236,0.25)] transition-all duration-300 ${
          isExiting
            ? "translate-y-2 scale-95 opacity-0"
            : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        <p className="font-michroma text-lg text-white">Loading Lineup</p>

        <p className="mt-3 min-h-5 font-michroma text-sm text-[#1bc2ec]">
          {steps[currentStep]}
        </p>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#1bc2ec] transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-5 grid gap-2">
          {steps.map((step, index) => (
            <p
              key={step}
              className={`font-michroma text-xs transition ${
                index <= currentStep ? "text-white/70" : "text-white/25"
              }`}
            >
              <span className="text-[#1bc2ec]">
                {index < currentStep ? "✓" : index === currentStep ? "•" : "·"}
              </span>{" "}
              {step}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
