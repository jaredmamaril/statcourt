"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, Mail, Shield } from "lucide-react";
import { supabase } from "../components/supabase-client";
import {
  getPasswordValidationMessage,
  PasswordRequirements,
} from "../components/auth/password-requirements";
import {
  clearPendingAuthProvider,
  setPendingAuthProvider,
  trackUserSignin,
} from "../lib/user-signins";
import { getSafeInternalRedirectPath } from "../lib/safe-redirect";

function GoogleMark() {
  return (
    <span className="grid h-4 w-4 place-items-center rounded-full bg-white shadow-[0_0_12px_rgba(66,133,244,0.34)] lg:h-5 lg:w-5">
      <Image
        src="/google.svg"
        alt=""
        width={14}
        height={14}
        className="h-3 w-3 lg:h-3.5 lg:w-3.5"
      />
    </span>
  );
}

function getAuthEmailErrorMessage(errorMessage: string) {
  if (errorMessage.toLowerCase().includes("rate limit")) {
    return "Too many auth emails sent. This project can send 2 auth emails per hour. Try again later.";
  }

  return "Could not send email. Please try again.";
}

function getAuthErrorMessage(
  errorMessage: string,
  authMode: "signin" | "signup" | "forgot-password",
) {
  if (errorMessage.toLowerCase().includes("rate limit")) {
    return "Too many attempts. Please try again later.";
  }

  if (errorMessage.toLowerCase().includes("user already registered")) {
    return "Could not create account. Try signing in, or use Forgot Password if needed.";
  }

  if (authMode === "signup") {
    return "Could not create account. Please check your details and try again.";
  }

  return "Could not sign in. Please check your details and try again.";
}

