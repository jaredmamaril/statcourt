import { useEffect, useState } from "react";

export function useAnimatedScoutOverall(
  isScoutOpen: boolean,
  displayedScoutOverall: number | null,
) {
  const [animatedScoutOverall, setAnimatedScoutOverall] = useState(0);

  useEffect(() => {
    if (!isScoutOpen || displayedScoutOverall === null) return;

    const targetOverall = displayedScoutOverall;

    const duration = 600;
    const startTime = performance.now();

    function animate(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const nextValue = targetOverall * progress;

      setAnimatedScoutOverall(nextValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    const frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [isScoutOpen, displayedScoutOverall]);

  return animatedScoutOverall;
}
