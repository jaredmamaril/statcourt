"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EmailOtpType, User } from "@supabase/supabase-js";
import { supabase } from "../../components/supabase-client";
import {
  consumePendingAuthRedirect,
  consumePendingAuthProvider,
  trackUserSignin,
} from "../../lib/user-signins";
import { getSafeInternalRedirectPath } from "../../lib/safe-redirect";

const allowedEmailOtpTypes = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function getEmailOtpType(value: string | null): EmailOtpType | null {
  if (!value || !allowedEmailOtpTypes.has(value)) return null;

  return value as EmailOtpType;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Connecting account...");

  useEffect(() => {
    async function completeAuthFlow() {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const code = params.get("code");
      const tokenHash = params.get("token_hash") ?? hashParams.get("token_hash");
      const otpType = getEmailOtpType(
        params.get("type") ?? hashParams.get("type"),
      );
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const nextPath = getSafeInternalRedirectPath(
        params.get("next") ?? consumePendingAuthRedirect(),
        "/profile",
      );
      const provider = params.get("provider") ?? consumePendingAuthProvider();
      const authAction = params.get("auth_action") ?? hashParams.get("auth_action");
      const authError =
        params.get("error_description") ??
        params.get("error") ??
        hashParams.get("error_description") ??
        hashParams.get("error");

      if (authError) {
        if (provider === "google" && nextPath === "/settings") {
          router.replace("/settings?account_error=google_link_failed");
          return;
        }

        router.replace("/signin?error=auth_provider_failed");
        return;
      }

      let signedInUser: User | null = null;

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          const { data: existingSessionData } = await supabase.auth.getUser();

          if (existingSessionData.user) {
            await trackUserSignin(existingSessionData.user, provider);
            router.replace(nextPath);
            return;
          }

          setStatus("Could not complete sign in. Redirecting...");
          router.replace("/signin?error=auth_callback_failed");
          return;
        }

        signedInUser = data.user;
      } else if (tokenHash && otpType) {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType,
        });

        if (error) {
          setStatus("Could not complete sign in. Redirecting...");
          router.replace("/signin?error=auth_callback_failed");
          return;
        }

        signedInUser = data.user;
      } else if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setStatus("Could not complete sign in. Redirecting...");
          router.replace("/signin?error=auth_callback_failed");
          return;
        }

        signedInUser = data.user;
      } else {
        const { data } = await supabase.auth.getUser();

        if (data.user) {
          signedInUser = data.user;
        } else {
          router.replace("/signin?error=auth_callback_failed");
          return;
        }
      }

      if (!signedInUser) {
        router.replace("/signin?error=auth_callback_failed");
        return;
      }

      if (otpType === "email_change" || authAction === "email_change") {
        router.replace("/signin?notice=email_change_confirmed");
        return;
      }

      await trackUserSignin(signedInUser, provider);

      router.replace(nextPath);
    }

    completeAuthFlow();
  }, [router]);

  return (
    <main className="page-enter flex min-h-svh items-center justify-center bg-background px-4 text-white">
      <div className="rounded-lg border border-[rgb(var(--court-accent-rgb)/0.35)] bg-[color:color-mix(in_srgb,var(--court-panel)_85%,transparent)] px-4 py-3 text-center shadow-[0_0_24px_rgb(var(--court-accent-rgb)/0.16)]">
        <p className="font-michroma text-[8px] uppercase text-[var(--court-accent)] lg:text-[10px]">
          {status}
        </p>
      </div>
    </main>
  );
}

