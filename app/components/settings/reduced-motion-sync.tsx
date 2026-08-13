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
    document.documentElement.dataset.statcourtReducedMotion =
      settings.reducedMotion ? "on" : "off";

    return () => {
      document.documentElement.classList.remove("statcourt-reduced-motion");
      delete document.documentElement.dataset.statcourtReducedMotion;
    };
  }, [settings.reducedMotion]);

  return null;
}
