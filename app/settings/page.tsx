"use client";

import {
  Database,
  Eye,
  LogOut,
  Monitor,
  Settings2,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  defaultUserSettings,
  type DefaultCompareMode,
  type DefaultPlayerView,
  type DefaultStatMode,
  type UserSettings,
  useUserSettings,
} from "../lib/use-user-settings";
import { supabase } from "../components/supabase-client";

type UserDataCounts = {
  savedLineups: number;
  favoritePlayers: number;
  playersViewed: number;
};

const defaultCounts: UserDataCounts = {
  savedLineups: 0,
  favoritePlayers: 0,
  playersViewed: 0,
};

const statModeOptions: { label: string; value: DefaultStatMode }[] = [
  { label: "Career", value: "career" },
  { label: "3-Year Peak", value: "peak" },
  { label: "Latest Season", value: "current" },
];

const playerViewOptions: { label: string; value: DefaultPlayerView }[] = [
  { label: "Cards", value: "cards" },
  { label: "List", value: "list" },
];

const compareModeOptions: { label: string; value: DefaultCompareMode }[] = [
  { label: "Career Playstyle", value: "career_playstyle" },
  { label: "Stat Edges", value: "stat_edges" },
];

function settingToRow(settings: UserSettings, userId: string) {
  return {
    user_id: userId,
    default_stat_mode: settings.defaultStatMode,
    default_player_view: settings.defaultPlayerView,
    default_compare_mode: settings.defaultCompareMode,
    reduced_motion: settings.reducedMotion,
    updated_at: new Date().toISOString(),
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const {
    user,
    isLoadingUser,
    settings: loadedSettings,
    isLoadingSettings: isLoadingUserSettings,
  } = useUserSettings();
  const [settings, setSettings] = useState<UserSettings>(defaultUserSettings);
  const [dataCounts, setDataCounts] = useState<UserDataCounts>(defaultCounts);
  const [settingsStatus, setSettingsStatus] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSettings(loadedSettings);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadedSettings]);

  useEffect(() => {
    let isActive = true;

    async function loadDataCounts() {
      if (isLoadingUser) return;

      setSettingsStatus("");

      if (!user) {
        setDataCounts(defaultCounts);
        return;
      }

      const [
        savedLineupsResponse,
        favoritePlayersResponse,
        recentPlayersResponse,
      ] = await Promise.all([
        supabase
          .from("saved_lineups")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("favorite_players")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("recent_players")
          .select("id", { count: "exact", head: true }),
      ]);

      if (!isActive) return;

      setDataCounts({
        savedLineups: savedLineupsResponse.count ?? 0,
        favoritePlayers: favoritePlayersResponse.count ?? 0,
        playersViewed: recentPlayersResponse.count ?? 0,
      });
    }

    loadDataCounts();

    return () => {
      isActive = false;
    };
  }, [isLoadingUser, user]);

  async function saveSettings(nextSettings: UserSettings) {
    setSettings(nextSettings);

    if (!user) {
      setSettingsStatus("Sign in to sync settings.");
      return;
    }

    setSettingsStatus("Saving...");

    const { error } = await supabase
      .from("user_settings")
      .upsert(settingToRow(nextSettings, user.id), {
        onConflict: "user_id",
      });

    if (error) {
      console.error("Failed to save user settings", error);
      setSettingsStatus("Could not save settings.");
      return;
    }

    setSettingsStatus("Saved");
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/signin");
  }

  const displayName =
    user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "Signed Out";

  return (
    <main className="page-enter relative min-h-svh bg-background px-3 py-3 text-white lg:px-6 lg:pt-12">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{
          backgroundImage: "url('/court-pattern.svg')",
        }}
      />

      <section className="relative z-10 mx-auto max-w-4xl py-3 lg:py-10">
        <div className="mb-3 lg:mb-8">
          <p className="font-michroma text-[7px] uppercase tracking-wide text-[#1bc2ec] lg:text-[10px]">
            StatCourt Account
          </p>

          <h1 className="mt-1 font-michroma text-base uppercase text-white lg:mt-2 lg:text-3xl">
            Settings
          </h1>

          <p className="mt-1.5 max-w-xl font-michroma text-[6px] leading-relaxed text-white/45 lg:mt-3 lg:text-[10px]">
            Account preferences for your StatCourt experience.
          </p>
        </div>

        <div className="grid gap-2 lg:gap-5">
          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-2.5 shadow-[0_0_18px_rgba(0,0,0,0.25)] lg:p-5">
            <div className="mb-2.5 flex items-center gap-2 lg:mb-5 lg:gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#1bc2ec]/40 bg-[#1bc2ec]/10 text-[#1bc2ec] lg:h-9 lg:w-9">
                <UserCircle className="h-2.5 w-2.5 lg:h-4 lg:w-4" />
              </div>

              <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                Account
              </p>
            </div>

            <div className="grid gap-1.5 lg:gap-3">
              <div className="rounded-md border border-white/10 bg-black/20 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-4">
                <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                  Display Name
                </p>
                <p className="mt-1 truncate font-michroma text-[9px] text-white lg:mt-2 lg:text-sm">
                  {displayName}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-2.5 shadow-[0_0_18px_rgba(0,0,0,0.25)] lg:p-5">
            <div className="mb-2.5 flex items-center gap-2 lg:mb-5 lg:gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#A855F7]/40 bg-[#A855F7]/10 text-[#A855F7] lg:h-9 lg:w-9">
                <Monitor className="h-2.5 w-2.5 lg:h-4 lg:w-4" />
              </div>

              <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                Display
              </p>
            </div>

            <div className="grid gap-1.5 lg:grid-cols-3 lg:gap-3">
              <div className="rounded-md border border-white/10 bg-black/20 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-4">
                <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                  Theme
                </p>
                <p className="mt-1 font-michroma text-[9px] text-white lg:mt-2 lg:text-sm">
                  Dark
                </p>
              </div>

              <div className="rounded-md border border-white/10 bg-black/20 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-4">
                <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                  Interface Density
                </p>
                <p className="mt-1 font-michroma text-[9px] text-[#1bc2ec] lg:mt-2 lg:text-sm">
                  Standard
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  saveSettings({
                    ...settings,
                    reducedMotion: !settings.reducedMotion,
                  })
                }
                className="rounded-md border border-white/10 bg-black/20 p-2 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-4"
              >
                <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                  Reduced Motion
                </p>
                <p className="mt-1 font-michroma text-[9px] text-[#1bc2ec] lg:mt-2 lg:text-sm">
                  {settings.reducedMotion ? "On" : "Off"}
                </p>
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-2.5 shadow-[0_0_18px_rgba(0,0,0,0.25)] lg:p-5">
            <div className="mb-2.5 flex items-center justify-between gap-2 lg:mb-5 lg:gap-3">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#EFBF04]/40 bg-[#EFBF04]/10 text-[#EFBF04] lg:h-9 lg:w-9">
                  <Settings2 className="h-2.5 w-2.5 lg:h-4 lg:w-4" />
                </div>

                <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                  Stat Preferences
                </p>
              </div>

              <p className="font-michroma text-[6px] uppercase text-[#1bc2ec]/70 lg:text-[8px]">
                {isLoadingUserSettings ? "Loading" : settingsStatus}
              </p>
            </div>

            <div className="grid gap-2 lg:grid-cols-3 lg:gap-3">
              <PreferenceButtonGroup
                label="Default Stat Mode"
                options={statModeOptions}
                value={settings.defaultStatMode}
                onSelect={(value) =>
                  saveSettings({
                    ...settings,
                    defaultStatMode: value,
                  })
                }
              />

              <PreferenceButtonGroup
                label="Default Player View"
                options={playerViewOptions}
                value={settings.defaultPlayerView}
                onSelect={(value) =>
                  saveSettings({
                    ...settings,
                    defaultPlayerView: value,
                  })
                }
              />

              <PreferenceButtonGroup
                label="Compare Mode"
                options={compareModeOptions}
                value={settings.defaultCompareMode}
                onSelect={(value) =>
                  saveSettings({
                    ...settings,
                    defaultCompareMode: value,
                  })
                }
              />
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-2.5 shadow-[0_0_18px_rgba(0,0,0,0.25)] lg:p-5">
            <div className="mb-2.5 flex items-center gap-2 lg:mb-5 lg:gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E] lg:h-9 lg:w-9">
                <Database className="h-2.5 w-2.5 lg:h-4 lg:w-4" />
              </div>

              <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                Data
              </p>
            </div>

            <div className="grid gap-1.5 lg:grid-cols-3 lg:gap-3">
              {[
                ["Saved Lineups", dataCounts.savedLineups],
                ["Favorite Players", dataCounts.favoritePlayers],
                ["Players Viewed", dataCounts.playersViewed],
              ].map(([item, value]) => (
                <div
                  key={item}
                  className="rounded-md border border-white/10 bg-black/20 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-4"
                >
                  <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                    {item}
                  </p>
                  <p className="mt-1 font-michroma text-[9px] text-white lg:mt-2 lg:text-sm">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-2.5 lg:p-5">
            <div className="mb-2.5 flex items-center gap-2 lg:mb-5 lg:gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/20 bg-white/5 text-white/60 lg:h-9 lg:w-9">
                <Eye className="h-2.5 w-2.5 lg:h-4 lg:w-4" />
              </div>

              <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                Sync Status
              </p>
            </div>

            <p className="font-michroma text-[6px] leading-relaxed text-white/40 lg:text-[9px]">
              {user
                ? "Settings are saved to your StatCourt account and can be used as defaults across player, ranking, court, and lineup pages."
                : "Sign in to save settings across sessions. Local browsing still works without synced preferences."}
            </p>
          </section>

          <section className="rounded-lg border border-red-500/20 bg-red-950/20 p-2.5 lg:p-5">
            <div className="mb-2.5 flex items-center gap-2 lg:mb-5 lg:gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-red-500/35 bg-red-500/10 text-red-300 lg:h-9 lg:w-9">
                <LogOut className="h-2.5 w-2.5 lg:h-4 lg:w-4" />
              </div>

              <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                Danger Zone
              </p>
            </div>

            <p className="mb-2 font-michroma text-[6px] leading-relaxed text-white/40 lg:mb-4 lg:text-[9px]">
              Sign out of this StatCourt account.
            </p>

            <button
              type="button"
              onClick={signOut}
              className="rounded-md border border-red-500/35 bg-red-500/10 px-2.5 py-1.5 font-michroma text-[6px] uppercase text-red-300 transition hover:bg-red-500/20 hover:text-white lg:px-4 lg:py-3 lg:text-[10px]"
            >
              Sign Out
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}

type PreferenceOption<TValue extends string> = {
  label: string;
  value: TValue;
};

type PreferenceButtonGroupProps<TValue extends string> = {
  label: string;
  options: PreferenceOption<TValue>[];
  value: TValue;
  onSelect: (value: TValue) => void;
};

function PreferenceButtonGroup<TValue extends string>({
  label,
  options,
  value,
  onSelect,
}: PreferenceButtonGroupProps<TValue>) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-4">
      <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
        {label}
      </p>

      <div className="mt-2 grid gap-1">
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`rounded border px-2 py-1.5 text-left font-michroma text-[6px] uppercase transition lg:text-[8px] ${
                isSelected
                  ? "border-[#1bc2ec]/60 bg-[#1bc2ec]/15 text-[#1bc2ec]"
                  : "border-white/10 bg-white/5 text-white/45 hover:border-[#1bc2ec]/35 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