function getCallbackErrorMessage(errorCode: string) {
  if (
    errorCode === "auth_callback_failed" ||
    errorCode === "auth_provider_failed"
  ) {
    return "Could not complete sign in. Please try again.";
  }

  return "Could not sign in. Please try again.";
}

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeInternalRedirectPath(
    searchParams.get("next"),
    "/profile",
  );
  const [authMode, setAuthMode] = useState<
    "signin" | "signup" | "forgot-password"
  >("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    let isActive = true;
    const callbackError = searchParams.get("error");

    async function redirectSignedInUser() {
      const { data } = await supabase.auth.getUser();

      if (!isActive) return;

      if (data.user) {
        router.replace(nextPath);
        return;
      }

      if (callbackError) {
        setAuthError(getCallbackErrorMessage(callbackError));
        setAuthMessage("");
      }
    }

    redirectSignedInUser();

    return () => {
      isActive = false;
    };
  }, [nextPath, router, searchParams]);

  async function handleEmailAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage("");
    setAuthError("");
    setIsSubmitting(true);
    clearPendingAuthProvider();

    if (authMode === "signup") {
      const passwordValidationMessage = getPasswordValidationMessage(password);

      if (passwordValidationMessage) {
        setIsSubmitting(false);
        setAuthError(passwordValidationMessage);
        return;
      }
    }

    const authResponse =
      authMode === "signin"
        ? await supabase.auth.signInWithPassword({
            email,
            password,
          })
        : await supabase.auth.signUp({
            email,
            password,
          });

    setIsSubmitting(false);

    if (authResponse.error) {
      setAuthError(getAuthErrorMessage(authResponse.error.message, authMode));
      return;
    }

    if (
      authMode === "signup" &&
      authResponse.data.user &&
      authResponse.data.user.identities?.length === 0
    ) {
      setAuthError(
        "Could not create account. Try signing in, or use Forgot Password if needed.",
      );
      return;
    }

    if (authMode === "signup" && !authResponse.data.session) {
      setAuthMessage("Check your email to confirm your StatCourt account.");
      return;
    }

    await trackUserSignin(authResponse.data.user, "email");

    router.push(nextPath);
  }

  async function handlePasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage("");
    setAuthError("");
    setIsSubmitting(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsSubmitting(false);

    if (error) {
      setAuthError(getAuthEmailErrorMessage(error.message));
      return;
    }

    setAuthMessage("Check your email for the reset link.");
  }

  async function signInWithGoogle() {
    setAuthMessage("");
    setAuthError("");
    setIsSubmitting(true);
    setPendingAuthProvider("google");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          nextPath,
        )}&provider=google`,
      },
    });

    if (error) {
      clearPendingAuthProvider();
      setIsSubmitting(false);
      setAuthError("Could not continue with Google. Please try again.");
    }
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
              Build your roster identity.
            </h1>

            <p className="mt-2 font-michroma text-[8px] uppercase tracking-wide text-white/65 lg:mt-3 lg:text-[10px]">
              Build. Save. Scout.
            </p>
          </div>

          <div className="mb-3 rounded-md border border-white/10 bg-black/20 p-2.5 lg:mb-5 lg:p-3">
            <div className="flex items-center justify-center gap-1.5 font-michroma text-[8px] uppercase text-white/60 lg:gap-2 lg:text-[9px]">
              <Shield className="h-3 w-3 text-[var(--court-accent)] lg:h-3.5 lg:w-3.5" />
              Locker Room Access
            </div>

            <p className="mt-1.5 text-center font-michroma text-[8px] leading-relaxed text-white/65 lg:mt-2 lg:text-[10px]">
              Save lineups, track favorites, and keep your scouting history tied
              to your account.
            </p>
          </div>

          {authMode === "forgot-password" ? (
            <form
              onSubmit={handlePasswordReset}
              className="grid gap-2 lg:gap-3"
            >
              <label htmlFor="forgot-password-email" className="sr-only">
                Email address
              </label>
              <input
                id="forgot-password-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                aria-invalid={Boolean(authError)}
                aria-describedby={
                  authError || authMessage ? "signin-status" : undefined
                }
                placeholder="Email"
                className="rounded-md border border-white/15 bg-black/25 px-3 py-2 font-michroma text-[9px] text-white outline-none transition placeholder:text-white/55 focus:border-[var(--court-accent)] lg:px-4 lg:py-3 lg:text-[10px]"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex items-center justify-center gap-2 rounded-md border border-[rgb(var(--court-accent-rgb)/0.55)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-3 py-2 font-michroma text-[7px] uppercase text-[var(--court-accent)] shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.14)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.2)] hover:text-white hover:shadow-[0_0_24px_rgb(var(--court-accent-rgb)/0.28)] disabled:cursor-not-allowed disabled:opacity-60 lg:px-4 lg:py-3 lg:text-[10px]"
              >
                <Mail className="h-3 w-3 transition group-hover:brightness-125 lg:h-4 lg:w-4" />
                {isSubmitting ? "Sending Link..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setAuthError("");
                  setAuthMessage("");
                }}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 font-michroma text-[7px] uppercase text-white/45 transition hover:border-white/25 hover:text-white lg:px-4 lg:py-3 lg:text-[10px]"
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailAuth} className="grid gap-2 lg:gap-3">
              <div className="grid grid-cols-2 rounded-md border border-white/10 bg-black/25 p-0.5">
                {(["signin", "signup"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setAuthMode(mode);
                      setAuthError("");
                      setAuthMessage("");
                    }}
                    className={`rounded px-2 py-1.5 font-michroma text-[8px] uppercase transition lg:text-[9px] ${
                      authMode === mode
                        ? "bg-[rgb(var(--court-accent-rgb)/0.2)] text-[var(--court-accent)]"
                        : "text-white/60 hover:bg-white/5 hover:text-white/80"
                    }`}
                  >
                    {mode === "signin" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              <label htmlFor="signin-email" className="sr-only">
                Email address
              </label>
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                aria-invalid={Boolean(authError)}
                aria-describedby={
                  authError || authMessage ? "signin-status" : undefined
                }
                placeholder="Email"
                className="rounded-md border border-white/15 bg-black/25 px-3 py-2 font-michroma text-[9px] text-white outline-none transition placeholder:text-white/55 focus:border-[var(--court-accent)] lg:px-4 lg:py-3 lg:text-[10px]"
              />

              <div className="relative">
                <label htmlFor="signin-password" className="sr-only">
                  Password
                </label>
                <input
                  id="signin-password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  autoComplete={
                    authMode === "signup" ? "new-password" : "current-password"
                  }
                  aria-invalid={Boolean(authError)}
                  aria-describedby={
                    authError || authMessage ? "signin-status" : undefined
                  }
                  placeholder="Password"
                  className="w-full rounded-md border border-white/15 bg-black/25 px-3 py-2 pr-9 font-michroma text-[9px] text-white outline-none transition placeholder:text-white/55 focus:border-[var(--court-accent)] lg:px-4 lg:py-3 lg:pr-11 lg:text-[10px]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setIsPasswordVisible(
                      (currentVisibility) => !currentVisibility,
                    )
                  }
                  aria-label={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/35 transition hover:text-[var(--court-accent)] lg:right-3"
                >
                  {isPasswordVisible ? (
                    <EyeOff className="h-3 w-3 lg:h-4 lg:w-4" />
                  ) : (
                    <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                  )}
                </button>
              </div>

              {authMode === "signup" && (
                <PasswordRequirements password={password} compact />
              )}

              {authMode === "signin" && (
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError("");
                      setAuthMessage(
                        "Email recovery is not available yet. Try the email you used when creating your account.",
                      );
                    }}
                    className="font-michroma text-[8px] uppercase text-white/60 transition hover:text-[var(--court-accent)] lg:text-[9px]"
                  >
                    Forgot Email?
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("forgot-password");
                      setAuthError("");
                      setAuthMessage("");
                    }}
                    className="font-michroma text-[8px] uppercase text-white/60 transition hover:text-[var(--court-accent)] lg:text-[9px]"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex items-center justify-center gap-2 rounded-md border border-[rgb(var(--court-accent-rgb)/0.55)] bg-[rgb(var(--court-accent-rgb)/0.1)] px-3 py-2 font-michroma text-[8px] uppercase text-[var(--court-accent)] shadow-[0_0_18px_rgb(var(--court-accent-rgb)/0.14)] transition hover:bg-[rgb(var(--court-accent-rgb)/0.2)] hover:text-white hover:shadow-[0_0_24px_rgb(var(--court-accent-rgb)/0.28)] disabled:cursor-not-allowed disabled:opacity-60 lg:px-4 lg:py-3 lg:text-[10px]"
              >
                <Mail className="h-3 w-3 transition group-hover:brightness-125 lg:h-4 lg:w-4" />
                {isSubmitting
                  ? "Checking Access..."
                  : authMode === "signin"
                    ? "Continue with Email"
                    : "Create Account"}
              </button>

              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={isSubmitting}
                className="group flex items-center justify-center gap-2 rounded-md border border-[#4285F4]/45 bg-[#08234f]/70 px-3 py-2 font-michroma text-[8px] uppercase text-[#8ab4f8] shadow-[0_0_16px_rgba(66,133,244,0.12)] transition hover:border-[rgb(var(--court-accent-rgb)/0.7)] hover:bg-[#0b2f69]/80 hover:text-white hover:shadow-[0_0_22px_rgba(66,133,244,0.24)] disabled:cursor-not-allowed disabled:opacity-60 lg:px-4 lg:py-3 lg:text-[10px]"
              >
                <GoogleMark />
                {isSubmitting ? "Opening Google..." : "Continue with Google"}
              </button>
            </form>
          )}

          {(authError || authMessage) && (
            <p
              id="signin-status"
              role={authError ? "alert" : "status"}
              className={`mt-2 text-center font-michroma text-[8px] leading-relaxed lg:text-[9px] ${
                authError ? "text-red-300" : "text-[var(--court-accent)]"
              }`}
            >
              {authError || authMessage}
            </p>
          )}

          <p className="mt-2.5 text-center font-michroma text-[8px] leading-relaxed text-white/55 lg:mt-4 lg:text-[9px]">
            Your account keeps saved lineups, favorites, and scouting activity
            connected.
          </p>

          <Link
            href="/players"
            className="mt-2.5 block text-center font-michroma text-[8px] uppercase tracking-[0.2em] text-white/60 transition hover:text-[var(--court-accent)] lg:mt-3 lg:text-[9px] lg:tracking-[0.25em]"
          >
            Continue Browsing
          </Link>
        </div>
      </section>
    </main>
  );
}

