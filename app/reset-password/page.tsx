"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Eye, KeyRound } from "lucide-react";
import { supabase } from "../components/supabase-client";

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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparingSession, setIsPreparingSession] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState<"reset" | "setup">("reset");
  const [visiblePasswordFields, setVisiblePasswordFields] = useState({
    new: false,
    confirm: false,
  });

  useEffect(() => {
    let isActive = true;

    async function prepareRecoverySession() {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const code = params.get("code");
      const mode = params.get("mode");
      const authError =
        params.get("error_description") ??
        params.get("error") ??
        hashParams.get("error_description") ??
        hashParams.get("error");

      if (mode === "setup") {
        setRecoveryMode("setup");
      }

      if (authError) {
        if (!isActive) return;

        setError("Could not verify this reset link. Request a new one.");
        setIsPreparingSession(false);
        return;
      }

      if (!code) {
        const { data } = await supabase.auth.getSession();

        if (!isActive) return;

        if (data.session) {
          router.replace("/settings");
          return;
        }

        if (!data.session) {
          setError("Open the password setup link from your email.");
        }

        setIsPreparingSession(false);
        return;
      }

      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (!isActive) return;

      if (exchangeError) {
        setError("Could not verify this reset link. Request a new one.");
      }

      setIsPreparingSession(false);
    }

    prepareRecoverySession();

    return () => {
      isActive = false;
    };
  }, [router]);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPreparingSession) return;

    setStatus("");
    setError("");

    const passwordValidationMessage =
      getPasswordValidationMessage(newPassword);

    if (passwordValidationMessage) {
      setError(passwordValidationMessage);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setIsSubmitting(false);

    if (updateError) {
      const updateErrorMessage = updateError.message.toLowerCase();

      if (
        updateError.name === "AuthWeakPasswordError" ||
        updateErrorMessage.includes("password should contain")
      ) {
        setError("Use upper, lower, number, and symbol.");
      } else if (
        updateError.code === "same_password" ||
        updateErrorMessage.includes("same password") ||
        updateErrorMessage.includes("different from the old password")
      ) {
        setError("Choose a password different from your current one.");
      } else {
        setError("Could not reset password. Please try again.");
      }
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setVisiblePasswordFields({
      new: false,
      confirm: false,
    });
    setStatus(
      recoveryMode === "setup"
        ? "Password created. You can now sign in with email/password."
        : "Password updated. Sending you to sign in...",
    );
    window.setTimeout(() => router.push("/signin"), 1200);
  }

  return (
    <main className="page-enter relative min-h-svh overflow-hidden px-3 py-4 text-white lg:px-6 lg:pt-12">
      <section className="relative z-10 mx-auto flex min-h-[calc(100svh-32px)] max-w-[320px] items-center justify-center lg:min-h-[calc(100vh-120px)] lg:max-w-md">
        <div className="w-full rounded-lg border border-[rgb(var(--court-accent-rgb)/0.4)] bg-[color:color-mix(in_srgb,var(--court-panel)_85%,transparent)] p-3.5 shadow-[0_0_24px_rgb(var(--court-accent-rgb)/0.16)] lg:p-6 lg:shadow-[0_0_36px_rgb(var(--court-accent-rgb)/0.2)]">
          <div className="mb-3.5 flex flex-col items-center text-center lg:mb-6">
            <div className="mb-2.5 flex h-14 w-14 items-center justify-center rounded-lg border border-[rgb(var(--court-accent-rgb)/0.45)] bg-[rgb(var(--court-accent-rgb)/0.1)] shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.18)] lg:mb-4 lg:h-20 lg:w-20 lg:shadow-[0_0_24px_rgb(var(--court-accent-rgb)/0.22)]">
              <Image
                src="/statcourt-logo.svg"
                alt="StatCourt"
                width={44}
                height={44}
                priority
                className="lg:h-16 lg:w-16"
              />
            </div>

            <p className="font-michroma text-[9px] font-bold uppercase tracking-wide text-[var(--court-accent)] lg:text-[12px]">
              StatCourt
            </p>

            <h1 className="mt-2.5 font-michroma text-sm uppercase leading-snug text-white lg:mt-3 lg:text-2xl">
              {recoveryMode === "setup" ? "Create Password" : "Reset Password"}
            </h1>

            <p className="mt-2 font-michroma text-[8px] uppercase tracking-wide text-white/65 lg:mt-3 lg:text-[10px]">
              Choose a new account key.
            </p>
          </div>

          <div className="mb-3 rounded-md border border-white/10 bg-black/20 p-2.5 lg:mb-5 lg:p-3">
            <div className="flex items-center justify-center gap-1.5 font-michroma text-[8px] uppercase text-white/60 lg:gap-2 lg:text-[9px]">
              <KeyRound className="h-3 w-3 text-[var(--court-accent)] lg:h-3.5 lg:w-3.5" />
              {recoveryMode === "setup" ? "Password Setup" : "Password Recovery"}
            </div>

            <p className="mt-1.5 text-center font-michroma text-[8px] leading-relaxed text-white/65 lg:mt-2 lg:text-[10px]">
              {recoveryMode === "setup"
                ? "Create an email/password login for this StatCourt account."
                : "Use the secure email link, then set a stronger password."}
            </p>
          </div>

          <form onSubmit={updatePassword} className="grid gap-2 lg:gap-3">
            <div className="relative min-w-0">
              <label htmlFor="reset-new-password" className="sr-only">
                {recoveryMode === "setup" ? "Create password" : "New password"}
              </label>
              <input
                id="reset-new-password"
                type={visiblePasswordFields.new ? "text" : "password"}
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setError("");
                  setStatus("");
                }}
                disabled={isPreparingSession}
                required
                autoComplete="new-password"
                aria-invalid={Boolean(error)}
                aria-describedby={
                  error || status ? "reset-password-status" : undefined
                }
                placeholder={
                  recoveryMode === "setup" ? "Create password" : "New password"
                }
                className="w-full rounded-md border border-white/15 bg-black/25 px-3 py-2 pr-8 font-michroma text-[9px] text-white outline-none transition placeholder:text-white/55 focus:border-[var(--court-accent)] disabled:cursor-not-allowed disabled:text-white/55 lg:px-4 lg:py-3 lg:pr-10 lg:text-[10px]"
              />

              <button
                type="button"
                onClick={() =>
                  setVisiblePasswordFields((current) => ({
                    ...current,
                    new: !current.new,
                  }))
                }
                aria-label="Toggle new password visibility"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-[var(--court-accent)] lg:right-3"
              >
                <Eye className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
              </button>
            </div>

            <div className="relative min-w-0">
              <label htmlFor="reset-confirm-password" className="sr-only">
                Confirm password
              </label>
              <input
                id="reset-confirm-password"
                type={visiblePasswordFields.confirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError("");
                  setStatus("");
                }}
                disabled={isPreparingSession}
                required
                autoComplete="new-password"
                aria-invalid={Boolean(error)}
                aria-describedby={
                  error || status ? "reset-password-status" : undefined
                }
                placeholder="Confirm password"
                className="w-full rounded-md border border-white/15 bg-black/25 px-3 py-2 pr-8 font-michroma text-[9px] text-white outline-none transition placeholder:text-white/55 focus:border-[var(--court-accent)] disabled:cursor-not-allowed disabled:text-white/55 lg:px-4 lg:py-3 lg:pr-10 lg:text-[10px]"
              />

              <button
                type="button"
                onClick={() =>
                  setVisiblePasswordFields((current) => ({
                    ...current,
                    confirm: !current.confirm,
                  }))
                }
                aria-label="Toggle confirm password visibility"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-[var(--court-accent)] lg:right-3"
              >
                <Eye className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isPreparingSession}
              className="group flex items-center justify-center gap-2 rounded-md border border-[rgb(var(--court-accent-rgb)/0.55)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-3 py-2 font-michroma text-[8px] uppercase text-[var(--court-accent)] shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.14)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.2)] hover:text-white hover:shadow-[0_0_24px_rgb(var(--court-accent-rgb)/0.28)] disabled:cursor-not-allowed disabled:opacity-60 lg:px-4 lg:py-3 lg:text-[10px]"
            >
              <KeyRound className="h-3 w-3 transition group-hover:brightness-125 lg:h-4 lg:w-4" />
              {isPreparingSession
                ? "Preparing..."
                : isSubmitting
                  ? "Updating..."
                  : recoveryMode === "setup"
                    ? "Create Password"
                    : "Update Password"}
            </button>
          </form>

          {(error || status) && (
            <p
              id="reset-password-status"
              role={error ? "alert" : "status"}
              className={`mt-2 text-center font-michroma text-[8px] leading-relaxed lg:text-[9px] ${
                error ? "text-red-300" : "text-[var(--court-accent)]"
              }`}
            >
              {error || status}
            </p>
          )}

          <Link
            href="/signin"
            className="mt-2.5 block text-center font-michroma text-[8px] uppercase tracking-[0.2em] text-white/60 transition hover:text-[var(--court-accent)] lg:mt-3 lg:text-[9px] lg:tracking-[0.25em]"
          >
            Back to Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}

