"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../components/supabase-client";
import {
  consumePendingAuthProvider,
  trackUserSignin,
} from "../../lib/user-signins";

function getSafeRedirectPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/profile";
  }

  return nextPath;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Connecting account...");

  useEffect(() => {
    async function completeAuthFlow() {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const code = params.get("code");
      const nextPath = getSafeRedirectPath(params.get("next"));
      const provider = params.get("provider") ?? consumePendingAuthProvider();
      const authError =
        params.get("error_description") ??
        params.get("error") ??
        hashParams.get("error_description") ??
        hashParams.get("error");

      if (authError) {
        router.replace(`/signin?error=${encodeURIComponent(authError)}`);
        return;
      }

      if (!code) {
        router.replace(nextPath);
        return;
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setStatus(error.message);
        router.replace(`/signin?error=${encodeURIComponent(error.message)}`);
        return;
      }

      await trackUserSignin(data.user, provider);

      router.replace(nextPath);
    }

    completeAuthFlow();
  }, [router]);

  return (
    <main className="page-enter flex min-h-svh items-center justify-center bg-background px-4 text-white">
      <div className="rounded-lg border border-[#1bc2ec]/35 bg-[#06131d]/85 px-4 py-3 text-center shadow-[0_0_24px_rgba(27,194,236,0.16)]">
        <p className="font-michroma text-[8px] uppercase text-[#1bc2ec] lg:text-[10px]">
          {status}
        </p>
      </div>
    </main>
  );
}
