"use client";

import { useEffect } from "react";
import { useUserSettings } from "../../lib/use-user-settings";

export function ReducedMotionSync() {
  const { settings } = useUserSettings();

  useEffect(() => {
    document.documentElement.classList.toggle(
      "statcourt-reduced-motion",
      settings.reducedMotion,
    );

    return () => {
      document.documentElement.classList.remove("statcourt-reduced-motion");
    };
  }, [settings.reducedMotion]);

  return null;
}
