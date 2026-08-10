"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../components/supabase-client";
import {
  consumePendingAuthProvider,
  trackUserSignin,
} from "../../lib/user-signins";
import { getSafeInternalRedirectPath } from "../../lib/safe-redirect";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Connecting account...");

  useEffect(() => {
    async function completeAuthFlow() {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const code = params.get("code");
      const nextPath = getSafeInternalRedirectPath(
        params.get("next"),
        "/profile",
      );
      const provider = params.get("provider") ?? consumePendingAuthProvider();
      const authError =
        params.get("error_description") ??
        params.get("error") ??
        hashParams.get("error_description") ??
        hashParams.get("error");

      if (authError) {
        router.replace("/signin?error=auth_provider_failed");
        return;
      }

      if (!code) {
        router.replace(nextPath);
        return;
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setStatus("Could not complete sign in. Redirecting...");
        router.replace("/signin?error=auth_callback_failed");
        return;
      }

      await trackUserSignin(data.user, provider);

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

