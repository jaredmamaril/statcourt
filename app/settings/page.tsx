"use client";

import {
  Database,
  Eye,
  KeyRound,
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
import {
  getAuthProviderLabel,
  hasConnectedProvider,
} from "../lib/auth-display";

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

function formatMemberSince(createdAt?: string) {
  if (!createdAt) return "Not signed in";

  return new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function getPasswordValidationMessage(password: string) {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[a-z]/.test(password)) return "Add a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Add an uppercase letter.";
  if (!/[0-9]/.test(password)) return "Add a number.";
  if (!/[!@#$%^&*()_+\-=[\]{};'\\:"|<>?,./`~]/.test(password)) {
    return "Add a special character.";
  }

  return "";
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
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [profileStatus, setProfileStatus] = useState("");
  const [accountActionStatus, setAccountActionStatus] = useState("");
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [pendingEmailAddress, setPendingEmailAddress] = useState("");
  const [emailPasswordInput, setEmailPasswordInput] = useState("");
  const [isEmailPasswordVisible, setIsEmailPasswordVisible] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [visiblePasswordFields, setVisiblePasswordFields] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSettings(loadedSettings);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadedSettings]);

  useEffect(() => {
    const nextDisplayName =
      user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "";

    const timeoutId = window.setTimeout(() => {
      setDisplayNameInput(nextDisplayName);
      setProfileStatus("");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [user]);

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
  const emailAddress = user?.email ?? "Not signed in";
  const memberSince = formatMemberSince(user?.created_at);
  const hasGoogleProvider = hasConnectedProvider(user, "google");
  const signInMethodLabel = getAuthProviderLabel(user);

  async function saveDisplayName() {
    const nextDisplayName = displayNameInput.trim();

    if (!user) {
      setProfileStatus("Sign in to edit profile.");
      return;
    }

    if (nextDisplayName.length < 2) {
      setProfileStatus("Use at least 2 characters.");
      return;
    }

    if (nextDisplayName.length > 40) {
      setProfileStatus("Keep it under 40 characters.");
      return;
    }

    setProfileStatus("Saving...");

    const { error } = await supabase.auth.updateUser({
      data: {
        name: nextDisplayName,
      },
    });

    if (error) {
      console.error("Failed to update display name", error);
      setProfileStatus("Could not save name.");
      return;
    }

    setProfileStatus("Saved");
    setIsEditingDisplayName(false);
  }

  async function updateEmail() {
    const nextEmail = newEmailInput.trim();

    if (!user?.email) {
      setAccountActionStatus("Email sign-in is required.");
      return;
    }

    if (!nextEmail) {
      setAccountActionStatus("Enter a new email.");
      return;
    }

    if (nextEmail.toLowerCase() === user.email.toLowerCase()) {
      setAccountActionStatus("Use a different email.");
      return;
    }

    if (!emailPasswordInput) {
      setAccountActionStatus("Enter your password.");
      return;
    }

    setAccountActionStatus("Checking password...");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: emailPasswordInput,
    });

    if (signInError) {
      setAccountActionStatus("Password is incorrect.");
      return;
    }

    setAccountActionStatus("Sending confirmation...");

    const emailRedirectTo = `${window.location.origin}/settings`;

    const { error } = await supabase.auth.updateUser(
      {
        email: nextEmail,
      },
      {
        emailRedirectTo,
      },
    );

    if (error) {
      const errorMessage = error.message.toLowerCase();

      if (
        errorMessage.includes("same email") ||
        errorMessage.includes("different from the old email")
      ) {
        setAccountActionStatus("Use a different email.");
      } else if (errorMessage.includes("already")) {
        setAccountActionStatus("Email is already in use.");
      } else {
        setAccountActionStatus(error.message);
      }
      return;
    }

    setPendingEmailAddress(nextEmail);
    setEmailPasswordInput("");
    setIsEmailPasswordVisible(false);
    setAccountActionStatus("Check your inbox to confirm.");
  }

  async function resendEmailChangeConfirmation() {
    if (!pendingEmailAddress) {
      setAccountActionStatus("Enter a new email first.");
      return;
    }

    setAccountActionStatus("Resending confirmation...");

    const { error } = await supabase.auth.updateUser(
      {
        email: pendingEmailAddress,
      },
      {
        emailRedirectTo: `${window.location.origin}/settings`,
      },
    );

    if (error) {
      setAccountActionStatus(error.message);
      return;
    }

    setAccountActionStatus("Confirmation resent.");
  }

  async function updatePassword() {
    if (!user) {
      setPasswordStatus("Sign in to update password.");
      return;
    }

    if (!user.email) {
      setPasswordStatus("Email sign-in is required.");
      return;
    }

    if (!currentPasswordInput) {
      setPasswordStatus("Enter your current password.");
      return;
    }

    const passwordValidationMessage =
      getPasswordValidationMessage(newPasswordInput);

    if (passwordValidationMessage) {
      setPasswordStatus(passwordValidationMessage);
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordStatus("Passwords do not match.");
      return;
    }

    setPasswordStatus("Saving...");

    const { error } = await supabase.auth.updateUser({
      password: newPasswordInput,
      current_password: currentPasswordInput,
    });

    if (error) {
      const errorMessage = error.message.toLowerCase();

      if (
        error.name === "AuthWeakPasswordError" ||
        errorMessage.includes("password should contain")
      ) {
        setPasswordStatus("Use upper, lower, number, and symbol.");
      } else if (
        error.code === "same_password" ||
        errorMessage.includes("same password") ||
        errorMessage.includes("different from the old password")
      ) {
        setPasswordStatus("Use a different new password.");
      } else if (
        errorMessage.includes("current password") ||
        errorMessage.includes("invalid credentials")
      ) {
        setPasswordStatus("Current password is incorrect.");
      } else {
        console.error("Failed to update password", error);
        setPasswordStatus("Could not update password.");
      }
      return;
    }

    setCurrentPasswordInput("");
    setNewPasswordInput("");
    setConfirmPasswordInput("");
    setVisiblePasswordFields({
      current: false,
      new: false,
      confirm: false,
    });
    setPasswordStatus("Password updated");
    setIsChangingPassword(false);
  }

  async function sendPasswordResetFromSettings() {
    if (!user?.email) {
      setPasswordStatus("Email sign-in is required.");
      return;
    }

    setPasswordStatus("Sending reset link...");

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setPasswordStatus(error.message);
      return;
    }

    setPasswordStatus("Reset link sent to your email.");
  }

  async function connectGoogleProvider() {
    if (!user) {
      setAccountActionStatus("Sign in to connect Google.");
      return;
    }

    setAccountActionStatus("Opening Google...");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      },
    });

    if (error) {
      setAccountActionStatus(error.message);
    }
  }

  return (
    <main className="page-enter relative min-h-svh bg-background px-3 py-3 text-white lg:px-6 lg:pt-12">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-repeat opacity-100"
        style={{
          backgroundImage: "url('/court-pattern.svg')",
          backgroundPosition: "top left",
          backgroundSize: "900px auto",
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
            <div className="mb-2.5 flex items-center justify-between gap-2 lg:mb-5 lg:gap-3">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#1bc2ec]/40 bg-[#1bc2ec]/10 text-[#1bc2ec] lg:h-9 lg:w-9">
                  <UserCircle className="h-2.5 w-2.5 lg:h-4 lg:w-4" />
                </div>

                <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                  Account
                </p>
              </div>

              <p className="font-michroma text-[6px] uppercase text-[#1bc2ec]/70 lg:text-[8px]">
                {accountActionStatus}
              </p>
            </div>

            <div className="grid gap-1.5 lg:gap-3">
              <div className="rounded-md border border-white/10 bg-black/20 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                    Display Name
                  </p>

                  <p className="min-w-0 flex-1 truncate font-michroma text-[8px] text-white lg:text-[10px]">
                    {displayName}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingDisplayName((current) => !current);
                      setProfileStatus("");
                    }}
                    disabled={!user}
                    className="shrink-0 rounded-md border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 px-2.5 py-1.5 font-michroma text-[6px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/25 lg:px-3 lg:text-[8px]"
                  >
                    {isEditingDisplayName ? "Close" : "Edit Name"}
                  </button>
                </div>

                {isEditingDisplayName && (
                  <div className="mt-2 grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
                    <input
                      type="text"
                      value={displayNameInput}
                      onChange={(event) => {
                        setDisplayNameInput(event.target.value);
                        setProfileStatus("");
                      }}
                      disabled={!user}
                      maxLength={40}
                      placeholder={displayName}
                      className="min-w-0 rounded-md border border-white/10 bg-black/30 px-2 py-2 font-michroma text-[8px] text-white outline-none transition placeholder:text-white/25 focus:border-[#1bc2ec]/60 disabled:cursor-not-allowed disabled:text-white/30 lg:px-3 lg:text-[10px]"
                    />

                    <button
                      type="button"
                      onClick={saveDisplayName}
                      disabled={!user}
                      className="rounded-md border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 px-3 py-2 font-michroma text-[7px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/25 lg:px-4 lg:text-[9px]"
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDisplayNameInput(displayName);
                        setProfileStatus("");
                        setIsEditingDisplayName(false);
                      }}
                      className="rounded-md border border-white/10 bg-white/5 px-3 py-2 font-michroma text-[7px] uppercase text-white/45 transition hover:border-white/25 hover:text-white lg:px-4 lg:text-[9px]"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {profileStatus && (
                  <p className="mt-1.5 font-michroma text-[5px] uppercase text-[#1bc2ec]/70 lg:text-[7px]">
                    {profileStatus}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5 lg:gap-3">
                <div className="rounded-md border border-white/10 bg-black/20 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                      Email
                    </p>

                    <p className="min-w-0 flex-1 truncate font-michroma text-[8px] text-white lg:text-[10px]">
                      {emailAddress}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingEmail((current) => !current);
                        setAccountActionStatus("");
                      }}
                      disabled={!user}
                      className="shrink-0 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 font-michroma text-[6px] uppercase text-white/45 transition hover:border-[#1bc2ec]/35 hover:text-[#1bc2ec] disabled:cursor-not-allowed disabled:text-white/20 lg:px-3 lg:text-[8px]"
                    >
                      {isChangingEmail ? "Close" : "Change Email"}
                    </button>
                  </div>

                  {isChangingEmail && (
                    <div className="mt-1.5 grid gap-1.5 lg:mt-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] lg:gap-2">
                      <input
                        type="email"
                        value={newEmailInput}
                        onChange={(event) => {
                          setNewEmailInput(event.target.value);
                          setAccountActionStatus("");
                        }}
                        disabled={!user}
                        placeholder="New email"
                        className="w-full min-w-0 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 font-michroma text-[7px] text-white outline-none transition placeholder:text-white/25 focus:border-[#1bc2ec]/60 disabled:cursor-not-allowed disabled:text-white/30 lg:px-3 lg:py-2 lg:text-[10px]"
                      />

                      <div className="relative min-w-0">
                        <input
                          type={isEmailPasswordVisible ? "text" : "password"}
                          value={emailPasswordInput}
                          onChange={(event) => {
                            setEmailPasswordInput(event.target.value);
                            setAccountActionStatus("");
                          }}
                          disabled={!user}
                          placeholder="Current password"
                          className="w-full min-w-0 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 pr-7 font-michroma text-[7px] text-white outline-none transition placeholder:text-white/25 focus:border-[#1bc2ec]/60 disabled:cursor-not-allowed disabled:text-white/30 lg:px-3 lg:py-2 lg:pr-8 lg:text-[10px]"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setIsEmailPasswordVisible((current) => !current)
                          }
                          disabled={!user}
                          aria-label="Toggle email password visibility"
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-[#1bc2ec] disabled:cursor-not-allowed disabled:text-white/15 lg:right-2"
                        >
                          <Eye className="h-2.5 w-2.5 lg:h-3.5 lg:w-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={updateEmail}
                        disabled={!user}
                        className="rounded-md border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 px-2 py-1.5 font-michroma text-[6px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/25 lg:px-4 lg:py-2 lg:text-[9px]"
                      >
                        Update
                      </button>

                      {pendingEmailAddress && (
                        <button
                          type="button"
                          onClick={resendEmailChangeConfirmation}
                          disabled={!user}
                          className="rounded-md border border-[#1bc2ec]/30 bg-[#1bc2ec]/5 px-2 py-1.5 font-michroma text-[6px] uppercase text-[#1bc2ec]/75 transition hover:bg-[#1bc2ec]/15 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/25 lg:col-span-2 lg:px-4 lg:py-2 lg:text-[9px]"
                        >
                          Resend Confirmation
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setNewEmailInput("");
                          setPendingEmailAddress("");
                          setEmailPasswordInput("");
                          setIsEmailPasswordVisible(false);
                          setAccountActionStatus("");
                          setIsChangingEmail(false);
                        }}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 font-michroma text-[6px] uppercase text-white/45 transition hover:border-white/25 hover:text-white lg:px-4 lg:py-2 lg:text-[9px]"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="rounded-md border border-white/10 bg-black/20 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                      Account Status
                    </p>

                    <p className="min-w-0 flex-1 truncate font-michroma text-[8px] text-[#22C55E] lg:text-[10px]">
                      {user ? "Signed in" : "Signed out"}
                    </p>

                    <p className="shrink-0 font-michroma text-[5px] uppercase text-white/30 lg:text-[7px]">
                      {memberSince}
                    </p>
                  </div>
                </div>

                <div className="rounded-md border border-white/10 bg-black/20 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                      Sign-In Method
                    </p>

                    <p className="min-w-0 flex-1 truncate font-michroma text-[8px] text-white lg:text-[10px]">
                      {signInMethodLabel}
                    </p>

                    {hasGoogleProvider ? (
                      <span className="shrink-0 rounded-md border border-[#22C55E]/35 bg-[#22C55E]/10 px-2.5 py-1.5 font-michroma text-[6px] uppercase text-[#22C55E] lg:px-3 lg:text-[8px]">
                        Google Connected
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={connectGoogleProvider}
                        disabled={!user}
                        className="shrink-0 rounded-md border border-[#1bc2ec]/35 bg-[#1bc2ec]/10 px-2.5 py-1.5 font-michroma text-[6px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/20 lg:px-3 lg:text-[8px]"
                      >
                        Connect Methods
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#06131d]/80 p-2.5 shadow-[0_0_18px_rgba(0,0,0,0.25)] lg:p-5">
            <div className="mb-2.5 flex items-center justify-between gap-2 lg:mb-5 lg:gap-3">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#EFBF04]/40 bg-[#EFBF04]/10 text-[#EFBF04] lg:h-9 lg:w-9">
                  <KeyRound className="h-2.5 w-2.5 lg:h-4 lg:w-4" />
                </div>

                <p className="font-michroma text-[9px] uppercase text-white lg:text-sm">
                  Security
                </p>
              </div>

              <p className="font-michroma text-[6px] uppercase text-[#1bc2ec]/70 lg:text-[8px]">
                {passwordStatus}
              </p>
            </div>

            <div className="rounded-md border border-white/10 bg-black/20 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                    Password
                  </p>
                  <p className="mt-1 font-michroma text-[8px] text-white lg:text-[10px]">
                    Change Password
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword((current) => !current);
                    setPasswordStatus("");
                  }}
                  disabled={!user}
                  className="rounded-md border border-[#EFBF04]/50 bg-[#EFBF04]/10 px-3 py-2 font-michroma text-[7px] uppercase text-[#EFBF04] transition hover:bg-[#EFBF04]/20 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/25 lg:px-4 lg:text-[9px]"
                >
                  {isChangingPassword ? "Close" : "Change Password"}
                </button>
              </div>

              <p className="mt-1.5 hidden font-michroma text-[5px] leading-relaxed text-white/30 lg:block lg:text-[7px]">
                Use a new password with at least 8 characters. You may need to
                sign in again on other devices.
              </p>

              {isChangingPassword && (
                <div className="mt-1.5 grid gap-1.5 lg:mt-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto] lg:gap-2">
                  <div className="relative min-w-0">
                    <input
                      type={visiblePasswordFields.current ? "text" : "password"}
                      value={currentPasswordInput}
                      onChange={(event) => {
                        setCurrentPasswordInput(event.target.value);
                        setPasswordStatus("");
                      }}
                      disabled={!user}
                      placeholder="Current password"
                      className="w-full min-w-0 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 pr-7 font-michroma text-[7px] text-white outline-none transition placeholder:text-white/25 focus:border-[#1bc2ec]/60 disabled:cursor-not-allowed disabled:text-white/30 lg:px-3 lg:py-2 lg:pr-8 lg:text-[10px]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setVisiblePasswordFields((current) => ({
                          ...current,
                          current: !current.current,
                        }))
                      }
                      disabled={!user}
                      aria-label="Toggle current password visibility"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-[#1bc2ec] disabled:cursor-not-allowed disabled:text-white/15 lg:right-2"
                    >
                      <Eye className="h-2.5 w-2.5 lg:h-3.5 lg:w-3.5" />
                    </button>
                  </div>

                  <div className="relative min-w-0">
                    <input
                      type={visiblePasswordFields.new ? "text" : "password"}
                      value={newPasswordInput}
                      onChange={(event) => {
                        setNewPasswordInput(event.target.value);
                        setPasswordStatus("");
                      }}
                      disabled={!user}
                      placeholder="New password"
                      className="w-full min-w-0 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 pr-7 font-michroma text-[7px] text-white outline-none transition placeholder:text-white/25 focus:border-[#1bc2ec]/60 disabled:cursor-not-allowed disabled:text-white/30 lg:px-3 lg:py-2 lg:pr-8 lg:text-[10px]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setVisiblePasswordFields((current) => ({
                          ...current,
                          new: !current.new,
                        }))
                      }
                      disabled={!user}
                      aria-label="Toggle new password visibility"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-[#1bc2ec] disabled:cursor-not-allowed disabled:text-white/15 lg:right-2"
                    >
                      <Eye className="h-2.5 w-2.5 lg:h-3.5 lg:w-3.5" />
                    </button>
                  </div>

                  <div className="relative min-w-0">
                    <input
                      type={visiblePasswordFields.confirm ? "text" : "password"}
                      value={confirmPasswordInput}
                      onChange={(event) => {
                        setConfirmPasswordInput(event.target.value);
                        setPasswordStatus("");
                      }}
                      disabled={!user}
                      placeholder="Confirm password"
                      className="w-full min-w-0 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 pr-7 font-michroma text-[7px] text-white outline-none transition placeholder:text-white/25 focus:border-[#1bc2ec]/60 disabled:cursor-not-allowed disabled:text-white/30 lg:px-3 lg:py-2 lg:pr-8 lg:text-[10px]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setVisiblePasswordFields((current) => ({
                          ...current,
                          confirm: !current.confirm,
                        }))
                      }
                      disabled={!user}
                      aria-label="Toggle confirm password visibility"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-[#1bc2ec] disabled:cursor-not-allowed disabled:text-white/15 lg:right-2"
                    >
                      <Eye className="h-2.5 w-2.5 lg:h-3.5 lg:w-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={updatePassword}
                    disabled={!user}
                    className="rounded-md border border-[#EFBF04]/50 bg-[#EFBF04]/10 px-2 py-1.5 font-michroma text-[6px] uppercase text-[#EFBF04] transition hover:bg-[#EFBF04]/20 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/25 lg:px-4 lg:py-2 lg:text-[9px]"
                  >
                    Update
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPasswordInput("");
                      setNewPasswordInput("");
                      setConfirmPasswordInput("");
                      setVisiblePasswordFields({
                        current: false,
                        new: false,
                        confirm: false,
                      });
                      setPasswordStatus("");
                      setIsChangingPassword(false);
                    }}
                    className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 font-michroma text-[6px] uppercase text-white/45 transition hover:border-white/25 hover:text-white lg:px-4 lg:py-2 lg:text-[9px]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={sendPasswordResetFromSettings}
                    disabled={!user?.email}
                    className="justify-self-start font-michroma text-[6px] uppercase text-white/35 transition hover:text-[#1bc2ec] disabled:cursor-not-allowed disabled:text-white/15 lg:col-span-5 lg:text-[8px]"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
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
                  Dark Court
                </p>
                <p className="mt-1 font-michroma text-[5px] uppercase text-white/25 lg:text-[7px]">
                  More themes later
                </p>
              </div>

              <div className="rounded-md border border-white/10 bg-black/20 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#1bc2ec]/35 hover:bg-[#071827]/80 hover:shadow-[0_0_18px_rgba(27,194,236,0.12)] lg:p-4">
                <p className="font-michroma text-[6px] uppercase text-white/35 lg:text-[8px]">
                  Interface Density
                </p>
                <p className="mt-1 font-michroma text-[9px] text-[#1bc2ec] lg:mt-2 lg:text-sm">
                  Standard
                </p>
                <p className="mt-1 font-michroma text-[5px] uppercase text-white/25 lg:text-[7px]">
                  Compact mode later
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
                label="Default Compare Lens"
                helper="Court preference later"
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
                Court Connection
              </p>
            </div>

            <div className="mb-2 flex w-fit items-center gap-2 rounded-md border border-[#1bc2ec]/25 bg-[#1bc2ec]/8 px-2 py-1 lg:mb-3 lg:px-3 lg:py-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full lg:h-2 lg:w-2 ${
                  user ? "bg-[#22C55E]" : "bg-[#EFBF04]"
                }`}
              />
              <p className="font-michroma text-[6px] uppercase text-[#1bc2ec] lg:text-[8px]">
                {user ? "Account Synced" : "Local Session"}
              </p>
            </div>

            <p className="font-michroma text-[6px] leading-relaxed text-white/40 lg:text-[9px]">
              {user
                ? "Your preferences are connected to this StatCourt account and follow you across players, rankings, court, and lineup tools."
                : "You can keep browsing locally, but sign in to carry preferences, saved lineups, favorites, and recent activity across sessions."}
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
  helper?: string;
  options: PreferenceOption<TValue>[];
  value: TValue;
  onSelect: (value: TValue) => void;
};

function PreferenceButtonGroup<TValue extends string>({
  label,
  helper,
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

      {helper && (
        <p className="mt-1.5 font-michroma text-[5px] uppercase text-white/25 lg:text-[7px]">
          {helper}
        </p>
      )}
    </div>
  );
}
