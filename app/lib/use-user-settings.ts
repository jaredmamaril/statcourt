"use client";

import { useEffect, useState } from "react";
import { supabase } from "../components/supabase-client";
import { useAuthUser } from "./use-auth-user";
import {
  defaultStatCourtTheme,
  isStatCourtThemeId,
  type StatCourtThemeId,
} from "./themes";

export type DefaultStatMode = "career" | "peak" | "current";
export type DefaultPlayerView = "cards" | "list";
export type DefaultCompareMode = "career_playstyle" | "stat_edges";

export type UserSettings = {
  defaultStatMode: DefaultStatMode;
  defaultPlayerView: DefaultPlayerView;
  defaultCompareMode: DefaultCompareMode;
  reducedMotion: boolean;
  theme: StatCourtThemeId;
};

type UserSettingsRow = {
  default_stat_mode: DefaultStatMode | null;
  default_player_view: DefaultPlayerView | null;
  default_compare_mode: DefaultCompareMode | null;
  reduced_motion: boolean | null;
  theme: string | null;
};

export const defaultUserSettings: UserSettings = {
  defaultStatMode: "career",
  defaultPlayerView: "cards",
  defaultCompareMode: "career_playstyle",
  reducedMotion: false,
  theme: defaultStatCourtTheme.id,
};

export const userSettingsChangedEvent = "statcourt:user-settings-changed";

export function notifyUserSettingsChanged(settings: UserSettings) {
  window.dispatchEvent(
    new CustomEvent<UserSettings>(userSettingsChangedEvent, {
      detail: settings,
    }),
  );
}

function rowToSettings(row: UserSettingsRow | null): UserSettings {
  if (!row) return defaultUserSettings;

  return {
    defaultStatMode:
      row.default_stat_mode ?? defaultUserSettings.defaultStatMode,
    defaultPlayerView:
      row.default_player_view ?? defaultUserSettings.defaultPlayerView,
    defaultCompareMode:
      row.default_compare_mode ?? defaultUserSettings.defaultCompareMode,
    reducedMotion: row.reduced_motion ?? defaultUserSettings.reducedMotion,
    theme:
      row.theme && isStatCourtThemeId(row.theme)
        ? row.theme
        : defaultUserSettings.theme,
  };
}

export function useUserSettings() {
  const { user, isLoadingUser } = useAuthUser();
  const [settings, setSettings] =
    useState<UserSettings>(defaultUserSettings);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    function updateSettings(event: Event) {
      const settingsEvent = event as CustomEvent<UserSettings>;

      if (!settingsEvent.detail) return;

      setSettings(settingsEvent.detail);
    }

    window.addEventListener(userSettingsChangedEvent, updateSettings);

    return () => {
      window.removeEventListener(userSettingsChangedEvent, updateSettings);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadSettings() {
      if (isLoadingUser) return;

      setIsLoadingSettings(true);

      if (!user) {
        setSettings(defaultUserSettings);
        setIsLoadingSettings(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_settings")
        .select(
          "default_stat_mode, default_player_view, default_compare_mode, reduced_motion, theme",
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (!isActive) return;

      if (error) {
        console.error("Failed to load user settings", error);
        setSettings(defaultUserSettings);
      } else {
        setSettings(rowToSettings(data as UserSettingsRow | null));
      }

      setIsLoadingSettings(false);
    }

    loadSettings();

    return () => {
      isActive = false;
    };
  }, [isLoadingUser, user]);

  return { settings, isLoadingSettings, user, isLoadingUser };
}
