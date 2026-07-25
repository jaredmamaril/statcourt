"use client";

import { useEffect } from "react";
import { applyStatCourtTheme, resetStatCourtTheme } from "../../lib/themes";
import { useUserSettings } from "../../lib/use-user-settings";

export function ThemeSync() {
  const { settings, isLoadingSettings, user, isLoadingUser } = useUserSettings();

  useEffect(() => {
    if (isLoadingUser || isLoadingSettings) return;

    if (!user) {
      resetStatCourtTheme();
      return;
    }

    applyStatCourtTheme(settings.theme, false);
  }, [isLoadingSettings, isLoadingUser, settings.theme, user]);

  return null;
}
