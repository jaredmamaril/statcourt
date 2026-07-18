import { useEffect, useState } from "react";
import { LoadingSpinner } from "../../loading/loading-spinner";

type LoadingLineupModalProps = {
  steps: string[];
  totalDuration: number;
  progressInterval: number;
  exitDuration: number;
  onComplete: () => void;
};

export function LoadingLineupModal({
  steps,
  totalDuration,
  progressInterval,
  exitDuration,
  onComplete,
}: LoadingLineupModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    const stepDuration = totalDuration / steps.length;

    steps.forEach((_, index) => {
      timers.push(
        window.setTimeout(() => {
          setCurrentStep(index);
        }, index * stepDuration),
      );
    });

    const progressTimer = window.setInterval(() => {
      setProgress((currentProgress) =>
        Math.min(
          currentProgress + 100 / (totalDuration / progressInterval),
          100,
        ),
      );
    }, progressInterval);

    timers.push(
      window.setTimeout(() => {
        window.clearInterval(progressTimer);
        setProgress(100);
        setIsExiting(true);

        timers.push(
          window.setTimeout(() => {
            onComplete();
          }, exitDuration),
        );
      }, totalDuration),
    );

    return () => {
      window.clearInterval(progressTimer);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [exitDuration, onComplete, progressInterval, steps, totalDuration]);

  return (
    <div
      className={`fixed inset-0 z-1000 flex items-center justify-center bg-black/75 px-3 transition-opacity duration-300 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className={`w-full max-w-72 rounded-md border border-[#1bc2ec]/60 bg-[#07111f] p-4 shadow-[0_0_35px_rgba(27,194,236,0.25)] transition-all duration-300 sm:max-w-md sm:p-6 ${
          isExiting
            ? "translate-y-2 scale-95 opacity-0"
            : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        <p className="font-michroma text-sm text-white sm:text-lg">
          Loading Lineup
        </p>

        <p className="mt-2 min-h-4 font-michroma text-[10px] text-[#1bc2ec] sm:mt-3 sm:min-h-5 sm:text-sm">
          {steps[currentStep]}
        </p>

        <LoadingSpinner className="mt-4 h-6 w-6 sm:h-7 sm:w-7" />

        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10 sm:mt-5 sm:h-1.5">
          <div
            className="h-full rounded-full bg-[#1bc2ec] transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 grid gap-1.5 sm:mt-5 sm:gap-2">
          {steps.map((step, index) => (
            <p
              key={step}
              className={`font-michroma text-[8px] leading-relaxed transition sm:text-xs ${
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
