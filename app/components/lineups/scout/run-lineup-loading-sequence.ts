type RunLineupLoadingSequenceArgs = {
  totalDuration: number;
  progressInterval: number;
  exitDuration: number;
  steps: string[];
  onStepChange: (step: number) => void;
  onProgressChange: (progress: number) => void;
  onStartExit: () => void;
  onComplete: () => void;
};

export function runLineupLoadingSequence({
  totalDuration,
  progressInterval,
  exitDuration,
  steps,
  onStepChange,
  onProgressChange,
  onStartExit,
  onComplete,
}: RunLineupLoadingSequenceArgs) {
  const stepDuration = totalDuration / steps.length;

  steps.forEach((_, index) => {
    window.setTimeout(() => {
      onStepChange(index);
    }, index * stepDuration);
  });

  const progressTimer = window.setInterval(() => {
    onProgressChange(100 / (totalDuration / progressInterval));
  }, progressInterval);

  window.setTimeout(() => {
    window.clearInterval(progressTimer);

    onProgressChange(100);
    onStartExit();

    window.setTimeout(() => {
      onComplete();
    }, exitDuration);
  }, totalDuration);
}
